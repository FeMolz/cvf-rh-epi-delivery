import express from 'express';
const { Router } = express;

import epiController from '../controllers/EpiController.js';
import { isAuthenticated } from '../../../shared/middlewares/auth.js';
import { authorize } from '../../../shared/middlewares/rbac.js';

const epiRoutes = Router();

// Buscar informações de um EPI pelo CA (salva localmente se não existir)
epiRoutes.get('/:caNumber', isAuthenticated, authorize(['ADMIN', 'ADMINISTRATIVO', 'ALMOXARIFADO']), epiController.findByCa);

// Listar EPIs cacheados localmente
epiRoutes.get('/', isAuthenticated, authorize(['ADMIN', 'ADMINISTRATIVO', 'ALMOXARIFADO']), epiController.findAllLocal);

// Alterar a periodicidade de um EPI vinculado a um cargo
epiRoutes.put('/periodicity', isAuthenticated, authorize(['ADMIN', 'ADMINISTRATIVO']), epiController.changePeriodicity);

export default epiRoutes;
