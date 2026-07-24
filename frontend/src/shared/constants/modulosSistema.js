import { PAPEL_ADMIN, PAPEL_ADMINISTRATIVO, PAPEL_ALMOXARIFADO } from '../constants/papeis.js';

/**
 * Módulos do RH-System para navegação lateral.
 * Itens sem `rota` aparecem como "em breve".
 */
export const MODULOS_SISTEMA = [
    {
        id: 'noticias',
        rotulo: 'Notícias',
        rota: '/admin/noticias',
        papeis: [PAPEL_ADMIN, PAPEL_ADMINISTRATIVO]
    },
    {
        id: 'gerenciamento',
        rotulo: 'Gerenciamento',
        rota: '/admin/gerenciamento',
        papeis: [PAPEL_ADMIN, PAPEL_ADMINISTRATIVO]
    },
    {
        id: 'roles',
        rotulo: 'Cargos',
        rota: '/admin/cargos',
        papeis: [PAPEL_ADMIN, PAPEL_ADMINISTRATIVO]
    },
    {
        id: 'employees',
        rotulo: 'Funcionários',
        rota: '/admin/funcionarios',
        papeis: [PAPEL_ADMIN, PAPEL_ADMINISTRATIVO]
    },
    {
        id: 'companies',
        rotulo: 'Empresas',
        rota: '/admin/empresas',
        papeis: [PAPEL_ADMIN, PAPEL_ADMINISTRATIVO]
    },
    {
        id: 'setores',
        rotulo: 'Setores',
        rota: '/admin/setores',
        papeis: [PAPEL_ADMIN, PAPEL_ADMINISTRATIVO]
    },
    {
        id: 'epis',
        rotulo: 'EPIs',
        rota: '/admin/epis',
        rotaExata: true,
        papeis: [PAPEL_ADMIN, PAPEL_ADMINISTRATIVO]
    },
    {
        id: 'epi-deliveries',
        rotulo: 'Entregas de EPI',
        rota: '/admin/epis/entregas',
        papeis: [PAPEL_ADMIN, PAPEL_ADMINISTRATIVO, PAPEL_ALMOXARIFADO]
    },
    {
        id: 'epi-reports',
        rotulo: 'Relatórios de entrega',
        rota: '/admin/epis/relatorios',
        papeis: [PAPEL_ADMIN, PAPEL_ADMINISTRATIVO]
    },
    {
        id: 'quesitos',
        rotulo: 'Quesitos',
        papeis: [PAPEL_ADMIN, PAPEL_ADMINISTRATIVO],
        emBreve: true
    },
    {
        id: 'recruitment',
        rotulo: 'Recrutamento',
        rota: '/admin/recrutamento',
        papeis: [PAPEL_ADMIN, PAPEL_ADMINISTRATIVO]
    },
    {
        id: 'ponto',
        rotulo: 'Ponto',
        papeis: [PAPEL_ADMIN, PAPEL_ADMINISTRATIVO],
        emBreve: true
    }
];

/**
 * @param {string} papel
 */
export function listarModulosVisiveis(papel) {
    return MODULOS_SISTEMA.filter((modulo) => modulo.papeis.includes(papel));
}
