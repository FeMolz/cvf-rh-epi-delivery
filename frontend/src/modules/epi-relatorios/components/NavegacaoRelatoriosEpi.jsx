import { useLocation, useNavigate } from 'react-router-dom';

import { useAuth } from '../../../shared/auth/useAuth.js';
import { AbasModulo } from '../../../shared/components/AbasModulo.jsx';
import { SECOES_RELATORIOS_EPI } from '../constants/secoesRelatoriosEpi.js';
import { usuarioPodeGerenciarRelatoriosEpi } from './FormularioEmitirRelatorio.jsx';
import { IconeAbaRelatoriosEpi } from './IconeAbaRelatoriosEpi.jsx';

export function NavegacaoRelatoriosEpi() {
    const navegar = useNavigate();
    const { pathname } = useLocation();
    const { user } = useAuth();
    const podeGerenciar = usuarioPodeGerenciarRelatoriosEpi(user?.role);

    const abaAtiva = pathname.includes('/historico')
        ? 'historico'
        : pathname.includes('/ultimas')
          ? 'ultimas'
          : 'emitir';

    const secoesVisiveis = SECOES_RELATORIOS_EPI.filter(
        (secao) => secao.id === 'ultimas' || secao.id === 'historico' || (secao.id === 'emitir' && podeGerenciar)
    );

    const abas = secoesVisiveis.map((secao) => ({
        id: secao.id,
        rotulo: secao.rotulo,
        icone: <IconeAbaRelatoriosEpi id={secao.id} />
    }));

    function trocarAba(id) {
        const secao = SECOES_RELATORIOS_EPI.find((item) => item.id === id);

        if (secao) {
            navegar(secao.rota);
        }
    }

    return (
        <AbasModulo
            abaAtiva={abaAtiva}
            abas={abas}
            rotuloAria="Seções do módulo de relatórios de entrega de EPI"
            onTrocarAba={trocarAba}
        />
    );
}
