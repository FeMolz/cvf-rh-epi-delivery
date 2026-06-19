export const TAMANHO_MINIMO_JWT_SECRET_PRODUCAO = 32;

export const TAMANHO_MINIMO_JWT_SECRET_DESENVOLVIMENTO = 16;

export const TAMANHO_MINIMO_SENHA = 8;

export const PADRAO_SENHA_FORTE = /^(?=.*[A-Za-z])(?=.*\d).+$/;

export const MENSAGEM_SENHA_FRACA =
    'A senha deve ter no mínimo 8 caracteres, incluindo letras e números.';

export const MENSAGEM_CREDENCIAIS_LOGIN_INVALIDAS =
    'E-mail ou senha incorretos.';

export const MENSAGEM_SEM_PERMISSAO_EDITAR_USUARIO_ADMIN =
    'Você não tem permissão para alterar este usuário.';

export const MENSAGEM_CURRICULO_CONTEUDO_INVALIDO =
    'O conteúdo do currículo não corresponde a um formato permitido.';

export const MENSAGEM_NUMERO_CA_INVALIDO =
    'O número do CA deve conter apenas dígitos (até 20 caracteres).';

export const TIPOS_EVENTO_AUDITORIA = {
    LOGIN_SUCESSO: 'LOGIN_SUCESSO',
    LOGOUT: 'LOGOUT',
    ALTERACAO_SENHA: 'ALTERACAO_SENHA',
    DOWNLOAD_CURRICULO: 'DOWNLOAD_CURRICULO',
    CONVITE_CADASTRO_GERADO: 'CONVITE_CADASTRO_GERADO'
};

export const DIAS_VALIDADE_TOKEN_CADASTRO_PADRAO = 7;

export const LIMITE_REQUISICOES_GLOBAL_PADRAO = 300;
