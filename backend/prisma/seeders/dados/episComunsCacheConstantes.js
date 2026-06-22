/**
 * EPIs reais e com validade ativa na base CAEPI (MTE), selecionados por categorias
 * mais usadas em SST (capacete, calçado, luvas, óculos, auditivo, respirador, etc.).
 *
 * Fonte: consulta à API baseCAEPI em jun/2026. Atualize periodicamente ou regenere
 * com `npm run epis:cache:gerar` quando a CAEPI estiver disponível localmente.
 *
 * Usado por `seed_epis_cache_producao.js` — apenas cache, sem vínculos com cargos.
 */

/** @type {Array<{ caNumber: string, name: string, caExpirationDate: string }>} */
export const EPIS_COMUNS_CACHE = [
    {
        caNumber: '17098',
        name: 'CAPACETE CLASSE E',
        caExpirationDate: '2028-07-16'
    },
    {
        caNumber: '31469',
        name: 'CAPACETE CLASSE E',
        caExpirationDate: '2028-05-23'
    },
    {
        caNumber: '25687',
        name: 'BOTINA - TIPO B',
        caExpirationDate: '2027-09-26'
    },
    {
        caNumber: '34556',
        name: 'CALÇADO BAIXO - TIPO A',
        caExpirationDate: '2028-05-03'
    },
    {
        caNumber: '49029',
        name: 'BOTA DE CANO LONGO - TIPO D',
        caExpirationDate: '2028-04-26'
    },
    {
        caNumber: '30916',
        name: 'LUVA PARA PROTEÇÃO CONTRA AGENTES MECÂNICOS',
        caExpirationDate: '2030-12-19'
    },
    {
        caNumber: '40189',
        name: 'LUVA PARA PROTEÇÃO CONTRA AGENTES MECÂNICOS E QUÍMICOS',
        caExpirationDate: '2027-05-17'
    },
    {
        caNumber: '20723',
        name:
            'LUVA PARA PROTEÇÃO CONTRA AGENTES QUÍMICOS, BIOLÓGICOS E UMIDADE PROVENIENTE DE OPERAÇÕES COM USO DE ÁGUA',
        caExpirationDate: '2031-01-28'
    },
    {
        caNumber: '32143',
        name: 'LUVA PARA PROTEÇÃO CONTRA AGENTES TÉRMICOS E MECÂNICOS',
        caExpirationDate: '2027-10-20'
    },
    {
        caNumber: '10346',
        name: 'ÓCULOS',
        caExpirationDate: '2029-03-08'
    },
    {
        caNumber: '9722',
        name: 'ÓCULOS',
        caExpirationDate: '2027-08-14'
    },
    {
        caNumber: '11512',
        name: 'PROTETOR AUDITIVO',
        caExpirationDate: '2030-01-03'
    },
    {
        caNumber: '5745',
        name: 'PROTETOR AUDITIVO',
        caExpirationDate: '2028-08-08'
    },
    {
        caNumber: '14781',
        name: 'RESPIRADOR PURIFICADOR DE AR TIPO PEÇA UM QUARTO FACIAL',
        caExpirationDate: '2030-08-27'
    },
    {
        caNumber: '5821',
        name: 'RESPIRADOR PURIFICADOR DE AR PARA FUGA',
        caExpirationDate: '2026-09-01'
    },
    {
        caNumber: '15027',
        name: 'PROTETOR FACIAL',
        caExpirationDate: '2027-11-07'
    },
    {
        caNumber: '13845',
        name: 'MANGA',
        caExpirationDate: '2028-07-14'
    }
];
