import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { useAuth } from '../../../shared/auth/useAuth.js';
import { CabecalhoListagemPainel } from '../../../shared/components/CabecalhoListagemPainel.jsx';
import { listarCargos } from '../../cargos/services/cargosApi.js';
import { FormularioFuncionarioEtapa1 } from '../../funcionarios/components/FormularioFuncionarioEtapa1.jsx';
import { FormularioFuncionarioEtapa2 } from '../../funcionarios/components/FormularioFuncionarioEtapa2.jsx';
import { FormularioFuncionarioEtapa3 } from '../../funcionarios/components/FormularioFuncionarioEtapa3.jsx';
import { IndicadorEtapasCadastro } from '../../funcionarios/components/IndicadorEtapasCadastro.jsx';
import { listarEmpresas } from '../../funcionarios/services/empresasApi.js';
import { criarFuncionario } from '../../funcionarios/services/funcionariosApi.js';
import { listarSetores } from '../../funcionarios/services/setoresApi.js';
import { montarPayloadFuncionario } from '../../funcionarios/utils/montarPayloadFuncionario.js';
import { filtrarEmpresasAtivasParaFuncionario } from '../../funcionarios/utils/selecaoEmpresasFuncionario.js';
import { IconeAbaGerenciamento } from './IconeAbaGerenciamento.jsx';

export function PainelFuncionariosGerenciamento() {
    const { token } = useAuth();
    const navegar = useNavigate();

    const [etapaAtual, setEtapaAtual] = useState(1);
    const [dados, setDados] = useState({});
    const [cargos, setCargos] = useState([]);
    const [empresas, setEmpresas] = useState([]);
    const [setores, setSetores] = useState([]);
    const [carregandoOpcoes, setCarregandoOpcoes] = useState(true);
    const [salvando, setSalvando] = useState(false);
    const [erro, setErro] = useState('');

    useEffect(() => {
        let ativo = true;

        async function carregarOpcoes() {
            setCarregandoOpcoes(true);
            setErro('');

            try {
                const [listaCargos, listaEmpresas, listaSetores] = await Promise.all([
                    listarCargos(token),
                    listarEmpresas(token),
                    listarSetores(token)
                ]);

                if (ativo) {
                    setCargos(listaCargos);
                    setEmpresas(filtrarEmpresasAtivasParaFuncionario(listaEmpresas));
                    setSetores(listaSetores);
                }
            } catch (erroCapturado) {
                if (ativo) {
                    setErro(
                        erroCapturado.message ||
                            'Não foi possível carregar empresas, cargos e setores.'
                    );
                }
            } finally {
                if (ativo) {
                    setCarregandoOpcoes(false);
                }
            }
        }

        carregarOpcoes();

        return () => {
            ativo = false;
        };
    }, [token]);

    async function finalizarCadastro(dadosCompletos) {
        setSalvando(true);
        setErro('');

        try {
            await criarFuncionario(montarPayloadFuncionario(dadosCompletos), token);
            navegar('/admin/funcionarios');
        } catch (erroCapturado) {
            setErro(erroCapturado.message || 'Não foi possível cadastrar o funcionário.');
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
        finalizarCadastro(dadosCompletos);
    }

    function aoContinuarEtapa2(dadosEtapa) {
        setDados((atual) => ({ ...atual, ...dadosEtapa }));
        setEtapaAtual(3);
    }

    function aoFinalizarEtapa2(dadosEtapa) {
        const dadosCompletos = { ...dados, ...dadosEtapa };
        setDados(dadosCompletos);
        finalizarCadastro(dadosCompletos);
    }

    function aoFinalizarEtapa3(dadosEtapa) {
        finalizarCadastro({ ...dados, ...dadosEtapa });
    }

    return (
        <section className="gerenciamento-painel listagem-painel">
            <CabecalhoListagemPainel
                icone={<IconeAbaGerenciamento id="funcionarios" />}
                titulo="Funcionários"
                descricao="Cadastre novos funcionários vinculados a empresas, cargos e setores."
            />

            <div className="listagem-painel__conteudo">
                <div className="cadastro-funcionario cadastro-funcionario--gerenciamento">
                    <IndicadorEtapasCadastro etapaAtual={etapaAtual} />

                    {erro ? (
                        <p className="mensagem mensagem--erro" role="alert">
                            {erro}
                        </p>
                    ) : null}

                    {carregandoOpcoes ? (
                        <p className="estado-carregando">Carregando opções do formulário…</p>
                    ) : null}

                    <div className="cadastro-funcionario__corpo">
                        {!carregandoOpcoes && etapaAtual === 1 ? (
                            <FormularioFuncionarioEtapa1
                                valoresIniciais={dados}
                                cargos={cargos}
                                empresas={empresas}
                                setores={setores}
                                carregando={salvando}
                                rotuloSalvar="Cadastrar funcionário"
                                onContinuar={aoContinuarEtapa1}
                                onSalvar={aoSalvarEtapa1}
                            />
                        ) : null}

                        {!carregandoOpcoes && etapaAtual === 2 ? (
                            <FormularioFuncionarioEtapa2
                                valoresIniciais={dados}
                                carregando={salvando}
                                onVoltar={() => setEtapaAtual(1)}
                                onContinuar={aoContinuarEtapa2}
                                onFinalizar={aoFinalizarEtapa2}
                            />
                        ) : null}

                        {!carregandoOpcoes && etapaAtual === 3 ? (
                            <FormularioFuncionarioEtapa3
                                valoresIniciais={dados}
                                carregando={salvando}
                                onVoltar={() => setEtapaAtual(2)}
                                onFinalizar={aoFinalizarEtapa3}
                            />
                        ) : null}
                    </div>
                </div>
            </div>
        </section>
    );
}
