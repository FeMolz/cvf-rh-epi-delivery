import { useCallback, useEffect, useMemo, useState } from 'react';

import { useAuth } from '../../../shared/auth/useAuth.js';
import { CabecalhoListagemPainel } from '../../../shared/components/CabecalhoListagemPainel.jsx';
import { listarPapeisAtribuiveis } from '../../../shared/utils/hierarquiaPapeis.js';
import { listarEmpresas } from '../../funcionarios/services/empresasApi.js';
import { FormularioCadastroUsuario } from '../../usuarios/components/FormularioCadastroUsuario.jsx';
import { cadastrarUsuario, listarUsuarios } from '../../usuarios/services/usuariosApi.js';
import { IconeAbaGerenciamento } from './IconeAbaGerenciamento.jsx';
import { ListaUsuariosCadastrados } from './ListaUsuariosCadastrados.jsx';

export function PainelUsuariosGerenciamento() {
    const { token, user } = useAuth();
    const [carregandoCadastro, setCarregandoCadastro] = useState(false);
    const [carregandoLista, setCarregandoLista] = useState(true);
    const [usuarios, setUsuarios] = useState([]);
    const [totalEmpresas, setTotalEmpresas] = useState(0);
    const [erro, setErro] = useState('');

    const papeisDisponiveis = useMemo(
        () => listarPapeisAtribuiveis(user?.role),
        [user?.role]
    );

    const carregarDados = useCallback(async () => {
        setCarregandoLista(true);
        setErro('');

        try {
            const [listaUsuarios, empresas] = await Promise.all([
                listarUsuarios(token),
                listarEmpresas(token).catch(() => [])
            ]);

            setUsuarios(listaUsuarios);
            setTotalEmpresas(empresas.length);
        } catch (erroCapturado) {
            setErro(erroCapturado.message || 'Não foi possível carregar os usuários.');
        } finally {
            setCarregandoLista(false);
        }
    }, [token]);

    useEffect(() => {
        carregarDados();
    }, [carregarDados]);

    async function aoCadastrar(dados) {
        setCarregandoCadastro(true);
        setErro('');

        try {
            await cadastrarUsuario(dados, token);
            await carregarDados();
        } catch (erroCapturado) {
            setErro(erroCapturado.message || 'Não foi possível cadastrar o usuário.');
            throw erroCapturado;
        } finally {
            setCarregandoCadastro(false);
        }
    }

    return (
        <section className="gerenciamento-painel listagem-painel">
            <CabecalhoListagemPainel
                icone={<IconeAbaGerenciamento id="usuarios" />}
                titulo="Usuários"
                descricao="Gerenciamento de acessos: criar e remover usuários do portal."
            />

            <div className="listagem-painel__conteudo">
                {erro ? (
                    <p className="mensagem mensagem--erro" role="alert">
                        {erro}
                    </p>
                ) : null}

                <div className="gerenciamento-secao">
                    <header className="gerenciamento-secao__cabecalho">
                        <h3>Criar Novo Acesso</h3>
                        <p>
                            Cadastre novos usuários com papel e senha inicial. O tipo de acesso define
                            as permissões no portal.
                        </p>
                    </header>

                    <FormularioCadastroUsuario
                        variante="acesso"
                        papeisDisponiveis={papeisDisponiveis}
                        onSubmit={aoCadastrar}
                        carregando={carregandoCadastro}
                    />
                </div>

                {carregandoLista ? (
                    <p className="estado-carregando">Carregando usuários cadastrados…</p>
                ) : (
                    <ListaUsuariosCadastrados
                        usuarios={usuarios}
                        totalEmpresas={totalEmpresas}
                        usuarioAtualId={user?.id}
                        token={token}
                        onUsuarioRemovido={carregarDados}
                    />
                )}
            </div>
        </section>
    );
}
