import { PAPEL_ADMIN, PAPEL_COLABORADOR } from '../../../shared/constants/papeisUsuarioConstantes.js';

export const PAPEL_PADRAO_NOVO_USUARIO = PAPEL_COLABORADOR;

export const MENSAGEM_CAMPOS_OBRIGATORIOS_CRIAR_USUARIO =
    'Nome, e-mail e senha são obrigatórios.';

export const MENSAGEM_EMAIL_SENHA_OBRIGATORIOS_LOGIN =
    'E-mail e senha são obrigatórios.';

export const MENSAGEM_NOVA_SENHA_OBRIGATORIA =
    'Nova senha não informada.';

export const MENSAGEM_SEM_PERMISSAO_ALTERAR_SENHA =
    'Você não tem permissão para alterar a senha deste usuário.';

export const MENSAGEM_SEM_PERMISSAO_DEFINIR_PAPEL_ADMIN =
    'Não é permitido definir o papel ADMIN.';

export const MENSAGEM_EMAIL_JA_CADASTRADO =
    'Este e-mail já está cadastrado no sistema.';

export const MENSAGEM_USUARIO_NAO_ENCONTRADO = 'Usuário não encontrado.';

export const MENSAGEM_CONTA_EXCLUIDA_SUCESSO =
    'Sua conta foi excluída com sucesso.';

export const MENSAGEM_USUARIO_INATIVO =
    'Usuário inativo. Entre em contato com o administrador do sistema.';

export const MENSAGEM_ISACTIVE_NAO_EDITAVEL =
    'O campo isActive não pode ser alterado pela API.';

export { PAPEL_ADMIN };
