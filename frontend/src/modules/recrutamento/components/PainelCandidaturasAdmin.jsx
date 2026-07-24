import { useCallback, useEffect, useState } from 'react';

import { AreaMensagensFeedback } from '../../../shared/components/MensagemFeedback.jsx';
import { CabecalhoListagemPainel } from '../../../shared/components/CabecalhoListagemPainel.jsx';
import { DialogoConfirmacao } from '../../../shared/components/DialogoConfirmacao.jsx';
import { IconeAbaRecrutamento } from './IconeAbaRecrutamento.jsx';
import { TabelaCandidaturas } from './TabelaCandidaturas.jsx';
import {
    STATUS_CANDIDATURA,
    TIPO_VISUALIZACAO_CANDIDATURA
} from '../constants/recrutamentoConstantes.js';
import {
    atualizarStatusCandidatura,
    baixarCurriculo,
    gerarConviteCadastro,
    listarTodasCandidaturas,
    marcarVisualizacaoCandidatura,
    reativarCandidatura
} from '../services/recrutamentoApi.js';

/**
 * @param {{
 *   token: string,
 *   anuncioVagaId?: string,
 *   statusFiltro?: string,
 *   ordenacao?: string,
 *   exibirColunaVaga?: boolean,
 *   modoLixeira?: boolean,
 *   modoReativados?: boolean
 * }} props
 */
export function PainelCandidaturasAdmin({
    token,
    anuncioVagaId = '',
    statusFiltro = '',
    ordenacao = '',
    exibirColunaVaga = false,
    modoLixeira = false,
    modoReativados = false
}) {
    const [candidaturas, setCandidaturas] = useState([]);
    const [carregando, setCarregando] = useState(true);
    const [carregandoAcaoId, setCarregandoAcaoId] = useState('');
    const [erro, setErro] = useState('');
    const [aviso, setAviso] = useState('');
    const [sucesso, setSucesso] = useState('');
    const [candidaturaConvite, setCandidaturaConvite] = useState(null);
    const [candidaturaDetalhe, setCandidaturaDetalhe] = useState(null);

    const carregarCandidaturas = useCallback(async () => {
        setCarregando(true);
        setErro('');

        try {
            const resultado = await listarTodasCandidaturas(token, {
                anuncioVagaId: modoReativados ? undefined : anuncioVagaId || undefined,
                status: modoLixeira
                    ? STATUS_CANDIDATURA.DESCARTADO
                    : statusFiltro || undefined,
                incluirDescartadas: modoLixeira,
                reativados: modoReativados,
                ordenacao: ordenacao || undefined
            });

            setCandidaturas(resultado.candidaturas || []);
        } catch (erroCapturado) {
            setErro(erroCapturado.message || 'Não foi possível carregar as candidaturas.');
            setCandidaturas([]);
        } finally {
            setCarregando(false);
        }
    }, [token, anuncioVagaId, statusFiltro, ordenacao, modoLixeira, modoReativados]);

    useEffect(() => {
        carregarCandidaturas();
    }, [carregarCandidaturas]);

    function atualizarCandidaturaLocal(candidaturaAtualizada) {
        setCandidaturas((lista) =>
            lista.map((item) =>
                item.id === candidaturaAtualizada.id ? { ...item, ...candidaturaAtualizada } : item
            )
        );
        setCandidaturaDetalhe((atual) =>
            atual?.id === candidaturaAtualizada.id ? { ...atual, ...candidaturaAtualizada } : atual
        );
    }

    async function abrirDetalheCandidatura(candidatura) {
        setCandidaturaDetalhe(candidatura);

        if (candidatura.descricaoVisualizadaEm) {
            return;
        }

        try {
            const atualizada = await marcarVisualizacaoCandidatura(
                candidatura.id,
                TIPO_VISUALIZACAO_CANDIDATURA.DESCRICAO,
                token
            );
            atualizarCandidaturaLocal(atualizada);
        } catch {
            // A visualização é best-effort; o detalhe continua aberto.
        }
    }

    async function alterarStatusCandidatura(candidaturaId, status) {
        setCarregandoAcaoId(candidaturaId);
        setErro('');

        try {
            await atualizarStatusCandidatura(candidaturaId, status, token);
            await carregarCandidaturas();
        } catch (erroCapturado) {
            setErro(erroCapturado.message || 'Não foi possível atualizar a candidatura.');
        } finally {
            setCarregandoAcaoId('');
        }
    }

    async function reativarCandidaturaDescartada(candidaturaId) {
        setCarregandoAcaoId(candidaturaId);
        setErro('');

        try {
            await reativarCandidatura(candidaturaId, token);
            await carregarCandidaturas();
        } catch (erroCapturado) {
            setErro(erroCapturado.message || 'Não foi possível reativar a candidatura.');
        } finally {
            setCarregandoAcaoId('');
        }
    }

    async function baixarCurriculoCandidatura(candidaturaId) {
        try {
            await baixarCurriculo(candidaturaId, token);
            setCandidaturas((lista) =>
                lista.map((item) =>
                    item.id === candidaturaId && !item.curriculoVisualizadoEm
                        ? { ...item, curriculoVisualizadoEm: new Date().toISOString() }
                        : item
                )
            );
        } catch (erroCapturado) {
            setErro(erroCapturado.message || 'Não foi possível baixar o currículo.');
        }
    }

    function solicitarConvite(candidaturaId) {
        const candidatura = candidaturas.find((item) => item.id === candidaturaId);
        if (candidatura) {
            setCandidaturaConvite(candidatura);
        }
    }

    async function confirmarConvite() {
        if (!candidaturaConvite) {
            return;
        }

        setCarregandoAcaoId(candidaturaConvite.id);
        setErro('');
        setAviso('');
        setSucesso('');

        try {
            const resultado = await gerarConviteCadastro(candidaturaConvite.id, token);
            setSucesso(
                `E-mail de cadastro enviado para ${resultado.emailEnviadoPara || candidaturaConvite.email}.`
            );
            setCandidaturaConvite(null);
            await carregarCandidaturas();
        } catch (erroCapturado) {
            setErro(erroCapturado.message || 'Não foi possível enviar o convite.');
        } finally {
            setCarregandoAcaoId('');
        }
    }

    const iconePainel = modoReativados ? 'reativados' : modoLixeira ? 'lixeira' : 'candidaturas';
    const tituloPainel = modoReativados ? 'Reativados' : modoLixeira ? 'Lixeira' : 'Candidaturas';
    const descricaoPainel = modoReativados
        ? 'Candidatos recuperados da lixeira, prontos para nova análise.'
        : modoLixeira
          ? 'Candidaturas descartadas permanecem aqui por até 60 dias antes da remoção definitiva.'
          : 'Acompanhe inscrições, altere status e envie convites de cadastro por e-mail.';

    return (
        <section className="gerenciamento-painel listagem-painel recrutamento-painel-candidaturas">
            <CabecalhoListagemPainel
                icone={<IconeAbaRecrutamento id={iconePainel} />}
                titulo={tituloPainel}
                descricao={descricaoPainel}
            />

            <div className="listagem-painel__conteudo">
                <AreaMensagensFeedback
                    erro={erro}
                    aviso={aviso}
                    sucesso={sucesso}
                    onLimparErro={() => setErro('')}
                    onLimparAviso={() => setAviso('')}
                    onLimparSucesso={() => setSucesso('')}
                />

                {carregando ? (
                    <p className="estado-carregando">Carregando candidaturas…</p>
                ) : (
                    <TabelaCandidaturas
                        candidaturas={candidaturas}
                        modoLixeira={modoLixeira}
                        exibirColunaVaga={exibirColunaVaga || modoReativados}
                        carregandoAcaoId={carregandoAcaoId}
                        candidaturaDetalhe={candidaturaDetalhe}
                        onAbrirDetalhe={abrirDetalheCandidatura}
                        onFecharDetalhe={() => setCandidaturaDetalhe(null)}
                        onAlterarStatus={alterarStatusCandidatura}
                        onBaixarCurriculo={baixarCurriculoCandidatura}
                        onGerarConvite={modoLixeira ? undefined : solicitarConvite}
                        onReativar={modoLixeira ? reativarCandidaturaDescartada : undefined}
                    />
                )}
            </div>

            <DialogoConfirmacao
                aberto={Boolean(candidaturaConvite)}
                titulo="Enviar convite de cadastro"
                mensagem={
                    candidaturaConvite
                        ? `Enviar e-mail de cadastro para ${candidaturaConvite.email}? O candidato passará para a aba Processo de aprovação.`
                        : ''
                }
                rotuloConfirmar="Enviar e-mail"
                rotuloCarregando="Enviando…"
                classeBotaoConfirmar="botao botao--primario"
                carregando={Boolean(candidaturaConvite && carregandoAcaoId === candidaturaConvite.id)}
                onConfirmar={confirmarConvite}
                onCancelar={() => setCandidaturaConvite(null)}
            />
        </section>
    );
}
