import { useCallback, useEffect, useMemo, useState } from 'react';
import { Navigate } from 'react-router-dom';

import { useAuth } from '../../../shared/auth/useAuth.js';
import { CabecalhoListagemPainel } from '../../../shared/components/CabecalhoListagemPainel.jsx';
import { IconeModulo } from '../../../shared/components/IconeModulo.jsx';
import { AreaMensagensFeedback } from '../../../shared/components/MensagemFeedback.jsx';
import {
    FormularioEmitirRelatorio,
    usuarioPodeGerenciarRelatoriosEpi
} from '../components/FormularioEmitirRelatorio.jsx';
import { TabelaPreviewEntregasRelatorio } from '../components/TabelaPreviewEntregasRelatorio.jsx';
import {
    buscarPreviewRelatorioEntregaEpi,
    emitirRelatorioEntregaEpi,
    listarFuncionariosElegiveisEmissaoRelatorio
} from '../services/epiRelatoriosApi.js';
import './relatoriosEntregaEpi.css';

export function EmitirRelatorioEpiPage() {
    const { token, user } = useAuth();
    const podeGerenciar = usuarioPodeGerenciarRelatoriosEpi(user?.role);

    const [carregandoFuncionarios, setCarregandoFuncionarios] = useState(true);
    const [carregandoPreview, setCarregandoPreview] = useState(false);
    const [processandoEmissao, setProcessandoEmissao] = useState(false);
    const [erro, setErro] = useState('');
    const [mensagemSucesso, setMensagemSucesso] = useState('');

    const [funcionarios, setFuncionarios] = useState([]);
    const [funcionarioEmissaoId, setFuncionarioEmissaoId] = useState('');
    const [periodoInicio, setPeriodoInicio] = useState('');
    const [periodoFim, setPeriodoFim] = useState('');
    const [preview, setPreview] = useState(null);

    const funcionariosParaSelect = useMemo(
        () =>
            funcionarios.map((funcionario) => ({
                id: funcionario.id,
                name: funcionario.name,
                roleName: funcionario.roleName
            })),
        [funcionarios]
    );

    const previewPronto = Boolean(funcionarioEmissaoId && periodoInicio && periodoFim);

    const carregarFuncionarios = useCallback(async () => {
        const lista = await listarFuncionariosElegiveisEmissaoRelatorio(token);
        setFuncionarios(lista || []);
    }, [token]);

    useEffect(() => {
        async function iniciarFuncionarios() {
            setErro('');

            try {
                await carregarFuncionarios();
            } catch (erroCapturado) {
                setErro(erroCapturado.message || 'Não foi possível carregar os funcionários.');
            } finally {
                setCarregandoFuncionarios(false);
            }
        }

        iniciarFuncionarios();
    }, [carregarFuncionarios]);

    useEffect(() => {
        if (!previewPronto) {
            setPreview(null);
            return;
        }

        let cancelado = false;
        const temporizador = setTimeout(async () => {
            setCarregandoPreview(true);
            setErro('');

            try {
                const resultado = await buscarPreviewRelatorioEntregaEpi(token, {
                    employeeId: funcionarioEmissaoId,
                    periodoInicio,
                    periodoFim
                });

                if (!cancelado) {
                    setPreview(resultado);
                }
            } catch (erroCapturado) {
                if (!cancelado) {
                    setPreview(null);
                    setErro(erroCapturado.message || 'Não foi possível carregar a prévia do relatório.');
                }
            } finally {
                if (!cancelado) {
                    setCarregandoPreview(false);
                }
            }
        }, 350);

        return () => {
            cancelado = true;
            clearTimeout(temporizador);
        };
    }, [token, previewPronto, funcionarioEmissaoId, periodoInicio, periodoFim]);

    async function aoEmitirRelatorio() {
        if (!previewPronto) {
            setErro('Selecione o funcionário e o período para gerar o relatório.');
            return;
        }

        setProcessandoEmissao(true);
        setErro('');
        setMensagemSucesso('');

        try {
            await emitirRelatorioEntregaEpi(
                {
                    employeeId: funcionarioEmissaoId,
                    periodoInicio,
                    periodoFim
                },
                token
            );

            setMensagemSucesso('Relatório gerado com sucesso. Consulte a aba Últimas emissões.');
            setFuncionarioEmissaoId('');
            setPeriodoInicio('');
            setPeriodoFim('');
            setPreview(null);
            await carregarFuncionarios();
        } catch (erroCapturado) {
            setErro(erroCapturado.message || 'Não foi possível gerar o relatório.');
        } finally {
            setProcessandoEmissao(false);
        }
    }

    if (!podeGerenciar) {
        return <Navigate to="/admin/epis/relatorios/ultimas" replace />;
    }

    if (carregandoFuncionarios) {
        return <p className="estado-carregando">Carregando funcionários…</p>;
    }

    return (
        <>
            <AreaMensagensFeedback
                erro={erro}
                sucesso={mensagemSucesso}
                onLimparErro={() => setErro('')}
                onLimparSucesso={() => setMensagemSucesso('')}
            />

            <section className="gerenciamento-painel listagem-painel">
                <CabecalhoListagemPainel
                    icone={<IconeModulo id="epi-reports" />}
                    titulo="Emitir relatório"
                    descricao="Funcionários com entregas de EPI ainda não incluídas em relatório. Após a emissão, o nome sai da lista até haver novas entregas."
                />

                <div className="listagem-painel__conteudo">
                    <FormularioEmitirRelatorio
                        funcionarios={funcionariosParaSelect}
                        funcionarioId={funcionarioEmissaoId}
                        periodoInicio={periodoInicio}
                        periodoFim={periodoFim}
                        processando={processandoEmissao}
                        podeEmitir={podeGerenciar}
                        onAlterarFuncionario={setFuncionarioEmissaoId}
                        onAlterarPeriodoInicio={setPeriodoInicio}
                        onAlterarPeriodoFim={setPeriodoFim}
                        onEmitir={aoEmitirRelatorio}
                    />

                    <TabelaPreviewEntregasRelatorio
                        carregando={carregandoPreview || (previewPronto && !preview)}
                        textoPeriodoReferencia={preview?.textoPeriodoReferencia}
                        funcionario={preview?.employee}
                        entregas={preview?.entregas}
                    />
                </div>
            </section>
        </>
    );
}
