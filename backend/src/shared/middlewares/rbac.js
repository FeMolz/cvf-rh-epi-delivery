/**
 * @param {string[] | string} papeisPermitidosEntrada
 * @returns {import('express').RequestHandler}
 */
export const authorize = (...papeisPermitidosEntrada) => {
    const listaPapeis = Array.isArray(papeisPermitidosEntrada[0])
        ? papeisPermitidosEntrada[0]
        : papeisPermitidosEntrada;

    return (requisicao, resposta, proximo) => {
        const papelUsuario = requisicao.user?.role;

        if (!listaPapeis.includes(papelUsuario)) {
            return resposta.status(403).json({
                status: 'error',
                message: 'Você não tem permissão para acessar esse recurso.'
            });
        }

        return proximo();
    };
};
