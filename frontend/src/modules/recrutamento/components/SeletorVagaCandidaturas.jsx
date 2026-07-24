import { useEffect, useState } from 'react';

import { listarVagasAdmin } from '../services/recrutamentoApi.js';

/**
 * @param {{
 *   token: string,
 *   valor: string,
 *   onChange: (anuncioVagaId: string) => void
 * }} props
 */
export function SeletorVagaCandidaturas({ token, valor, onChange }) {
    const [vagas, setVagas] = useState([]);
    const [carregando, setCarregando] = useState(true);

    useEffect(() => {
        let ativo = true;

        async function carregarVagas() {
            setCarregando(true);

            try {
                const [ativas, inativas, encerradas] = await Promise.all([
                    listarVagasAdmin(token, { status: 'ATIVA' }),
                    listarVagasAdmin(token, { status: 'INATIVA' }),
                    listarVagasAdmin(token, { status: 'ENCERRADA' })
                ]);

                if (ativo) {
                    const vagasUnicas = [...ativas, ...inativas, ...encerradas].filter(
                        (vaga, indice, lista) =>
                            lista.findIndex((item) => item.id === vaga.id) === indice
                    );
                    setVagas(vagasUnicas);
                }
            } catch {
                if (ativo) {
                    setVagas([]);
                }
            } finally {
                if (ativo) {
                    setCarregando(false);
                }
            }
        }

        carregarVagas();

        return () => {
            ativo = false;
        };
    }, [token]);

    return (
        <label className="recrutamento-seletor-vaga">
            <span className="recrutamento-seletor-vaga__rotulo">Filtrar por vaga</span>
            <select
                className="recrutamento-seletor-vaga__campo"
                value={valor}
                disabled={carregando}
                onChange={(evento) => onChange(evento.target.value)}
            >
                <option value="">{carregando ? 'Carregando vagas…' : 'Todas as vagas'}</option>
                {vagas.map((vaga) => (
                    <option key={vaga.id} value={vaga.id}>
                        {vaga.tituloVaga}
                    </option>
                ))}
            </select>
        </label>
    );
}
