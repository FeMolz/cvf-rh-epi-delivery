import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';

import { useAuth } from '../../../shared/auth/useAuth.js';
import { AreaMensagensFeedback } from '../../../shared/components/MensagemFeedback.jsx';
import { DialogoConfirmacao } from '../../../shared/components/DialogoConfirmacao.jsx';
import { PAPEIS_CADASTRO_USUARIO } from '../../../shared/constants/papeis.js';
import { formatarDataHora } from '../../../shared/utils/listagemUsuarios.js';
import { FormularioCargo } from '../components/FormularioCargo.jsx';
import {
    alterarSituacaoCargo,
    atualizarCargo,
    buscarCargoPorId
} from '../services/cargosApi.js';
import {
    cargoEstaAtivo,
    cargoPodeSerDesativado,
    obterClasseStatusCargo,
    obterQuantidadeEpis,
    obterQuantidadeFuncionarios,
    obterRotuloStatusCargo
} from '../utils/listagemCargos.js';

export function DetalheCargoPage() {
    const { id } = useParams();
    const { token, user } = useAuth();
    const navegar = useNavigate();

    const [cargo, setCargo] = useState(null);
    const [carregando, setCarregando] = useState(true);
    const [salvando, setSalvando] = useState(false);
    const [erro, setErro] = useState('');
    const [aviso, setAviso] = useState('');
    const [exibirConfirmacaoSituacao, setExibirConfirmacaoSituacao] = useState(false);

    useEffect(() => {
        let ativo = true;

        async function carregar() {
            setCarregando(true);
            setErro('');

            try {
                const dados = await buscarCargoPorId(id, token);

                if (ativo) {
                    setCargo(dados);
                }
            } catch (erroCapturado) {
                if (ativo) {
                    setErro(erroCapturado.message || 'Cargo não encontrado.');
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

    async function aoSalvar(dados) {
        setSalvando(true);

        try {
            const atualizado = await atualizarCargo(id, dados, token);
            setCargo(atualizado);
        } finally {
            setSalvando(false);
        }
    }

    async function confirmarAlteracaoSituacao() {
        /* v8 ignore next 3 — estado defensivo; botão só aparece com cargo carregado */
        if (!cargo) {
            return;
        }

        const ativar = !cargoEstaAtivo(cargo);
        setSalvando(true);
        setErro('');
        setAviso('');

        try {
            const atualizado = await alterarSituacaoCargo(id, ativar, token);
            setCargo(atualizado);
            setExibirConfirmacaoSituacao(false);

            if (!ativar) {
                navegar('/admin/cargos');
            }
        } catch (erroCapturado) {
            if (erroCapturado.statusCode === 409) {
                setAviso(
                    erroCapturado.message ||
                        'Não é possível desativar este cargo enquanto houver funcionários cadastrados nele. Altere o cargo dos funcionários antes de continuar.'
                );
            } else {
                setErro(
                    erroCapturado.message ||
                        `Não foi possível ${ativar ? 'reativar' : 'desativar'} o cargo.`
                );
            }

            setExibirConfirmacaoSituacao(false);
        } finally {
            setSalvando(false);
        }
    }

    function abrirConfirmacaoSituacao() {
        setExibirConfirmacaoSituacao(true);
    }

    function fecharConfirmacaoSituacao() {
        setExibirConfirmacaoSituacao(false);
    }

    function limparErro() {
        setErro('');
    }

    function limparAviso() {
        setAviso('');
    }

    if (carregando) {
        return <p className="estado-carregando">Carregando cargo…</p>;
    }

    if (!cargo) {
        return (
            <section className="admin-pagina">
                <p className="estado-erro" role="alert">
                    {erro || 'Cargo não encontrado.'}
                </p>
                <Link to="/admin/cargos">Voltar aos cargos</Link>
            </section>
        );
    }

    const podeGerenciarSituacao = PAPEIS_CADASTRO_USUARIO.includes(user?.role);
    const cargoAtivo = cargoEstaAtivo(cargo);
    const quantidadeFuncionarios = obterQuantidadeFuncionarios(cargo);
    const podeDesativar = cargoPodeSerDesativado(cargo);

    return (
        <section className="admin-pagina">
            <header className="admin-pagina__cabecalho">
                <h1>{cargo.name}</h1>
            </header>

            <div className="painel">
                <div className="detalhe-usuario">
                    <div className="detalhe-usuario__grade">
                        <div className="detalhe-usuario__campo">
                            <span>Status</span>
                            <strong>
                                <span className={obterClasseStatusCargo(cargo)}>
                                    {obterRotuloStatusCargo(cargo)}
                                </span>
                            </strong>
                        </div>
                        <div className="detalhe-usuario__campo">
                            <span>Criado em</span>
                            <strong>{formatarDataHora(cargo.createdAt)}</strong>
                        </div>
                        <div className="detalhe-usuario__campo">
                            <span>EPIs vinculados</span>
                            <strong>{obterQuantidadeEpis(cargo)}</strong>
                        </div>
                        <div className="detalhe-usuario__campo">
                            <span>Funcionários cadastrados</span>
                            <strong>{quantidadeFuncionarios}</strong>
                        </div>
                        <div className="detalhe-usuario__campo">
                            <span>{cargoAtivo ? 'Atualizado em' : 'Inativado em'}</span>
                            <strong>
                                {formatarDataHora(cargoAtivo ? cargo.updatedAt : cargo.deletedAt)}
                            </strong>
                        </div>
                    </div>

                    {!cargoAtivo ? (
                        <p className="mensagem mensagem--aviso" role="status">
                            Este cargo está inativo e não pode ser editado. Você pode reativá-lo se
                            necessário.
                        </p>
                    ) : quantidadeFuncionarios > 0 ? (
                        <p className="mensagem mensagem--aviso" role="status">
                            Este cargo possui funcionários cadastrados. Altere o cargo de cada
                            funcionário antes de desativá-lo.
                        </p>
                    ) : null}

                    <AreaMensagensFeedback
                        erro={erro}
                        aviso={aviso}
                        avisoTemporario
                        onLimparErro={limparErro}
                        onLimparAviso={limparAviso}
                    />

                    <FormularioCargo
                        key={cargo.id}
                        valoresIniciais={{
                            name: String(cargo.name || ''),
                            description: String(cargo.description || '')
                        }}
                        rotuloEnviar="Salvar alterações"
                        onSubmit={aoSalvar}
                        carregando={salvando}
                        somenteLeitura={!cargoAtivo}
                        linkVoltar={
                            <Link className="botao botao--secundario" to="/admin/cargos">
                                Voltar
                            </Link>
                        }
                        acaoExcluir={
                            podeGerenciarSituacao ? (
                                <button
                                    className={cargoAtivo ? 'botao botao--perigo' : 'botao botao--primario'}
                                    type="button"
                                    disabled={salvando || (cargoAtivo && !podeDesativar)}
                                    onClick={abrirConfirmacaoSituacao}
                                >
                                    {cargoAtivo ? 'Desativar cargo' : 'Reativar cargo'}
                                </button>
                            ) : null
                        }
                    />
                </div>
            </div>

            {podeGerenciarSituacao ? (
                <DialogoConfirmacao
                    aberto={exibirConfirmacaoSituacao}
                    titulo={cargoAtivo ? 'Desativar cargo' : 'Reativar cargo'}
                    mensagem={
                        cargoAtivo
                            ? `Desativar o cargo "${cargo.name}"? Ele deixará de aparecer nas listagens operacionais.`
                            : `Reativar o cargo "${cargo.name}"?`
                    }
                    rotuloConfirmar={cargoAtivo ? 'Desativar cargo' : 'Reativar cargo'}
                    carregando={salvando}
                    onConfirmar={confirmarAlteracaoSituacao}
                    onCancelar={fecharConfirmacaoSituacao}
                />
            ) : null}
        </section>
    );
}
