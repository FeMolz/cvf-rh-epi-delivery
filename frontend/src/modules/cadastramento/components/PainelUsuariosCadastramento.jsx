import { useMemo, useState } from 'react';

import { useAuth } from '../../../shared/auth/useAuth.js';
import { AreaMensagensFeedback } from '../../../shared/components/MensagemFeedback.jsx';
import { CabecalhoListagemPainel } from '../../../shared/components/CabecalhoListagemPainel.jsx';
import { listarPapeisAtribuiveis } from '../../../shared/utils/hierarquiaPapeis.js';
import { IconeAbaGerenciamento } from '../../gerenciamento/components/IconeAbaGerenciamento.jsx';
import { FormularioCadastroUsuario } from '../../usuarios/components/FormularioCadastroUsuario.jsx';
import { cadastrarUsuario } from '../../usuarios/services/usuariosApi.js';

export function PainelUsuariosCadastramento() {
    const { token, user } = useAuth();
    const [carregandoCadastro, setCarregandoCadastro] = useState(false);
    const [erro, setErro] = useState('');
    const [sucesso, setSucesso] = useState('');

    const papeisDisponiveis = useMemo(
        () => listarPapeisAtribuiveis(user?.role),
        [user?.role]
    );

    async function aoCadastrar(dados) {
        setCarregandoCadastro(true);
        setErro('');
        setSucesso('');

        try {
            await cadastrarUsuario(dados, token);
            setSucesso('Usuário cadastrado com sucesso.');
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
                descricao="Cadastre novos acessos ao portal com papel e senha inicial."
            />

            <div className="listagem-painel__conteudo">
                <AreaMensagensFeedback
                    erro={erro}
                    sucesso={sucesso}
                    onLimparErro={() => setErro('')}
                    onLimparSucesso={() => setSucesso('')}
                />

                <div className="gerenciamento-secao">
                    <header className="gerenciamento-secao__cabecalho">
                        <h3>Criar Novo Acesso</h3>
                        <p>
                            O tipo de acesso define as permissões no portal. Para visualizar usuários
                            cadastrados, acesse Gerenciamento.
                        </p>
                    </header>

                    <FormularioCadastroUsuario
                        variante="acesso"
                        papeisDisponiveis={papeisDisponiveis}
                        onSubmit={aoCadastrar}
                        carregando={carregandoCadastro}
                    />
                </div>
            </div>
        </section>
    );
}
