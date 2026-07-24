import { useCallback, useEffect, useState } from 'react';

import { AreaMensagensFeedback } from '../../../shared/components/MensagemFeedback.jsx';
import { CabecalhoListagemPainel } from '../../../shared/components/CabecalhoListagemPainel.jsx';
import { DialogoConfirmacao } from '../../../shared/components/DialogoConfirmacao.jsx';
import { IconeAbaRecrutamento } from './IconeAbaRecrutamento.jsx';
import { TabelaProcessoAprovacao } from './TabelaProcessoAprovacao.jsx';
import { STATUS_CADASTRO_CONTRATACAO } from '../constants/recrutamentoConstantes.js';
import {
    atualizarStatusCadastroContratacao,
    listarCadastrosContratacao,
    reenviarEmailConviteCadastro
} from '../services/recrutamentoApi.js';

/**
 * @param {{ token: string }} props
 */
export function PainelProcessoAprovacao({ token }) {
    const [cadastros, setCadastros] = useState([]);
    const [carregando, setCarregando] = useState(true);
    const [carregandoAcaoId, setCarregandoAcaoId] = useState('');
    const [erro, setErro] = useState('');
    const [sucesso, setSucesso] = useState('');
    const [cadastroParaCancelar, setCadastroParaCancelar] = useState(null);

    const carregarCadastros = useCallback(async () => {
        setCarregando(true);
        setErro('');

        try {
            const lista = await listarCadastrosContratacao(token, { processoAprovacao: true });
            setCadastros(Array.isArray(lista) ? lista : []);
        } catch (erroCapturado) {
            setErro(erroCapturado.message || 'Não foi possível carregar o processo de aprovação.');
            setCadastros([]);
        } finally {
            setCarregando(false);
        }
    }, [token]);

    useEffect(() => {
        carregarCadastros();
    }, [carregarCadastros]);

    async function reenviarEmail(cadastroId) {
        setCarregandoAcaoId(cadastroId);
        setErro('');
        setSucesso('');

        try {
            const resultado = await reenviarEmailConviteCadastro(cadastroId, token);
            setSucesso(`E-mail reenviado para ${resultado.emailEnviadoPara || 'o candidato'}.`);
        } catch (erroCapturado) {
            setErro(erroCapturado.message || 'Não foi possível reenviar o e-mail.');
        } finally {
            setCarregandoAcaoId('');
        }
    }

    async function confirmarCancelamento() {
        if (!cadastroParaCancelar) {
            return;
        }

        const cadastroId = cadastroParaCancelar.id;
        setCarregandoAcaoId(cadastroId);
        setErro('');
        setSucesso('');

        try {
            await atualizarStatusCadastroContratacao(
                cadastroId,
                { status: STATUS_CADASTRO_CONTRATACAO.DESCONTINUADO },
                token
            );
            setCadastroParaCancelar(null);
            setSucesso('Processo cancelado. O candidato foi movido para a lixeira.');
            await carregarCadastros();
        } catch (erroCapturado) {
            setErro(erroCapturado.message || 'Não foi possível cancelar o processo.');
            setCadastroParaCancelar(null);
        } finally {
            setCarregandoAcaoId('');
        }
    }

    const nomeCandidato =
        cadastroParaCancelar?.name ||
        cadastroParaCancelar?.candidatura?.nomeCompleto ||
        'este candidato';

    return (
        <section className="gerenciamento-painel listagem-painel recrutamento-painel-aprovacao">
            <CabecalhoListagemPainel
                icone={<IconeAbaRecrutamento id="processo-aprovacao" />}
                titulo="Processo de aprovação"
                descricao="Acompanhe o retorno dos dados enviados aos candidatos e valide os cadastros."
            />

            <div className="listagem-painel__conteudo">
                <AreaMensagensFeedback
                    erro={erro}
                    sucesso={sucesso}
                    onLimparErro={() => setErro('')}
                    onLimparSucesso={() => setSucesso('')}
                />

                {carregando ? (
                    <p className="estado-carregando">Carregando processo de aprovação…</p>
                ) : (
                    <TabelaProcessoAprovacao
                        cadastros={cadastros}
                        carregandoAcaoId={carregandoAcaoId}
                        onReenviarEmail={reenviarEmail}
                        onCancelarProcesso={setCadastroParaCancelar}
                    />
                )}
            </div>

            <DialogoConfirmacao
                aberto={Boolean(cadastroParaCancelar)}
                titulo="Cancelar processo"
                mensagem={`Cancelar o processo de aprovação de ${nomeCandidato}? O candidato será movido para a lixeira.`}
                rotuloConfirmar="Cancelar processo"
                rotuloCancelar="Voltar"
                rotuloCarregando="Cancelando…"
                classeBotaoConfirmar="botao botao--perigo"
                carregando={Boolean(
                    cadastroParaCancelar && carregandoAcaoId === cadastroParaCancelar.id
                )}
                onConfirmar={confirmarCancelamento}
                onCancelar={() => setCadastroParaCancelar(null)}
            />
        </section>
    );
}
