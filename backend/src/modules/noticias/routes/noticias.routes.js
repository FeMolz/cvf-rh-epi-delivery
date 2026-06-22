import Router from 'express';

import noticiasController from '../controllers/NoticiasController.js';
import { isAuthenticated } from '../../../shared/middlewares/auth.js';
import { authorize } from '../../../shared/middlewares/rbac.js';
import { PAPEIS_GESTAO_RH } from '../../../shared/constants/papeisUsuarioConstantes.js';

const noticiasRoutes = Router();

noticiasRoutes.get(
    '/aniversariantes',
    isAuthenticated,
    authorize(PAPEIS_GESTAO_RH),
    (request, response, next) => noticiasController.listarAniversariantes(request, response, next)
);

noticiasRoutes.get(
    '/afastamentos',
    isAuthenticated,
    authorize(PAPEIS_GESTAO_RH),
    (request, response, next) => noticiasController.listarAfastamentos(request, response, next)
);

export default noticiasRoutes;
