import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';

import { useAuth } from '../../../shared/auth/useAuth.js';
import { DialogoConfirmacao } from '../../../shared/components/DialogoConfirmacao.jsx';
import { PAPEIS_CADASTRO_USUARIO } from '../../../shared/constants/papeis.js';
import { FormularioEmpresa } from '../components/FormularioEmpresa.jsx';
import {
    atualizarEmpresa,
    buscarEmpresaPorId,
    excluirEmpresa
} from '../services/empresasApi.js';
import { empresaEstaAtiva, obterRotuloStatusEmpresa } from '../utils/listagemEmpresas.js';

export function DetalheEmpresaPage() {
    const { id } = useParams();
    const { token, user } = useAuth();
    const navegar = useNavigate();

    const [empresa, setEmpresa] = useState(null);
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
                const dados = await buscarEmpresaPorId(id, token);

                if (ativo) {
                    setEmpresa(dados);
                }
            } catch (erroCapturado) {
                if (ativo) {
                    setErro(erroCapturado.message || 'Empresa não encontrada.');
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
            const atualizada = await atualizarEmpresa(id, dados, token);
            setEmpresa(atualizada);
        } catch (erroCapturado) {
            setErro(erroCapturado.message || 'Não foi possível salvar as alterações.');
            throw erroCapturado;
        } finally {
            setSalvando(false);
        }
    }

    async function confirmarExclusao() {
        setSalvando(true);
        setErro('');
        setAviso('');

        try {
            await excluirEmpresa(id, token);
            navegar('/admin/empresas');
        } catch (erroCapturado) {
            if (erroCapturado.statusCode === 409) {
                setAviso(
                    erroCapturado.message ||
                        'Não é possível excluir esta empresa enquanto houver funcionários vinculados a ela.'
                );
            } else {
                setErro(erroCapturado.message || 'Não foi possível excluir a empresa.');
            }

            setSalvando(false);
            setExibirConfirmacaoExclusao(false);
        }
    }

    if (carregando) {
        return <p className="estado-carregando">Carregando empresa…</p>;
    }

    if (!empresa) {
        return (
            <section className="admin-pagina">
                <p className="estado-erro" role="alert">
                    {erro || 'Empresa não encontrada.'}
                </p>
                <Link to="/admin/empresas">Voltar às empresas</Link>
            </section>
        );
    }

    const podeExcluir = PAPEIS_CADASTRO_USUARIO.includes(user?.role) && empresaEstaAtiva(empresa);
    const empresaAtiva = empresaEstaAtiva(empresa);

    return (
        <section className="admin-pagina">
            <header className="admin-pagina__cabecalho">
                <h1>{empresa.name}</h1>
            </header>

            <div className="painel">
                <div className="detalhe-usuario">
                    <div className="detalhe-usuario__grade">
                        <div className="detalhe-usuario__campo">
                            <span>Status</span>
                            <strong>
                                <span
                                    className={`status-badge ${
                                        empresaAtiva ? 'status-badge--online' : 'status-badge--offline'
                                    }`}
                                >
                                    {obterRotuloStatusEmpresa(empresa)}
                                </span>
                            </strong>
                        </div>
                        <div className="detalhe-usuario__campo">
                            <span>CNPJ</span>
                            <strong>{empresa.cnpj}</strong>
                        </div>
                    </div>

                    {!empresaAtiva ? (
                        <p className="mensagem mensagem--aviso" role="status">
                            Esta empresa está inativa e não pode ser editada ou excluída novamente.
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

                    <FormularioEmpresa
                        key={empresa.id}
                        valoresIniciais={{
                            name: String(empresa.name || ''),
                            cnpj: String(empresa.cnpj || '')
                        }}
                        rotuloEnviar="Salvar alterações"
                        onSubmit={aoSalvar}
                        carregando={salvando}
                        somenteLeitura={!empresaAtiva}
                        linkVoltar={
                            <Link className="botao botao--secundario" to="/admin/empresas">
                                Voltar
                            </Link>
                        }
                        acaoExcluir={
                            podeExcluir ? (
                                <button
                                    className="botao botao--perigo"
                                    type="button"
                                    disabled={salvando}
                                    onClick={() => setExibirConfirmacaoExclusao(true)}
                                >
                                    Excluir empresa
                                </button>
                            ) : null
                        }
                    />
                </div>
            </div>

            {empresaAtiva ? (
                <DialogoConfirmacao
                    aberto={exibirConfirmacaoExclusao}
                    titulo="Excluir empresa"
                    mensagem={`Tem certeza que deseja excluir a empresa "${empresa.name}"? Esta ação não pode ser desfeita.`}
                    rotuloConfirmar="Excluir empresa"
                    carregando={salvando}
                    onConfirmar={confirmarExclusao}
                    onCancelar={() => setExibirConfirmacaoExclusao(false)}
                />
            ) : null}
        </section>
    );
}
