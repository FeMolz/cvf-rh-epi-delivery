import jwt from 'jsonwebtoken';
import env from '../../config/env.js';

export const isAuthenticated = (req, res, next) => {
    const tokenHeader = req.headers.authorization;

    if (!tokenHeader || !tokenHeader.startsWith('Bearer ')) {
        return res.status(401).json({
            status: 'error',
            message: 'Token de autenticação não fornecido.'
        })
    }

    const token = tokenHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({
            status: 'error',
            message: 'Token de autenticação não fornecido.'
        })
    }

    try {
        const decodedToken = jwt.verify(token, env.JWT_SECRET || process.env.JWT_SECRET);
        req.user = decodedToken;
        next();

    } catch (error) {
        return res.status(401).json({
            status: 'error',
            message: 'Token de autenticação inválido ou expirado.'
        })
    }
}

export default isAuthenticated;