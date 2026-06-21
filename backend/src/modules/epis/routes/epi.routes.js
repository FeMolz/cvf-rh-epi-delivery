import express from 'express';
const { Router } = express;

import epiController from '../controllers/EpiController.js';
import { isAuthenticated } from '../../../shared/middlewares/auth.js';
import { authorize } from '../../../shared/middlewares/rbac.js';
import { PAPEIS_GESTAO_RH, PAPEIS_OPERACAO_EPI } from '../../../shared/constants/papeisUsuarioConstantes.js';

const epiRoutes = Router();

epiRoutes.get(
    '/buscar-por-nome',
    isAuthenticated,
    authorize(PAPEIS_OPERACAO_EPI),
    (requisicao, resposta, proximo) => epiController.searchByName(requisicao, resposta, proximo)
);

epiRoutes.get(
    '/:caNumber',
    isAuthenticated,
    authorize(PAPEIS_OPERACAO_EPI),
    (requisicao, resposta, proximo) => epiController.findByCa(requisicao, resposta, proximo)
);

epiRoutes.get(
    '/',
    isAuthenticated,
    authorize(PAPEIS_OPERACAO_EPI),
    (requisicao, resposta, proximo) => epiController.findAllLocal(requisicao, resposta, proximo)
);

epiRoutes.put(
    '/periodicity',
    isAuthenticated,
    authorize(PAPEIS_GESTAO_RH),
    (requisicao, resposta, proximo) => epiController.changePeriodicity(requisicao, resposta, proximo)
);

export default epiRoutes;
