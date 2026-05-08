export const authorize = (allowedRoles = []) => {
    return (req, res, next) => {
        const { role } = req.user;

        if (!allowedRoles.includes(role)) {
            return res.status(403).json({
                status: 'error',
                message: 'Você não tem permissão para acessar esse recurso.',
            });
        }

        next();
    };
};