import Router from 'express';
import setorController from '../controllers/SetorController.js';
import { isAuthenticated } from '../../../shared/middlewares/auth.js';
import { authorize } from '../../../shared/middlewares/rbac.js';
import { PAPEIS_GESTAO_EMPRESAS_SETORES } from '../../../shared/constants/papeisUsuarioConstantes.js';

const setorRoutes = Router();

setorRoutes.get(
    '/',
    isAuthenticated,
    (requisicao, resposta, proximo) => setorController.findAll(requisicao, resposta, proximo)
);

setorRoutes.post(
    '/',
    isAuthenticated,
    authorize(PAPEIS_GESTAO_EMPRESAS_SETORES),
    (requisicao, resposta, proximo) => setorController.create(requisicao, resposta, proximo)
);

setorRoutes.get(
    '/:id',
    isAuthenticated,
    authorize(PAPEIS_GESTAO_EMPRESAS_SETORES),
    (requisicao, resposta, proximo) => setorController.findById(requisicao, resposta, proximo)
);

setorRoutes.put(
    '/:id',
    isAuthenticated,
    authorize(PAPEIS_GESTAO_EMPRESAS_SETORES),
    (requisicao, resposta, proximo) => setorController.update(requisicao, resposta, proximo)
);

setorRoutes.delete(
    '/:id',
    isAuthenticated,
    authorize(PAPEIS_GESTAO_EMPRESAS_SETORES),
    (requisicao, resposta, proximo) => setorController.delete(requisicao, resposta, proximo)
);

export default setorRoutes;
