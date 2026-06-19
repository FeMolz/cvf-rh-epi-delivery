import Router from 'express';
import companyController from '../controllers/CompanyController.js';
import { isAuthenticated } from '../../../shared/middlewares/auth.js';
import { authorize } from '../../../shared/middlewares/rbac.js';
import { PAPEIS_LEITURA_CARGOS_SETORES } from '../../../shared/constants/papeisUsuarioConstantes.js';

const companyRoutes = Router();

companyRoutes.get(
    '/',
    isAuthenticated,
    authorize(PAPEIS_LEITURA_CARGOS_SETORES),
    (requisicao, resposta, proximo) => companyController.findAll(requisicao, resposta, proximo)
);

export default companyRoutes;
