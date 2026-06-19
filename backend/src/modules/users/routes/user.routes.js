import express from 'express';
const { Router } = express;

import userController from '../controllers/UserController.js';
import { isAuthenticated } from '../../../shared/middlewares/auth.js';
import { authorize } from '../../../shared/middlewares/rbac.js';
import { limitadorTaxaLogin } from '../../../shared/middlewares/criarLimitadorTaxa.js';
import { PAPEIS_GESTAO_RH, PAPEIS_CADASTRO_USUARIO, PAPEL_ADMIN } from '../../../shared/constants/papeisUsuarioConstantes.js';

const userRoutes = Router();

userRoutes.post(
    '/',
    isAuthenticated,
    authorize(PAPEIS_CADASTRO_USUARIO),
    (requisicao, resposta, proximo) => userController.create(requisicao, resposta, proximo)
);

userRoutes.post(
    '/login',
    limitadorTaxaLogin,
    (requisicao, resposta, proximo) => userController.login(requisicao, resposta, proximo)
);

userRoutes.post(
    '/logout',
    isAuthenticated,
    (requisicao, resposta, proximo) => userController.logout(requisicao, resposta, proximo)
);

userRoutes.delete(
    '/me',
    isAuthenticated,
    (requisicao, resposta, proximo) => userController.deleteMe(requisicao, resposta, proximo)
);

userRoutes.get(
    '/',
    isAuthenticated,
    authorize([PAPEL_ADMIN]),
    (requisicao, resposta, proximo) => userController.findAll(requisicao, resposta, proximo)
);

userRoutes.get(
    '/findByEmail/:email',
    isAuthenticated,
    authorize([PAPEL_ADMIN]),
    (requisicao, resposta, proximo) => userController.findByEmail(requisicao, resposta, proximo)
);

userRoutes.get(
    '/:id',
    isAuthenticated,
    authorize([PAPEL_ADMIN]),
    (requisicao, resposta, proximo) => userController.findById(requisicao, resposta, proximo)
);

userRoutes.put(
    '/:id',
    isAuthenticated,
    authorize(PAPEIS_GESTAO_RH),
    (requisicao, resposta, proximo) => userController.update(requisicao, resposta, proximo)
);

userRoutes.delete(
    '/:id',
    isAuthenticated,
    authorize([PAPEL_ADMIN]),
    (requisicao, resposta, proximo) => userController.delete(requisicao, resposta, proximo)
);

userRoutes.put(
    '/password/:id',
    isAuthenticated,
    (requisicao, resposta, proximo) => userController.changePassword(requisicao, resposta, proximo)
);

export default userRoutes;
