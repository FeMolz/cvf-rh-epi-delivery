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
    '/todos',
    isAuthenticated,
    authorize(['ADMIN', 'ADMINISTRATIVO']),
    (req, res, next) => quesitoController.listAll(req, res, next)
);

quesitoRoutes.get(
    '/',
    isAuthenticated,
    authorize(['ADMIN', 'ADMINISTRATIVO']),
    (req, res, next) => quesitoController.list(req, res, next)
);

quesitoRoutes.put(
    '/:id',
    isAuthenticated,
    authorize(['ADMIN', 'ADMINISTRATIVO']),
    (req, res, next) => quesitoController.update(req, res, next)
);

quesitoRoutes.delete(
    '/:id',
    isAuthenticated,
    authorize(['ADMIN', 'ADMINISTRATIVO']),
    (req, res, next) => quesitoController.delete(req, res, next)
);

export default quesitoRoutes;
