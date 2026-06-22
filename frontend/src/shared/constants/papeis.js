export const PAPEL_ADMIN = 'ADMIN';
export const PAPEL_ADMINISTRATIVO = 'ADMINISTRATIVO';
export const PAPEL_ALMOXARIFADO = 'ALMOXARIFADO';
export const PAPEL_COLABORADOR = 'COLABORADOR';

export const PAPEIS_CADASTRO_USUARIO = [PAPEL_ADMIN, PAPEL_ADMINISTRATIVO];

/** Acesso ao painel administrativo (qualquer módulo). */
export const PAPEIS_AREA_ADMIN = [PAPEL_ADMIN, PAPEL_ADMINISTRATIVO, PAPEL_ALMOXARIFADO];

/** CRUD operacional do sistema (exceto entregas exclusivas do almoxarifado). */
export const PAPEIS_GESTAO_SISTEMA = [PAPEL_ADMIN, PAPEL_ADMINISTRATIVO];

export const ROTULOS_PAPEIS = {
    [PAPEL_ADMIN]: 'Administrador',
    [PAPEL_ADMINISTRATIVO]: 'Administrativo',
    [PAPEL_ALMOXARIFADO]: 'Almoxarifado',
    [PAPEL_COLABORADOR]: 'Colaborador'
};

export const TODOS_OS_PAPEIS = [
    PAPEL_ADMIN,
    PAPEL_ADMINISTRATIVO,
    PAPEL_ALMOXARIFADO,
    PAPEL_COLABORADOR
];
