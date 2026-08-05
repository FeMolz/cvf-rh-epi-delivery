import { useCallback, useEffect, useMemo, useState } from 'react';

import { useAuth } from '../../../shared/auth/useAuth.js';
import { AreaMensagensFeedback } from '../../../shared/components/MensagemFeedback.jsx';
import { CabecalhoListagemPainel } from '../../../shared/components/CabecalhoListagemPainel.jsx';
import { listarEmpresas } from '../../funcionarios/services/empresasApi.js';
import { IconeAbaGerenciamento } from './IconeAbaGerenciamento.jsx';
import { ListaUsuariosCadastrados } from './ListaUsuariosCadastrados.jsx';
import { listarUsuarios } from '../../usuarios/services/usuariosApi.js';

export function PainelListagemUsuarios() {
    const { token, user } = useAuth();
    const [carregandoLista, setCarregandoLista] = useState(true);
    const [usuarios, setUsuarios] = useState([]);
    const [totalEmpresas, setTotalEmpresas] = useState(0);
    const [erro, setErro] = useState('');

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

    const totalUsuarios = useMemo(() => usuarios.length, [usuarios]);

    return (
        <section className="gerenciamento-painel listagem-painel">
            <CabecalhoListagemPainel
                icone={<IconeAbaGerenciamento id="usuarios" />}
                titulo="Usuários"
                descricao={`${totalUsuarios} usuário${totalUsuarios === 1 ? '' : 's'} com acesso ao portal.`}
            />

            <div className="listagem-painel__conteudo">
                <AreaMensagensFeedback erro={erro} onLimparErro={() => setErro('')} />

                {carregandoLista ? (
                    <p className="estado-carregando">Carregando usuários…</p>
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
