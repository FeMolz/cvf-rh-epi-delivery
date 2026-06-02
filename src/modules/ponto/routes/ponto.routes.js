import express from 'express';
const { Router } = express;

import pontoController from '../controllers/PontoController.js';
import { isAuthenticated } from '../../../shared/middlewares/auth.js';
import { authorize } from '../../../shared/middlewares/rbac.js';

const pontoRoutes = Router();

pontoRoutes.get(
    '/resumo',
    isAuthenticated,
    authorize(['ADMIN', 'ADMINISTRATIVO']),
    pontoController.obterResumo
);

export default pontoRoutes;
