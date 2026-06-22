import express from 'express';

import epiDeliveryReportController from '../controllers/EpiDeliveryReportController.js';
import { isAuthenticated } from '../../../shared/middlewares/auth.js';
import { authorize } from '../../../shared/middlewares/rbac.js';
import { PAPEIS_GESTAO_RH, PAPEIS_OPERACAO_EPI } from '../../../shared/constants/papeisUsuarioConstantes.js';

const { Router } = express;
const epiDeliveryReportRoutes = Router();

epiDeliveryReportRoutes.post(
    '/',
    isAuthenticated,
    authorize(PAPEIS_GESTAO_RH),
    (requisicao, resposta, proximo) => epiDeliveryReportController.create(requisicao, resposta, proximo)
);

epiDeliveryReportRoutes.get(
    '/',
    isAuthenticated,
    authorize(PAPEIS_OPERACAO_EPI),
    (requisicao, resposta, proximo) => epiDeliveryReportController.list(requisicao, resposta, proximo)
);

epiDeliveryReportRoutes.get(
    '/preview',
    isAuthenticated,
    authorize(PAPEIS_GESTAO_RH),
    (requisicao, resposta, proximo) => epiDeliveryReportController.preview(requisicao, resposta, proximo)
);

epiDeliveryReportRoutes.get(
    '/employees/eligible-for-emission',
    isAuthenticated,
    authorize(PAPEIS_GESTAO_RH),
    (requisicao, resposta, proximo) =>
        epiDeliveryReportController.listEmployeesEligibleForEmission(requisicao, resposta, proximo)
);

epiDeliveryReportRoutes.get(
    '/employees/with-reports',
    isAuthenticated,
    authorize(PAPEIS_OPERACAO_EPI),
    (requisicao, resposta, proximo) =>
        epiDeliveryReportController.listEmployeesWithReports(requisicao, resposta, proximo)
);

epiDeliveryReportRoutes.get(
    '/pending',
    isAuthenticated,
    authorize(PAPEIS_GESTAO_RH),
    (requisicao, resposta, proximo) => epiDeliveryReportController.listPending(requisicao, resposta, proximo)
);

epiDeliveryReportRoutes.get(
    '/employee/:employeeId/archive',
    isAuthenticated,
    authorize(PAPEIS_OPERACAO_EPI),
    (requisicao, resposta, proximo) =>
        epiDeliveryReportController.listArchiveByEmployee(requisicao, resposta, proximo)
);

epiDeliveryReportRoutes.patch(
    '/:id/flags',
    isAuthenticated,
    authorize(PAPEIS_GESTAO_RH),
    (requisicao, resposta, proximo) => epiDeliveryReportController.updateFlags(requisicao, resposta, proximo)
);

epiDeliveryReportRoutes.get(
    '/:id/pdf',
    isAuthenticated,
    authorize(PAPEIS_OPERACAO_EPI),
    (requisicao, resposta, proximo) => epiDeliveryReportController.downloadPdf(requisicao, resposta, proximo)
);

export default epiDeliveryReportRoutes;
