import express from 'express';
const { Router } = express;

import epiDeliveryController from '../controllers/EpiDeliveryController.js';
import { isAuthenticated } from '../../../shared/middlewares/auth.js';
import { authorize } from '../../../shared/middlewares/rbac.js';
import { PAPEIS_OPERACAO_EPI } from '../../../shared/constants/papeisUsuarioConstantes.js';

const epiDeliveryRoutes = Router();

epiDeliveryRoutes.post(
    '/',
    isAuthenticated,
    authorize(PAPEIS_OPERACAO_EPI),
    (requisicao, resposta, proximo) => epiDeliveryController.create(requisicao, resposta, proximo)
);

epiDeliveryRoutes.get(
    '/employee/:employeeId',
    isAuthenticated,
    authorize(PAPEIS_OPERACAO_EPI),
    (requisicao, resposta, proximo) =>
        epiDeliveryController.listByEmployee(requisicao, resposta, proximo)
);

export default epiDeliveryRoutes;
