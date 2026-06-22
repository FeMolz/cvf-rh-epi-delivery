import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';

import { useAuth } from '../../../shared/auth/useAuth.js';
import { AreaMensagensFeedback } from '../../../shared/components/MensagemFeedback.jsx';
import { listarCargos } from '../../cargos/services/cargosApi.js';
import { FormularioFuncionarioEtapa1 } from '../components/FormularioFuncionarioEtapa1.jsx';
import { FormularioFuncionarioEtapa2 } from '../components/FormularioFuncionarioEtapa2.jsx';
import { FormularioFuncionarioEtapa3 } from '../components/FormularioFuncionarioEtapa3.jsx';
import { IndicadorEtapasCadastro } from '../components/IndicadorEtapasCadastro.jsx';
import { listarEmpresas } from '../services/empresasApi.js';
import {
    atualizarFuncionario,
    buscarFuncionarioPorId
} from '../services/funcionariosApi.js';
import { listarSetores } from '../services/setoresApi.js';
import { mapearFuncionarioParaFormulario } from '../utils/mapearFuncionarioParaFormulario.js';
import { montarPayloadFuncionario } from '../utils/montarPayloadFuncionario.js';
import { montarEmpresasParaFormularioFuncionario } from '../utils/selecaoEmpresasFuncionario.js';

export function EdicaoFuncionarioPage() {
    const { id } = useParams();
    const { token } = useAuth();
    const navegar = useNavigate();

    const [etapaAtual, setEtapaAtual] = useState(1);
    const [dados, setDados] = useState({});
    const [nomeFuncionario, setNomeFuncionario] = useState('');
    const [cargos, setCargos] = useState([]);
    const [empresas, setEmpresas] = useState([]);
    const [setores, setSetores] = useState([]);
    const [carregando, setCarregando] = useState(true);
    const [salvando, setSalvando] = useState(false);
    const [erro, setErro] = useState('');

    useEffect(() => {
        let ativo = true;

        async function carregar() {
            setCarregando(true);
            setErro('');

            try {
                const [funcionario, listaCargos, listaEmpresas, listaSetores] = await Promise.all([
                    buscarFuncionarioPorId(id, token),
                    listarCargos(token),
                    listarEmpresas(token),
                    listarSetores(token)
                ]);

                if (ativo) {
                    const cargosDisponiveis = [...listaCargos];
                    const cargoAtualId = String(funcionario.roleId || '');
                    const cargoNaLista = cargosDisponiveis.some(
                        (cargo) => String(cargo.id) === cargoAtualId
                    );

                    if (cargoAtualId && !cargoNaLista && funcionario.role) {
                        cargosDisponiveis.unshift({
                            id: funcionario.role.id,
                            name: `${funcionario.role.name} (inativo)`,
                            deletedAt: 'inativo'
                        });
                    }

                    setNomeFuncionario(String(funcionario.name || ''));
                    setDados(mapearFuncionarioParaFormulario(funcionario));
                    setCargos(cargosDisponiveis);
                    setEmpresas(
                        montarEmpresasParaFormularioFuncionario(
                            listaEmpresas,
                            funcionario.companyId,
                            funcionario.company
                        )
                    );
                    setSetores(listaSetores);
                }
            } catch (erroCapturado) {
                if (ativo) {
                    setErro(erroCapturado.message || 'Funcionário não encontrado.');
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

    async function salvarAlteracoes(dadosCompletos) {
        setSalvando(true);
        setErro('');

        try {
            await atualizarFuncionario(id, montarPayloadFuncionario(dadosCompletos), token);
            navegar('/admin/funcionarios');
        } catch (erroCapturado) {
            setErro(erroCapturado.message || 'Não foi possível salvar as alterações.');
            setSalvando(false);
        }
    }

    function aoContinuarEtapa1(dadosEtapa) {
        setDados((atual) => ({ ...atual, ...dadosEtapa }));
        setEtapaAtual(2);
    }

    function aoSalvarEtapa1(dadosEtapa) {
        const dadosCompletos = { ...dados, ...dadosEtapa };
        setDados(dadosCompletos);
        salvarAlteracoes(dadosCompletos);
    }

    function aoContinuarEtapa2(dadosEtapa) {
        setDados((atual) => ({ ...atual, ...dadosEtapa }));
        setEtapaAtual(3);
    }

    function aoFinalizarEtapa2(dadosEtapa) {
        const dadosCompletos = { ...dados, ...dadosEtapa };
        setDados(dadosCompletos);
        salvarAlteracoes(dadosCompletos);
    }

    function aoFinalizarEtapa3(dadosEtapa) {
        salvarAlteracoes({ ...dados, ...dadosEtapa });
    }

    if (carregando) {
        return <p className="estado-carregando">Carregando funcionário…</p>;
    }

    if (erro && !nomeFuncionario) {
        return (
            <section className="admin-pagina">
                <p className="estado-erro" role="alert">
                    {erro}
                </p>
                <Link to="/admin/funcionarios">Voltar aos funcionários</Link>
            </section>
        );
    }

    return (
        <section className="admin-pagina admin-pagina--formulario-completo">
            <header className="admin-pagina__cabecalho admin-pagina__cabecalho--com-acoes">
                <h1>{nomeFuncionario || 'Editar funcionário'}</h1>
                <Link className="botao botao--secundario" to="/admin/funcionarios">
                    Voltar
                </Link>
            </header>

            <div className="cadastro-funcionario">
                <IndicadorEtapasCadastro etapaAtual={etapaAtual} />

                <AreaMensagensFeedback erro={erro} onLimparErro={() => setErro('')} />

                <div className="cadastro-funcionario__corpo">
                    {etapaAtual === 1 ? (
                        <FormularioFuncionarioEtapa1
                            valoresIniciais={dados}
                            cargos={cargos}
                            empresas={empresas}
                            setores={setores}
                            exibirStatus
                            carregando={salvando}
                            rotuloContinuar="Continuar para endereço"
                            onContinuar={aoContinuarEtapa1}
                            onSalvar={aoSalvarEtapa1}
                            onCancelar={() => navegar('/admin/funcionarios')}
                        />
                    ) : null}

                    {etapaAtual === 2 ? (
                        <FormularioFuncionarioEtapa2
                            valoresIniciais={dados}
                            carregando={salvando}
                            rotuloFinalizar="Salvar alterações"
                            onVoltar={() => setEtapaAtual(1)}
                            onContinuar={aoContinuarEtapa2}
                            onFinalizar={aoFinalizarEtapa2}
                        />
                    ) : null}

                    {etapaAtual === 3 ? (
                        <FormularioFuncionarioEtapa3
                            valoresIniciais={dados}
                            carregando={salvando}
                            rotuloFinalizar="Salvar alterações"
                            onVoltar={() => setEtapaAtual(2)}
                            onFinalizar={aoFinalizarEtapa3}
                        />
                    ) : null}
                </div>
            </div>
        </section>
    );
}
