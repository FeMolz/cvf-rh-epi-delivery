import { useLocation, useNavigate } from 'react-router-dom';

import { AbasModulo } from '../../../shared/components/AbasModulo.jsx';
import { SECOES_EPIS } from '../constants/secoesEpis.js';
import { IconeAbaEpis } from './IconeAbaEpis.jsx';

export function NavegacaoEpis() {
    const navegar = useNavigate();
    const { pathname } = useLocation();

    const abaAtiva = pathname.includes('/vinculos') ? 'vinculos' : 'listagem';

    const abas = SECOES_EPIS.map((secao) => ({
        id: secao.id,
        rotulo: secao.rotulo,
        icone: <IconeAbaEpis id={secao.id} />
    }));

    function trocarAba(id) {
        const secao = SECOES_EPIS.find((item) => item.id === id);

        if (secao) {
            navegar(secao.rota);
        }
    }

    return (
        <AbasModulo
            abaAtiva={abaAtiva}
            abas={abas}
            rotuloAria="Seções do módulo de EPIs"
            onTrocarAba={trocarAba}
        />
    );
}
