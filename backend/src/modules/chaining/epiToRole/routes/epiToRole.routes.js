import express from 'express';
const { Router } = express;

import epiToRoleController from '../controllers/EpiToRoleController.js';
import { isAuthenticated } from '../../../../shared/middlewares/auth.js';
import { authorize } from '../../../../shared/middlewares/rbac.js';
import { PAPEIS_GESTAO_RH, PAPEIS_OPERACAO_EPI } from '../../../../shared/constants/papeisUsuarioConstantes.js';

const epiToRoleRoutes = Router();

epiToRoleRoutes.post(
    '/',
    isAuthenticated,
    authorize(PAPEIS_GESTAO_RH),
    (requisicao, resposta, proximo) => epiToRoleController.link(requisicao, resposta, proximo)
);

epiToRoleRoutes.delete(
    '/:roleId/:epiId',
    isAuthenticated,
    authorize(PAPEIS_GESTAO_RH),
    (requisicao, resposta, proximo) => epiToRoleController.unlink(requisicao, resposta, proximo)
);

epiToRoleRoutes.get(
    '/:roleId',
    isAuthenticated,
    authorize(PAPEIS_OPERACAO_EPI),
    (requisicao, resposta, proximo) => epiToRoleController.listByRole(requisicao, resposta, proximo)
);

export default epiToRoleRoutes;
