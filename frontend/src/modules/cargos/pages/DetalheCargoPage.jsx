import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';

import { useAuth } from '../../../shared/auth/useAuth.js';
import { DialogoConfirmacao } from '../../../shared/components/DialogoConfirmacao.jsx';
import { PAPEL_ADMIN } from '../../../shared/constants/papeis.js';
import { formatarDataHora } from '../../../shared/utils/listagemUsuarios.js';
import { FormularioCargo } from '../components/FormularioCargo.jsx';
import { atualizarCargo, buscarCargoPorId, excluirCargo } from '../services/cargosApi.js';
import { cargoEstaAtivo, obterQuantidadeEpis, obterRotuloStatusCargo } from '../utils/listagemCargos.js';

export function DetalheCargoPage() {
    const { id } = useParams();
    const { token, user } = useAuth();
    const navegar = useNavigate();

    const [cargo, setCargo] = useState(null);
    const [carregando, setCarregando] = useState(true);
    const [salvando, setSalvando] = useState(false);
    const [erro, setErro] = useState('');
    const [aviso, setAviso] = useState('');
    const [exibirConfirmacaoExclusao, setExibirConfirmacaoExclusao] = useState(false);

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
        setErro('');

        try {
            const atualizado = await atualizarCargo(id, dados, token);
            setCargo(atualizado);
        } catch (erroCapturado) {
            setErro(erroCapturado.message || 'Não foi possível salvar as alterações.');
            throw erroCapturado;
        } finally {
            setSalvando(false);
        }
    }

    function aoSolicitarExclusao() {
        setExibirConfirmacaoExclusao(true);
    }

    async function confirmarExclusao() {
        setSalvando(true);
        setErro('');
        setAviso('');

        try {
            await excluirCargo(id, token);
            navegar('/admin/cargos');
        } catch (erroCapturado) {
            if (erroCapturado.statusCode === 409) {
                setAviso(
                    erroCapturado.message ||
                        'Não é possível excluir este cargo enquanto houver funcionários vinculados a ele.'
                );
            } else {
                setErro(erroCapturado.message || 'Não foi possível excluir o cargo.');
            }

            setSalvando(false);
            setExibirConfirmacaoExclusao(false);
        }
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

    const podeExcluir = user?.role === PAPEL_ADMIN && cargoEstaAtivo(cargo);
    const cargoAtivo = cargoEstaAtivo(cargo);

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
                                <span
                                    className={`status-badge ${
                                        cargoAtivo ? 'status-badge--online' : 'status-badge--offline'
                                    }`}
                                >
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
                            <span>{cargoAtivo ? 'Atualizado em' : 'Excluído em'}</span>
                            <strong>
                                {formatarDataHora(cargoAtivo ? cargo.updatedAt : cargo.deletedAt)}
                            </strong>
                        </div>
                    </div>

                    {!cargoAtivo ? (
                        <p className="mensagem mensagem--aviso" role="status">
                            Este cargo está inativo e não pode ser editado ou excluído novamente.
                        </p>
                    ) : null}

                    {erro ? (
                        <p className="mensagem mensagem--erro" role="alert">
                            {erro}
                        </p>
                    ) : null}

                    {aviso ? (
                        <p className="mensagem mensagem--aviso" role="status">
                            {aviso}
                        </p>
                    ) : null}

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
                            podeExcluir ? (
                                <button
                                    className="botao botao--perigo"
                                    type="button"
                                    disabled={salvando}
                                    onClick={aoSolicitarExclusao}
                                >
                                    Excluir cargo
                                </button>
                            ) : null
                        }
                    />
                </div>
            </div>

            {cargoAtivo ? (
                <DialogoConfirmacao
                    aberto={exibirConfirmacaoExclusao}
                    titulo="Excluir cargo"
                    mensagem={`Tem certeza que deseja excluir o cargo "${cargo.name}"? Esta ação não pode ser desfeita.`}
                    rotuloConfirmar="Excluir cargo"
                    carregando={salvando}
                    onConfirmar={confirmarExclusao}
                    onCancelar={() => setExibirConfirmacaoExclusao(false)}
                />
            ) : null}
        </section>
    );
}
