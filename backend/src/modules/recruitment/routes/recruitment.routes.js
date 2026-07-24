import express from 'express';

import anuncioVagaController from '../controllers/AnuncioVagaController.js';
import candidaturaController from '../controllers/CandidaturaController.js';
import cadastroContratacaoController from '../controllers/CadastroContratacaoController.js';
import { middlewareUploadCurriculoOpcional } from '../middlewares/uploadCurriculoMiddleware.js';
import { ROLES_GESTAO_RECRUTAMENTO } from '../constants/recrutamentoConstantes.js';
import { isAuthenticated } from '../../../shared/middlewares/auth.js';
import { authorize } from '../../../shared/middlewares/rbac.js';
import { limitadorTaxaRotasPublicas } from '../../../shared/middlewares/criarLimitadorTaxa.js';

const { Router } = express;
const recruitmentRoutes = Router();

recruitmentRoutes.get(
    '/publico/vagas',
    limitadorTaxaRotasPublicas,
    (requisicao, resposta, proximo) => anuncioVagaController.listPublico(requisicao, resposta, proximo)
);

recruitmentRoutes.get(
    '/publico/vagas/:id',
    limitadorTaxaRotasPublicas,
    (requisicao, resposta, proximo) => anuncioVagaController.getPublico(requisicao, resposta, proximo)
);

recruitmentRoutes.post(
    '/publico/vagas/:id/candidaturas',
    limitadorTaxaRotasPublicas,
    middlewareUploadCurriculoOpcional,
    (requisicao, resposta, proximo) => candidaturaController.createPublica(requisicao, resposta, proximo)
);

recruitmentRoutes.get(
    '/publico/cadastro-contratacao/:token',
    limitadorTaxaRotasPublicas,
    (requisicao, resposta, proximo) => cadastroContratacaoController.getPublico(requisicao, resposta, proximo)
);

recruitmentRoutes.post(
    '/publico/cadastro-contratacao/:token',
    limitadorTaxaRotasPublicas,
    (requisicao, resposta, proximo) =>
        cadastroContratacaoController.submeterPublico(requisicao, resposta, proximo)
);

recruitmentRoutes.get(
    '/vagas/ativas',
    isAuthenticated,
    (requisicao, resposta, proximo) => anuncioVagaController.listAtivos(requisicao, resposta, proximo)
);

recruitmentRoutes.get(
    '/vagas/ativas/:id',
    isAuthenticated,
    (requisicao, resposta, proximo) => anuncioVagaController.getAtivo(requisicao, resposta, proximo)
);

recruitmentRoutes.post(
    '/vagas/:id/candidaturas',
    isAuthenticated,
    middlewareUploadCurriculoOpcional,
    (requisicao, resposta, proximo) => candidaturaController.createAutenticada(requisicao, resposta, proximo)
);

recruitmentRoutes.post(
    '/vagas',
    isAuthenticated,
    authorize(ROLES_GESTAO_RECRUTAMENTO),
    (requisicao, resposta, proximo) => anuncioVagaController.create(requisicao, resposta, proximo)
);

recruitmentRoutes.get(
    '/vagas',
    isAuthenticated,
    authorize(ROLES_GESTAO_RECRUTAMENTO),
    (requisicao, resposta, proximo) => anuncioVagaController.list(requisicao, resposta, proximo)
);

recruitmentRoutes.get(
    '/vagas/:id',
    isAuthenticated,
    authorize(ROLES_GESTAO_RECRUTAMENTO),
    (requisicao, resposta, proximo) => anuncioVagaController.getById(requisicao, resposta, proximo)
);

recruitmentRoutes.put(
    '/vagas/:id',
    isAuthenticated,
    authorize(ROLES_GESTAO_RECRUTAMENTO),
    (requisicao, resposta, proximo) => anuncioVagaController.update(requisicao, resposta, proximo)
);

recruitmentRoutes.patch(
    '/vagas/:id/status',
    isAuthenticated,
    authorize(ROLES_GESTAO_RECRUTAMENTO),
    (requisicao, resposta, proximo) => anuncioVagaController.updateStatus(requisicao, resposta, proximo)
);

recruitmentRoutes.get(
    '/vagas/:id/candidaturas',
    isAuthenticated,
    authorize(ROLES_GESTAO_RECRUTAMENTO),
    (requisicao, resposta, proximo) => candidaturaController.listByAnuncio(requisicao, resposta, proximo)
);

recruitmentRoutes.get(
    '/candidaturas',
    isAuthenticated,
    authorize(ROLES_GESTAO_RECRUTAMENTO),
    (requisicao, resposta, proximo) => candidaturaController.list(requisicao, resposta, proximo)
);

recruitmentRoutes.post(
    '/candidaturas/:id/reativar',
    isAuthenticated,
    authorize(ROLES_GESTAO_RECRUTAMENTO),
    (requisicao, resposta, proximo) => candidaturaController.reativar(requisicao, resposta, proximo)
);

recruitmentRoutes.post(
    '/candidaturas/:id/visualizacao',
    isAuthenticated,
    authorize(ROLES_GESTAO_RECRUTAMENTO),
    (requisicao, resposta, proximo) =>
        candidaturaController.marcarVisualizacao(requisicao, resposta, proximo)
);

recruitmentRoutes.get(
    '/candidaturas/:id',
    isAuthenticated,
    authorize(ROLES_GESTAO_RECRUTAMENTO),
    (requisicao, resposta, proximo) => candidaturaController.getById(requisicao, resposta, proximo)
);

recruitmentRoutes.get(
    '/candidaturas/:id/curriculo',
    isAuthenticated,
    authorize(ROLES_GESTAO_RECRUTAMENTO),
    (requisicao, resposta, proximo) => candidaturaController.downloadCurriculo(requisicao, resposta, proximo)
);

recruitmentRoutes.patch(
    '/candidaturas/:id/status',
    isAuthenticated,
    authorize(ROLES_GESTAO_RECRUTAMENTO),
    (requisicao, resposta, proximo) => candidaturaController.atualizarStatus(requisicao, resposta, proximo)
);

recruitmentRoutes.post(
    '/candidaturas/:id/convite-cadastro',
    isAuthenticated,
    authorize(ROLES_GESTAO_RECRUTAMENTO),
    (requisicao, resposta, proximo) =>
        cadastroContratacaoController.gerarConvite(requisicao, resposta, proximo)
);

recruitmentRoutes.get(
    '/cadastros-contratacao',
    isAuthenticated,
    authorize(ROLES_GESTAO_RECRUTAMENTO),
    (requisicao, resposta, proximo) => cadastroContratacaoController.list(requisicao, resposta, proximo)
);

recruitmentRoutes.post(
    '/cadastros-contratacao/:id/reenviar-email',
    isAuthenticated,
    authorize(ROLES_GESTAO_RECRUTAMENTO),
    (requisicao, resposta, proximo) =>
        cadastroContratacaoController.reenviarEmail(requisicao, resposta, proximo)
);

recruitmentRoutes.get(
    '/cadastros-contratacao/:id',
    isAuthenticated,
    authorize(ROLES_GESTAO_RECRUTAMENTO),
    (requisicao, resposta, proximo) => cadastroContratacaoController.getById(requisicao, resposta, proximo)
);

recruitmentRoutes.patch(
    '/cadastros-contratacao/:id/status',
    isAuthenticated,
    authorize(ROLES_GESTAO_RECRUTAMENTO),
    (requisicao, resposta, proximo) =>
        cadastroContratacaoController.atualizarStatus(requisicao, resposta, proximo)
);

export default recruitmentRoutes;
