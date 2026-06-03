import jwt from 'jsonwebtoken';

import env from '../../config/env.js';
import userRepository from '../../modules/users/repositories/UserRepository.js';

export const isAuthenticated = async (requisicao, resposta, proximo) => {
    const cabecalhoAutorizacao = requisicao.headers.authorization;

    if (!cabecalhoAutorizacao || !cabecalhoAutorizacao.startsWith('Bearer ')) {
        return resposta.status(401).json({
            status: 'error',
            message: 'Token de autenticação não fornecido.'
        });
    }

    const token = cabecalhoAutorizacao.split(' ')[1];

    if (!token) {
        return resposta.status(401).json({
            status: 'error',
            message: 'Token de autenticação não fornecido.'
        });
    }

    try {
        const tokenDecodificado = jwt.verify(token, env.JWT_SECRET);
        const identificadorUsuario = tokenDecodificado?.id;

        if (!identificadorUsuario) {
            return resposta.status(401).json({
                status: 'error',
                message: 'Token de autenticação inválido ou expirado.'
            });
        }

        const usuarioSessao = await userRepository.findSessaoPorId(identificadorUsuario);

        if (!usuarioSessao || !usuarioSessao.isActive) {
            return resposta.status(401).json({
                status: 'error',
                message: 'Token de autenticação inválido ou expirado.'
            });
        }

        requisicao.user = {
            id: usuarioSessao.id,
            role: usuarioSessao.role,
            email: usuarioSessao.email
        };

        return proximo();
    } catch {
        return resposta.status(401).json({
            status: 'error',
            message: 'Token de autenticação inválido ou expirado.'
        });
    }
};

export default isAuthenticated;
