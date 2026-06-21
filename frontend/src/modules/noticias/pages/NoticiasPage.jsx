import { useCallback, useEffect, useState } from 'react';

import { useAuth } from '../../../shared/auth/useAuth.js';
import { TabelaAniversariantes } from '../components/TabelaAniversariantes.jsx';
import { listarAniversariantesNoticias } from '../services/noticiasApi.js';
import './noticias.css';

const COLUNAS_ANIVERSARIO_PESSOAL = [
    { id: 'nome', rotulo: 'Nome' },
    { id: 'empresa', rotulo: 'Empresa' },
    { id: 'dataAniversario', rotulo: 'Data de aniversário' }
];

const COLUNAS_ANIVERSARIO_EMPRESA = [
    { id: 'nome', rotulo: 'Nome' },
    { id: 'empresa', rotulo: 'Empresa' },
    { id: 'tempoEmpresa', rotulo: 'Tempo de empresa' }
];

export function NoticiasPage() {
    const { token } = useAuth();
    const [dados, setDados] = useState({
        mesReferencia: '',
        aniversariantesPessoais: [],
        aniversariantesEmpresa: []
    });
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState('');

    const carregarAniversariantes = useCallback(async () => {
        setCarregando(true);
        setErro('');

        try {
            const resposta = await listarAniversariantesNoticias(token);
            setDados(resposta);
        } catch (erroCapturado) {
            setErro(erroCapturado.message || 'Não foi possível carregar os aniversariantes.');
        } finally {
            setCarregando(false);
        }
    }, [token]);

    useEffect(() => {
        carregarAniversariantes();
    }, [carregarAniversariantes]);

    return (
        <section className="admin-pagina">
            <header className="admin-pagina__cabecalho">
                <h1>Notícias</h1>
                <p className="admin-pagina__subtitulo">
                    Aniversariantes do mês entre todos os funcionários ativos de todas as empresas.
                    {dados.mesReferencia ? ` Referência: ${dados.mesReferencia}.` : ''}
                </p>
            </header>

            {carregando && <p className="estado-carregando">Carregando aniversariantes…</p>}
            {erro && <p className="estado-erro">{erro}</p>}

            {!carregando && !erro && (
                <div className="noticias-grade">
                    <TabelaAniversariantes
                        titulo="Aniversariantes pessoais"
                        colunas={COLUNAS_ANIVERSARIO_PESSOAL}
                        itens={dados.aniversariantesPessoais}
                    />
                    <TabelaAniversariantes
                        titulo="Aniversariantes de tempo de empresa"
                        colunas={COLUNAS_ANIVERSARIO_EMPRESA}
                        itens={dados.aniversariantesEmpresa}
                    />
                </div>
            )}
        </section>
    );
}
