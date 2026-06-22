import { useCallback, useEffect, useState } from 'react';

import { useAuth } from '../../../shared/auth/useAuth.js';
import { CabecalhoListagemPainel } from '../../../shared/components/CabecalhoListagemPainel.jsx';
import { AreaMensagensFeedback } from '../../../shared/components/MensagemFeedback.jsx';
import { IconeModulo } from '../../../shared/components/IconeModulo.jsx';
import { NavegacaoEntregasEpi } from '../components/NavegacaoEntregasEpi.jsx';
import { TabelaEpisVencidos } from '../components/TabelaEpisVencidos.jsx';
import { buscarPainelEntregasEpi, registrarEntregaEpi } from '../services/epiEntregasApi.js';
import './entregasEpi.css';

export function EntregaImediataEpiPage() {
    const { token } = useAuth();
    const [carregando, setCarregando] = useState(true);
    const [processandoRapido, setProcessandoRapido] = useState('');
    const [erro, setErro] = useState('');
    const [mensagemSucesso, setMensagemSucesso] = useState('');
    const [episVencidos, setEpisVencidos] = useState([]);

    const carregarPainel = useCallback(async () => {
        const painel = await buscarPainelEntregasEpi(token);
        setEpisVencidos(painel.episVencidos || []);
    }, [token]);

    useEffect(() => {
        async function iniciar() {
            setCarregando(true);
            setErro('');

            try {
                await carregarPainel();
            } catch (erroCapturado) {
                setErro(erroCapturado.message || 'Não foi possível carregar os EPIs vencidos.');
            } finally {
                setCarregando(false);
            }
        }

        iniciar();
    }, [carregarPainel]);

    async function aoEntregarRapido(employeeId, caNumber) {
        const chave = `${employeeId}-${caNumber}`;
        setProcessandoRapido(chave);
        setErro('');
        setMensagemSucesso('');

        try {
            const resultado = await registrarEntregaEpi(
                { employeeId, caNumbers: [caNumber] },
                token
            );

            setMensagemSucesso(resultado.message || 'Entrega registrada com sucesso.');
            await carregarPainel();
        } catch (erroCapturado) {
            setErro(erroCapturado.message || 'Não foi possível registrar a entrega imediata.');
        } finally {
            setProcessandoRapido('');
        }
    }

    return (
        <section className="admin-pagina">
            <header className="admin-pagina__cabecalho">
                <h1>Entregas de EPI</h1>
                <p className="admin-pagina__subtitulo">
                    Renove EPIs com periodicidade vencida usando entrega imediata na data de hoje.
                </p>
            </header>

            <NavegacaoEntregasEpi />

            {carregando ? (
                <p className="estado-carregando">Carregando EPIs vencidos…</p>
            ) : (
                <>
                    <AreaMensagensFeedback
                        erro={erro}
                        sucesso={mensagemSucesso}
                        onLimparErro={() => setErro('')}
                        onLimparSucesso={() => setMensagemSucesso('')}
                    />

                    <section className="gerenciamento-painel listagem-painel">
                        <CabecalhoListagemPainel
                            icone={<IconeModulo id="epi-deliveries" />}
                            titulo="EPIs vencidos"
                            descricao="Funcionários com periodicidade esgotada. Use + para registrar a entrega com a data de hoje."
                        />

                        <div className="listagem-painel__conteudo">
                            <TabelaEpisVencidos
                                itens={episVencidos}
                                processandoChave={processandoRapido}
                                onEntregarRapido={aoEntregarRapido}
                            />
                        </div>
                    </section>
                </>
            )}
        </section>
    );
}
