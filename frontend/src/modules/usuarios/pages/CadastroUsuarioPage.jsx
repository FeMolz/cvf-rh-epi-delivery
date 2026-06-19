import { useMemo, useState } from 'react';

import { useAuth } from '../../../shared/auth/useAuth.js';
import { listarPapeisAtribuiveis } from '../../../shared/utils/hierarquiaPapeis.js';
import { cadastrarUsuario } from '../services/usuariosApi.js';
import { FormularioCadastroUsuario } from '../components/FormularioCadastroUsuario.jsx';

export function CadastroUsuarioPage() {
    const { token, user } = useAuth();
    const [carregando, setCarregando] = useState(false);

    const papeisDisponiveis = useMemo(
        () => listarPapeisAtribuiveis(user?.role),
        [user?.role]
    );

    async function aoCadastrar(dados) {
        setCarregando(true);

        try {
            await cadastrarUsuario(dados, token);
        } finally {
            setCarregando(false);
        }
    }

    return (
        <section className="admin-pagina admin-pagina--centralizada">
            <header className="admin-pagina__cabecalho">
                <h1>Cadastrar usuário</h1>
            </header>

            <div className="painel painel--formulario">
                <FormularioCadastroUsuario
                    papeisDisponiveis={papeisDisponiveis}
                    onSubmit={aoCadastrar}
                    carregando={carregando}
                />
            </div>
        </section>
    );
}
