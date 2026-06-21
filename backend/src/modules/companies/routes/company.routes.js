import Router from 'express';
import companyController from '../controllers/CompanyController.js';
import { isAuthenticated } from '../../../shared/middlewares/auth.js';
import { authorize } from '../../../shared/middlewares/rbac.js';
import { PAPEIS_GESTAO_EMPRESAS_SETORES } from '../../../shared/constants/papeisUsuarioConstantes.js';

const companyRoutes = Router();

companyRoutes.get(
    '/',
    isAuthenticated,
    (requisicao, resposta, proximo) => companyController.findAll(requisicao, resposta, proximo)
);

companyRoutes.post(
    '/',
    isAuthenticated,
    authorize(PAPEIS_GESTAO_EMPRESAS_SETORES),
    (requisicao, resposta, proximo) => companyController.create(requisicao, resposta, proximo)
);

companyRoutes.get(
    '/:id',
    isAuthenticated,
    authorize(PAPEIS_GESTAO_EMPRESAS_SETORES),
    (requisicao, resposta, proximo) => companyController.findById(requisicao, resposta, proximo)
);

companyRoutes.put(
    '/:id',
    isAuthenticated,
    authorize(PAPEIS_GESTAO_EMPRESAS_SETORES),
    (requisicao, resposta, proximo) => companyController.update(requisicao, resposta, proximo)
);

companyRoutes.delete(
    '/:id',
    isAuthenticated,
    authorize(PAPEIS_GESTAO_EMPRESAS_SETORES),
    (requisicao, resposta, proximo) => companyController.delete(requisicao, resposta, proximo)
);

export default companyRoutes;
