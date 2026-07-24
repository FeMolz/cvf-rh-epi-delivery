export const ROLES_GESTAO_RECRUTAMENTO = ['ADMIN', 'ADMINISTRATIVO'];

export const STATUS_ANUNCIO_VAGA = {
    ATIVA: 'ATIVA',
    INATIVA: 'INATIVA',
    ENCERRADA: 'ENCERRADA'
};

export const TIPOS_CONTRATACAO_VAGA = {
    CLT: 'CLT',
    PJ: 'PJ',
    ESTAGIO: 'ESTAGIO',
    TEMPORARIO: 'TEMPORARIO',
    APRENDIZ: 'APRENDIZ',
    OUTRO: 'OUTRO'
};

export const MODOS_TRABALHO_VAGA = {
    PRESENCIAL: 'PRESENCIAL',
    REMOTO: 'REMOTO',
    HIBRIDO: 'HIBRIDO'
};

export const STATUS_CANDIDATURA = {
    PENDENTE: 'PENDENTE',
    PROXIMA_FASE: 'PROXIMA_FASE',
    DESCARTADO: 'DESCARTADO'
};

export const ORDENACAO_CANDIDATURAS = {
    RECENTES: 'RECENTES',
    ANTIGOS: 'ANTIGOS'
};

export const DIAS_RETENCAO_CANDIDATURA_DESCARTADA = 60;

export const TAMANHO_MAXIMO_CURRICULO_BYTES = 10 * 1024 * 1024;

export const TIPOS_MIME_CURRICULO_PERMITIDOS = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.oasis.opendocument.text',
    'application/rtf',
    'text/rtf'
];

export const EXTENSOES_CURRICULO_PERMITIDAS = ['.pdf', '.doc', '.docx', '.odt', '.rtf'];

export const MENSAGEM_TITULO_VAGA_OBRIGATORIO = 'O título da vaga é obrigatório.';
export const MENSAGEM_APRESENTACAO_EMPRESA_OBRIGATORIA = 'A apresentação da empresa é obrigatória.';
export const MENSAGEM_SOBRE_VAGA_OBRIGATORIA = 'A descrição sobre a vaga é obrigatória.';
export const MENSAGEM_RESPONSABILIDADES_OBRIGATORIAS = 'As responsabilidades são obrigatórias.';
export const MENSAGEM_REQUISITOS_OBRIGATORIOS = 'Os requisitos são obrigatórios.';
export const MENSAGEM_BENEFICIOS_OBRIGATORIOS = 'Os benefícios são obrigatórios.';
export const MENSAGEM_LOCAL_TRABALHO_OBRIGATORIO = 'O local de trabalho é obrigatório.';
export const MENSAGEM_MODO_TRABALHO_INVALIDO = 'O modo de trabalho informado é inválido.';
export const MENSAGEM_TIPO_CONTRATACAO_INVALIDO = 'O tipo de contratação informado é inválido.';
export const MENSAGEM_JORNADA_TRABALHO_OBRIGATORIA = 'A jornada de trabalho é obrigatória.';
export const MENSAGEM_STATUS_ANUNCIO_INVALIDO = 'O status do anúncio informado é inválido.';
export const MENSAGEM_ANUNCIO_NAO_ENCONTRADO = 'Anúncio de vaga não encontrado.';
export const MENSAGEM_ANUNCIO_NAO_ATIVO = 'Este anúncio de vaga não está aceitando candidaturas.';
export const MENSAGEM_CAMPOS_ATUALIZACAO_ANUNCIO_VAZIOS = 'Informe ao menos um campo para atualizar o anúncio.';
export const MENSAGEM_IDENTIFICADOR_ANUNCIO_OBRIGATORIO = 'O identificador do anúncio é obrigatório.';

export const MENSAGEM_NOME_COMPLETO_OBRIGATORIO = 'O nome completo é obrigatório.';
export const MENSAGEM_EMAIL_OBRIGATORIO = 'O e-mail é obrigatório.';
export const MENSAGEM_EMAIL_INVALIDO = 'O e-mail informado é inválido.';
export const MENSAGEM_TELEFONE_OBRIGATORIO = 'O telefone é obrigatório.';
export const MENSAGEM_CIDADE_OBRIGATORIA = 'A cidade é obrigatória.';
export const MENSAGEM_ESTADO_OBRIGATORIO = 'O estado é obrigatório.';
export const MENSAGEM_PRETENSAO_SALARIAL_OBRIGATORIA = 'A pretensão salarial é obrigatória.';
export const MENSAGEM_MENSAGEM_CANDIDATO_OBRIGATORIA =
    'A breve descrição sobre o interesse na vaga é obrigatória.';
export const MENSAGEM_CURRICULO_OBRIGATORIO = 'O currículo é obrigatório.';
export const MENSAGEM_CURRICULO_TIPO_NAO_PERMITIDO = 'Formato de currículo não permitido. Envie PDF, DOC, DOCX, ODT ou RTF.';
export const MENSAGEM_CURRICULO_TAMANHO_EXCEDIDO = 'O currículo excede o tamanho máximo permitido de 10 MB.';
export const MENSAGEM_CANDIDATURA_NAO_ENCONTRADA = 'Candidatura não encontrada.';
export const MENSAGEM_CURRICULO_AUSENTE = 'Arquivo de currículo não encontrado para esta candidatura.';
export const MENSAGEM_IDENTIFICADOR_CANDIDATURA_OBRIGATORIO = 'O identificador da candidatura é obrigatório.';
export const MENSAGEM_CANDIDATURA_DUPLICADA =
    'Você já se candidatou a esta vaga. Não é possível enviar uma nova candidatura.';
export const MENSAGEM_CANDIDATURA_EMAIL_DUPLICADA =
    'Já existe uma candidatura com este e-mail para esta vaga.';
export const MENSAGEM_STATUS_CANDIDATURA_INVALIDO = 'O status informado para a candidatura é inválido.';
export const MENSAGEM_STATUS_CANDIDATURA_NAO_ALTERAVEL =
    'Somente candidaturas pendentes ou em próxima fase podem ter o status alterado.';
export const MENSAGEM_CANDIDATURA_NAO_PODE_REATIVAR =
    'Somente candidaturas descartadas podem ser reativadas.';
export const TIPO_VISUALIZACAO_CANDIDATURA = {
    DESCRICAO: 'DESCRICAO',
    CURRICULO: 'CURRICULO'
};
export const MENSAGEM_TIPO_VISUALIZACAO_CANDIDATURA_INVALIDO =
    'O tipo de visualização informado é inválido.';
export const MENSAGEM_DATA_INICIO_INVALIDA = 'A data inicial do filtro é inválida.';
export const MENSAGEM_DATA_FIM_INVALIDA = 'A data final do filtro é inválida.';
export const MENSAGEM_PERIODO_FILTRO_INVALIDO = 'A data inicial do filtro deve ser anterior ou igual à data final.';

export const STATUS_CADASTRO_CONTRATACAO = {
    AGUARDANDO_PREENCHIMENTO: 'AGUARDANDO_PREENCHIMENTO',
    AGUARDANDO_ANALISE_RH: 'AGUARDANDO_ANALISE_RH',
    CONTRATADO: 'CONTRATADO',
    DESCONTINUADO: 'DESCONTINUADO'
};

export const PREFIXO_ROTA_CADASTRO_CONTRATACAO_PUBLICO = '/publico/cadastro-contratacao';

export const MENSAGEM_ROLE_ID_OBRIGATORIO = 'O cargo (roleId) da vaga é obrigatório.';
export const MENSAGEM_COMPANY_ID_OBRIGATORIO = 'A empresa (companyId) da vaga é obrigatória.';
export const MENSAGEM_SETOR_ID_OBRIGATORIO = 'O setor (setorId) da vaga é obrigatório.';
export const MENSAGEM_VAGA_SEM_VINCULOS_CONTRATACAO =
    'O anúncio deve possuir cargo, empresa e setor definidos para gerar o link de cadastro.';
export const MENSAGEM_CONVITE_CADASTRO_JA_EXISTE =
    'Já existe um convite de cadastro ativo para esta candidatura.';
export const MENSAGEM_CONVITE_EXIGE_PROXIMA_FASE =
    'Somente candidaturas em próxima fase podem receber convite de cadastro.';
export const MENSAGEM_REENVIAR_EMAIL_STATUS_INVALIDO =
    'Só é possível reenviar o e-mail enquanto o cadastro aguarda preenchimento pelo candidato.';
export const MENSAGEM_FALHA_ENVIO_CONVITE_CADASTRO =
    'Não foi possível enviar o e-mail de convite. Tente novamente.';
export const MENSAGEM_CADASTRO_CONTRATACAO_NAO_ENCONTRADO = 'Cadastro de contratação não encontrado.';
export const MENSAGEM_TOKEN_CADASTRO_INVALIDO = 'Link de cadastro inválido ou expirado.';
export const MENSAGEM_CADASTRO_NAO_DISPONIVEL_PREENCHIMENTO =
    'Este cadastro não está disponível para preenchimento.';
export const MENSAGEM_CADASTRO_JA_ENVIADO = 'Os dados deste cadastro já foram enviados para análise do RH.';
export const MENSAGEM_STATUS_CADASTRO_INVALIDO = 'O status informado para o cadastro é inválido.';
export const MENSAGEM_CADASTRO_NAO_AGUARDA_ANALISE =
    'Somente cadastros aguardando análise do RH podem ser aprovados.';
export const MENSAGEM_CADASTRO_NAO_PODE_CANCELAR =
    'Somente cadastros em processo de aprovação podem ser cancelados.';
export const MENSAGEM_CAMPOS_FUNCIONARIO_OBRIGATORIOS_CADASTRO =
    'Campos obrigatórios ausentes: name, cpf, email, telefone, birthDate e demais dados pessoais/endereço do formulário.';
export const MENSAGEM_ADMISSION_DATE_NAO_EDITAVEL_CANDIDATO =
    'A data de admissão é definida pelo RH e não pode ser preenchida pelo candidato.';
export const MENSAGEM_BENEFICIOS_NAO_EDITAVEIS_CANDIDATO =
    'Os benefícios são definidos pelo RH e não podem ser preenchidos pelo candidato.';
export const MENSAGEM_DATA_ADMISSAO_OBRIGATORIA_RH =
    'A data de admissão é obrigatória na aprovação do cadastro pelo RH.';
export const MENSAGEM_DATA_ADMISSAO_INVALIDA = 'A data de admissão informada é inválida.';
export const MENSAGEM_CARGO_NAO_EDITAVEL =
    'O cargo vinculado ao convite não pode ser alterado pelo candidato.';
export const MENSAGEM_EMPRESA_NAO_EDITAVEL =
    'A empresa vinculada ao convite não pode ser alterada pelo candidato.';
export const MENSAGEM_SETOR_NAO_EDITAVEL =
    'O setor vinculado ao convite não pode ser alterado pelo candidato.';
