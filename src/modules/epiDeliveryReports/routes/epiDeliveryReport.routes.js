import express from 'express';

import epiDeliveryReportController from '../controllers/EpiDeliveryReportController.js';
import { isAuthenticated } from '../../../shared/middlewares/auth.js';
import { authorize } from '../../../shared/middlewares/rbac.js';

const { Router } = express;
const epiDeliveryReportRoutes = Router();

epiDeliveryReportRoutes.post(
    '/',
    isAuthenticated,
    authorize('ADMIN', 'ADMINISTRATIVO'),
    (req, res, next) => epiDeliveryReportController.create(req, res, next)
);

epiDeliveryReportRoutes.get(
    '/pending',
    isAuthenticated,
    authorize('ADMIN', 'ADMINISTRATIVO'),
    (req, res, next) => epiDeliveryReportController.listPending(req, res, next)
);

epiDeliveryReportRoutes.get(
    '/employee/:employeeId/archive',
    isAuthenticated,
    authorize('ADMIN', 'ADMINISTRATIVO', 'ALMOXARIFADO'),
    (req, res, next) => epiDeliveryReportController.listArchiveByEmployee(req, res, next)
);

epiDeliveryReportRoutes.patch(
    '/:id/flags',
    isAuthenticated,
    authorize('ADMIN', 'ADMINISTRATIVO'),
    (req, res, next) => epiDeliveryReportController.updateFlags(req, res, next)
);

epiDeliveryReportRoutes.get(
    '/:id/pdf',
    isAuthenticated,
    authorize('ADMIN', 'ADMINISTRATIVO', 'ALMOXARIFADO'),
    (req, res, next) => epiDeliveryReportController.downloadPdf(req, res, next)
);

export default epiDeliveryReportRoutes;
