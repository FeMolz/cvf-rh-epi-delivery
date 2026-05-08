import jwt from 'jsonwebtoken';
const { JWT_SECRET, JWT_EXPIRES_IN } = process.env;

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
        const decodedToken = jwt.verify(token, JWT_SECRET);
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