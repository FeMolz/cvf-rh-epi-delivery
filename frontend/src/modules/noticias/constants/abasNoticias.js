export const ABAS_NOTICIAS = [
    { id: 'aniversario', rotulo: 'Aniversário' },
    { id: 'afastamento', rotulo: 'Afastamento' }
];

export const ABA_NOTICIAS_PADRAO = 'aniversario';

export const SECOES_NOTICIAS = new Set(ABAS_NOTICIAS.map((aba) => aba.id));
