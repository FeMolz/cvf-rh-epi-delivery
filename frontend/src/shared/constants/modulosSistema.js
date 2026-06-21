import { PAPEL_ADMIN, PAPEL_ADMINISTRATIVO } from '../constants/papeis.js';

/**
 * Módulos do RH-System para navegação lateral.
 * Itens sem `rota` aparecem como "em breve".
 */
export const MODULOS_SISTEMA = [
    {
        id: 'dashboard',
        rotulo: 'Dashboard',
        rota: '/admin/dashboard',
        papeis: [PAPEL_ADMIN]
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
        papeis: [PAPEL_ADMIN, PAPEL_ADMINISTRATIVO],
        emBreve: true
    },
    {
        id: 'epi-deliveries',
        rotulo: 'Entregas de EPI',
        papeis: [PAPEL_ADMIN, PAPEL_ADMINISTRATIVO],
        emBreve: true
    },
    {
        id: 'epi-reports',
        rotulo: 'Relatórios de entrega',
        papeis: [PAPEL_ADMIN, PAPEL_ADMINISTRATIVO],
        emBreve: true
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
        papeis: [PAPEL_ADMIN, PAPEL_ADMINISTRATIVO],
        emBreve: true
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
