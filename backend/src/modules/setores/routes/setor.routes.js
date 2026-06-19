import Router from 'express';
import setorController from '../controllers/SetorController.js';
import { isAuthenticated } from '../../../shared/middlewares/auth.js';
import { authorize } from '../../../shared/middlewares/rbac.js';
import { PAPEIS_LEITURA_CARGOS_SETORES } from '../../../shared/constants/papeisUsuarioConstantes.js';

const setorRoutes = Router();

setorRoutes.get(
    '/',
    isAuthenticated,
    authorize(PAPEIS_LEITURA_CARGOS_SETORES),
    (requisicao, resposta, proximo) => setorController.findAll(requisicao, resposta, proximo)
);

export default setorRoutes;
