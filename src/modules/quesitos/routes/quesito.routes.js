import express from 'express';

import quesitoController from '../controllers/QuesitoController.js';
import { isAuthenticated } from '../../../shared/middlewares/auth.js';
import { authorize } from '../../../shared/middlewares/rbac.js';

const { Router } = express;
const quesitoRoutes = Router();

quesitoRoutes.post(
    '/',
    isAuthenticated,
    authorize(['ADMIN', 'ADMINISTRATIVO']),
    (req, res, next) => quesitoController.create(req, res, next)
);

quesitoRoutes.get(
    '/',
    isAuthenticated,
    authorize(['ADMIN', 'ADMINISTRATIVO']),
    (req, res, next) => quesitoController.list(req, res, next)
);

export default quesitoRoutes;
