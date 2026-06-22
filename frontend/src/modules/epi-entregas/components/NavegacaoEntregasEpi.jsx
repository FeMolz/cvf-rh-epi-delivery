import { useLocation, useNavigate } from 'react-router-dom';

import { AbasModulo } from '../../../shared/components/AbasModulo.jsx';
import { SECOES_ENTREGAS_EPI } from '../constants/secoesEntregasEpi.js';
import { IconeAbaEntregasEpi } from './IconeAbaEntregasEpi.jsx';

export function NavegacaoEntregasEpi() {
    const navegar = useNavigate();
    const { pathname } = useLocation();

    const abaAtiva = pathname.includes('/imediata') ? 'imediata' : 'registro';

    const abas = SECOES_ENTREGAS_EPI.map((secao) => ({
        id: secao.id,
        rotulo: secao.rotulo,
        icone: <IconeAbaEntregasEpi id={secao.id} />
    }));

    function trocarAba(id) {
        const secao = SECOES_ENTREGAS_EPI.find((item) => item.id === id);

        if (secao) {
            navegar(secao.rota);
        }
    }

    return (
        <AbasModulo
            abaAtiva={abaAtiva}
            abas={abas}
            rotuloAria="Seções do módulo de entregas de EPI"
            onTrocarAba={trocarAba}
        />
    );
}
