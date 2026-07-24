export const STATUS_ANUNCIO_VAGA = {
    ATIVA: 'ATIVA',
    INATIVA: 'INATIVA',
    ENCERRADA: 'ENCERRADA'
};

export const STATUS_CANDIDATURA = {
    PENDENTE: 'PENDENTE',
    PROXIMA_FASE: 'PROXIMA_FASE',
    DESCARTADO: 'DESCARTADO'
};

export const TIPO_VISUALIZACAO_CANDIDATURA = {
    DESCRICAO: 'DESCRICAO',
    CURRICULO: 'CURRICULO'
};

export const ORDENACAO_CANDIDATURAS = {
    RECENTES: 'RECENTES',
    ANTIGOS: 'ANTIGOS'
};

export const MODOS_TRABALHO_VAGA = {
    PRESENCIAL: 'PRESENCIAL',
    REMOTO: 'REMOTO',
    HIBRIDO: 'HIBRIDO'
};

export const TIPOS_CONTRATACAO_VAGA = {
    CLT: 'CLT',
    PJ: 'PJ',
    ESTAGIO: 'ESTAGIO',
    TEMPORARIO: 'TEMPORARIO',
    APRENDIZ: 'APRENDIZ',
    OUTRO: 'OUTRO'
};

export const ABAS_MODULO_RECRUTAMENTO = [
    { id: 'vagas', rotulo: 'Vagas' },
    { id: 'candidaturas', rotulo: 'Candidaturas' },
    { id: 'processo-aprovacao', rotulo: 'Processo de aprovação' },
    { id: 'lixeira', rotulo: 'Lixeira' },
    { id: 'reativados', rotulo: 'Reativados' }
];

export const STATUS_CADASTRO_CONTRATACAO = {
    AGUARDANDO_PREENCHIMENTO: 'AGUARDANDO_PREENCHIMENTO',
    AGUARDANDO_ANALISE_RH: 'AGUARDANDO_ANALISE_RH',
    CONTRATADO: 'CONTRATADO',
    DESCONTINUADO: 'DESCONTINUADO'
};

export const ROTULOS_STATUS_CADASTRO_CONTRATACAO = {
    AGUARDANDO_PREENCHIMENTO: 'Aguardando preenchimento',
    AGUARDANDO_ANALISE_RH: 'Aguardando análise RH',
    CONTRATADO: 'Contratado',
    DESCONTINUADO: 'Descontinuado'
};

export const DESTINO_REATIVACAO_CANDIDATURA = {
    CANDIDATURAS: 'CANDIDATURAS',
    REATIVADOS: 'REATIVADOS'
};

export const ABAS_VAGAS_ADMIN = [
    { id: 'ATIVA', rotulo: 'Ativas' },
    { id: 'INATIVA', rotulo: 'Rascunho' },
    { id: 'ENCERRADA', rotulo: 'Encerradas' }
];

export const ROTULOS_STATUS_CANDIDATURA = {
    PENDENTE: 'Pendente',
    PROXIMA_FASE: 'Próxima fase',
    DESCARTADO: 'Descartado'
};

export const ROTULOS_MODO_TRABALHO = {
    PRESENCIAL: 'Presencial',
    REMOTO: 'Remoto',
    HIBRIDO: 'Híbrido'
};

export const ROTULOS_TIPO_CONTRATACAO = {
    CLT: 'CLT',
    PJ: 'PJ',
    ESTAGIO: 'Estágio',
    TEMPORARIO: 'Temporário',
    APRENDIZ: 'Aprendiz',
    OUTRO: 'Outro'
};
