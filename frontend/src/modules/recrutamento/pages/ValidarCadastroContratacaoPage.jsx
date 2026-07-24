import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';

import { useAuth } from '../../../shared/auth/useAuth.js';
import { AreaMensagensFeedback } from '../../../shared/components/MensagemFeedback.jsx';
import { DialogoConfirmacao } from '../../../shared/components/DialogoConfirmacao.jsx';
import { listarCargos } from '../../cargos/services/cargosApi.js';
import { FormularioFuncionarioEtapa1 } from '../../funcionarios/components/FormularioFuncionarioEtapa1.jsx';
import { FormularioFuncionarioEtapa2 } from '../../funcionarios/components/FormularioFuncionarioEtapa2.jsx';
import { FormularioFuncionarioEtapa3 } from '../../funcionarios/components/FormularioFuncionarioEtapa3.jsx';
import { IndicadorEtapasCadastro } from '../../funcionarios/components/IndicadorEtapasCadastro.jsx';
import { listarEmpresas } from '../../funcionarios/services/empresasApi.js';
import { listarSetores } from '../../funcionarios/services/setoresApi.js';
import { filtrarEmpresasAtivasParaFuncionario } from '../../funcionarios/utils/selecaoEmpresasFuncionario.js';
import { filtrarSetoresAtivosParaFuncionario } from '../../funcionarios/utils/selecaoSetoresFuncionario.js';
import { STATUS_CADASTRO_CONTRATACAO } from '../constants/recrutamentoConstantes.js';
import {
    atualizarStatusCadastroContratacao,
    obterCadastroContratacao
} from '../services/recrutamentoApi.js';
import './recrutamento.css';

export function ValidarCadastroContratacaoPage() {
    const { id } = useParams();
    const { token } = useAuth();
    const navegar = useNavigate();

    const [etapaAtual, setEtapaAtual] = useState(1);
    const [dados, setDados] = useState({});
    const [cargos, setCargos] = useState([]);
    const [empresas, setEmpresas] = useState([]);
    const [setores, setSetores] = useState([]);
    const [carregando, setCarregando] = useState(true);
    const [salvando, setSalvando] = useState(false);
    const [erro, setErro] = useState('');
    const [confirmarNegacao, setConfirmarNegacao] = useState(false);

    useEffect(() => {
        let ativo = true;

        async function carregar() {
            setCarregando(true);
            setErro('');

            try {
                const [cadastro, listaCargos, listaEmpresas, listaSetores] = await Promise.all([
                    obterCadastroContratacao(id, token),
                    listarCargos(token),
                    listarEmpresas(token),
                    listarSetores(token)
                ]);

                if (!ativo) {
                    return;
                }

                if (cadastro.status !== STATUS_CADASTRO_CONTRATACAO.AGUARDANDO_ANALISE_RH) {
                    setErro('Este cadastro não está aguardando análise do RH.');
                    setCarregando(false);
                    return;
                }

                setDados({
                    name: cadastro.name || '',
                    cpf: cadastro.cpf || '',
                    email: cadastro.email || '',
                    telefone: cadastro.telefone || '',
                    birthDate: String(cadastro.birthDate || '').slice(0, 10),
                    admissionDate: String(cadastro.admissionDate || new Date().toISOString()).slice(
                        0,
                        10
                    ),
                    companyId: cadastro.companyId,
                    roleId: cadastro.roleId,
                    setorId: cadastro.setorId,
                    nacionalidade: cadastro.nacionalidade || '',
                    estadoCivil: cadastro.estadoCivil || '',
                    racaCor: cadastro.racaCor || '',
                    filiacao: cadastro.filiacao || '',
                    grauInstrucao: cadastro.grauInstrucao || '',
                    numeroCtps: cadastro.numeroCtps || '',
                    serieCtps: cadastro.serieCtps || '',
                    numeroDependentes: String(cadastro.numeroDependentes ?? ''),
                    pis: cadastro.pis || '',
                    chavePix: cadastro.chavePix || '',
                    cep: cadastro.cep || '',
                    logradouro: cadastro.logradouro || '',
                    numeroEndereco: cadastro.numeroEndereco || '',
                    complemento: cadastro.complemento || '',
                    bairro: cadastro.bairro || '',
                    cidade: cadastro.cidade || '',
                    estado: cadastro.estado || '',
                    valeTransporte: Boolean(cadastro.valeTransporte),
                    valeAlimentacao: Boolean(cadastro.valeAlimentacao),
                    planoSaude: Boolean(cadastro.planoSaude)
                });

                setCargos(listaCargos);
                setEmpresas(filtrarEmpresasAtivasParaFuncionario(listaEmpresas));
                setSetores(filtrarSetoresAtivosParaFuncionario(listaSetores));
            } catch (erroCapturado) {
                if (ativo) {
                    setErro(erroCapturado.message || 'Não foi possível carregar o cadastro.');
                }
            } finally {
                if (ativo) {
                    setCarregando(false);
                }
            }
        }

        carregar();

        return () => {
            ativo = false;
        };
    }, [id, token]);

    async function aceitarCadastro(dadosCompletos) {
        setSalvando(true);
        setErro('');

        try {
            await atualizarStatusCadastroContratacao(
                id,
                {
                    status: STATUS_CADASTRO_CONTRATACAO.CONTRATADO,
                    admissionDate: dadosCompletos.admissionDate,
                    valeTransporte: Boolean(dadosCompletos.valeTransporte),
                    valeAlimentacao: Boolean(dadosCompletos.valeAlimentacao),
                    planoSaude: Boolean(dadosCompletos.planoSaude)
                },
                token
            );
            navegar('/admin/funcionarios');
        } catch (erroCapturado) {
            setErro(erroCapturado.message || 'Não foi possível aceitar o cadastro.');
            setSalvando(false);
        }
    }

    async function negarCadastro() {
        setSalvando(true);
        setErro('');

        try {
            await atualizarStatusCadastroContratacao(
                id,
                { status: STATUS_CADASTRO_CONTRATACAO.DESCONTINUADO },
                token
            );
            navegar('/admin/recrutamento');
        } catch (erroCapturado) {
            setErro(erroCapturado.message || 'Não foi possível negar o cadastro.');
            setSalvando(false);
            setConfirmarNegacao(false);
        }
    }

    function aoContinuarEtapa1(dadosEtapa) {
        setDados((atual) => ({ ...atual, ...dadosEtapa }));
        setEtapaAtual(2);
    }

    function aoContinuarEtapa2(dadosEtapa) {
        setDados((atual) => ({ ...atual, ...dadosEtapa }));
        setEtapaAtual(3);
    }

    function aoFinalizarEtapa3(dadosEtapa) {
        aceitarCadastro({ ...dados, ...dadosEtapa });
    }

    return (
        <section className="admin-pagina">
            <header className="admin-pagina__cabecalho admin-pagina__cabecalho--com-acoes">
                <div>
                    <h1>Validar cadastro do candidato</h1>
                    <p className="admin-pagina__subtitulo">
                        Revise os dados preenchidos pelo candidato. Cargo, empresa e setor estão
                        bloqueados conforme a vaga.
                    </p>
                </div>
                <div className="admin-pagina__acoes">
                    <Link className="botao botao--secundario" to="/admin/recrutamento">
                        Voltar
                    </Link>
                    <button
                        className="botao botao--perigo"
                        type="button"
                        disabled={salvando || carregando}
                        onClick={() => setConfirmarNegacao(true)}
                    >
                        Negar
                    </button>
                </div>
            </header>

            <AreaMensagensFeedback erro={erro} onLimparErro={() => setErro('')} />

            {carregando ? (
                <p className="estado-carregando">Carregando cadastro…</p>
            ) : (
                <div className="cadastro-funcionario">
                    <IndicadorEtapasCadastro etapaAtual={etapaAtual} />

                    <div className="cadastro-funcionario__corpo">
                        {etapaAtual === 1 ? (
                            <FormularioFuncionarioEtapa1
                                valoresIniciais={dados}
                                cargos={cargos}
                                empresas={empresas}
                                setores={setores}
                                carregando={salvando}
                                vinculosBloqueados
                                rotuloContinuar="Continuar para endereço"
                                onContinuar={aoContinuarEtapa1}
                                onCancelar={() => navegar('/admin/recrutamento')}
                            />
                        ) : null}

                        {etapaAtual === 2 ? (
                            <FormularioFuncionarioEtapa2
                                valoresIniciais={dados}
                                carregando={salvando}
                                onVoltar={() => setEtapaAtual(1)}
                                onContinuar={aoContinuarEtapa2}
                            />
                        ) : null}

                        {etapaAtual === 3 ? (
                            <FormularioFuncionarioEtapa3
                                valoresIniciais={dados}
                                carregando={salvando}
                                onVoltar={() => setEtapaAtual(2)}
                                onFinalizar={aoFinalizarEtapa3}
                                rotuloFinalizar="Aceitar e contratar"
                            />
                        ) : null}
                    </div>
                </div>
            )}

            <DialogoConfirmacao
                aberto={confirmarNegacao}
                titulo="Negar cadastro"
                mensagem="Ao negar, o processo será cancelado e o candidato será movido para a lixeira."
                rotuloConfirmar="Negar cadastro"
                rotuloCarregando="Negando…"
                carregando={salvando}
                onConfirmar={negarCadastro}
                onCancelar={() => setConfirmarNegacao(false)}
            />
        </section>
    );
}
