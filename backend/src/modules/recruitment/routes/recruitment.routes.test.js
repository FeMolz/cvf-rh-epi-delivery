import { jest } from '@jest/globals';
import request from 'supertest';
import express from 'express';

const anuncioVagaControllerMock = {
    create: jest.fn((req, res) => res.status(201).json({ id: 'v1' })),
    list: jest.fn((req, res) => res.status(200).json([])),
    listAtivos: jest.fn((req, res) => res.status(200).json([])),
    listPublico: jest.fn((req, res) => res.status(200).json([])),
    getById: jest.fn((req, res) => res.status(200).json({ id: req.params.id })),
    getAtivo: jest.fn((req, res) => res.status(200).json({ id: req.params.id })),
    getPublico: jest.fn((req, res) => res.status(200).json({ id: req.params.id })),
    update: jest.fn((req, res) => res.status(200).json({ id: req.params.id })),
    updateStatus: jest.fn((req, res) => res.status(200).json({ id: req.params.id }))
};

const candidaturaControllerMock = {
    createPublica: jest.fn((req, res) => res.status(201).json({ id: 'c1' })),
    createAutenticada: jest.fn((req, res) => res.status(201).json({ id: 'c2' })),
    atualizarStatus: jest.fn((req, res) => res.status(200).json({ id: req.params.id })),
    list: jest.fn((req, res) => res.status(200).json({ candidaturas: [] })),
    listByAnuncio: jest.fn((req, res) => res.status(200).json({ candidaturas: [] })),
    reativar: jest.fn((req, res) => res.status(200).json({ candidatura: { id: req.params.id }, destino: 'CANDIDATURAS' })),
    marcarVisualizacao: jest.fn((req, res) => res.status(200).json({ id: req.params.id })),
    getById: jest.fn((req, res) => res.status(200).json({ id: req.params.id })),
    downloadCurriculo: jest.fn((req, res) => res.status(200).send('pdf'))
};

const cadastroContratacaoControllerMock = {
    getPublico: jest.fn((req, res) => res.status(200).json({ token: req.params.token })),
    submeterPublico: jest.fn((req, res) => res.status(201).json({ id: 'cad1' })),
    gerarConvite: jest.fn((req, res) => res.status(201).json({ convite: 'ok' })),
    reenviarEmail: jest.fn((req, res) => res.status(200).json({ id: req.params.id })),
    list: jest.fn((req, res) => res.status(200).json([])),
    getById: jest.fn((req, res) => res.status(200).json({ id: req.params.id })),
    atualizarStatus: jest.fn((req, res) => res.status(200).json({ id: req.params.id }))
};

const authMiddlewareMock = {
    isAuthenticated: jest.fn((req, res, next) => {
        req.user = { id: '1', role: 'ADMINISTRATIVO' };
        next();
    })
};

const rbacMiddlewareMock = {
    authorize: jest.fn(() => (req, res, next) => next())
};

const uploadMiddlewareMock = {
    middlewareUploadCurriculo: jest.fn((req, res, next) => next()),
    middlewareUploadCurriculoOpcional: jest.fn((req, res, next) => next())
};

jest.unstable_mockModule('../controllers/AnuncioVagaController.js', () => ({
    default: anuncioVagaControllerMock
}));

jest.unstable_mockModule('../controllers/CandidaturaController.js', () => ({
    default: candidaturaControllerMock
}));

jest.unstable_mockModule('../controllers/CadastroContratacaoController.js', () => ({
    default: cadastroContratacaoControllerMock
}));

jest.unstable_mockModule('../middlewares/uploadCurriculoMiddleware.js', () => uploadMiddlewareMock);

jest.unstable_mockModule('../../../shared/middlewares/criarLimitadorTaxa.js', () => ({
    limitadorTaxaRotasPublicas: (_req, _res, next) => next()
}));

jest.unstable_mockModule('../../../shared/middlewares/auth.js', () => ({
    isAuthenticated: authMiddlewareMock.isAuthenticated
}));

jest.unstable_mockModule('../../../shared/middlewares/rbac.js', () => ({
    authorize: rbacMiddlewareMock.authorize
}));

const recruitmentRoutes = (await import('./recruitment.routes.js')).default;

const app = express();
app.use(express.json());
app.use('/recruitment', recruitmentRoutes);

describe('Recruitment Routes', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it('GET /recruitment/publico/vagas deve listar vagas publicas', async () => {
        const resposta = await request(app).get('/recruitment/publico/vagas');
        expect(resposta.statusCode).toBe(200);
        expect(anuncioVagaControllerMock.listPublico).toHaveBeenCalled();
        expect(authMiddlewareMock.isAuthenticated).not.toHaveBeenCalled();
    });

    it('GET /recruitment/publico/vagas/:id deve ser publico', async () => {
        const resposta = await request(app).get('/recruitment/publico/vagas/v1');
        expect(resposta.statusCode).toBe(200);
        expect(anuncioVagaControllerMock.getPublico).toHaveBeenCalled();
    });

    it('POST /recruitment/vagas deve exigir autenticacao', async () => {
        const resposta = await request(app).post('/recruitment/vagas').send({ tituloVaga: 'Dev' });
        expect(resposta.statusCode).toBe(201);
        expect(authMiddlewareMock.isAuthenticated).toHaveBeenCalled();
        expect(anuncioVagaControllerMock.create).toHaveBeenCalled();
    });

    it('GET /recruitment/vagas/:id/candidaturas deve listar candidaturas', async () => {
        const resposta = await request(app).get('/recruitment/vagas/v1/candidaturas');
        expect(resposta.statusCode).toBe(200);
        expect(candidaturaControllerMock.listByAnuncio).toHaveBeenCalled();
    });

    it('GET /recruitment/candidaturas deve listar todas as candidaturas', async () => {
        const resposta = await request(app).get('/recruitment/candidaturas');
        expect(resposta.statusCode).toBe(200);
        expect(candidaturaControllerMock.list).toHaveBeenCalled();
    });

    it('POST /recruitment/candidaturas/:id/reativar deve reativar candidatura', async () => {
        const resposta = await request(app).post('/recruitment/candidaturas/c1/reativar');
        expect(resposta.statusCode).toBe(200);
        expect(candidaturaControllerMock.reativar).toHaveBeenCalled();
    });

    it('POST /recruitment/candidaturas/:id/visualizacao deve marcar visualizacao', async () => {
        const resposta = await request(app)
            .post('/recruitment/candidaturas/c1/visualizacao')
            .send({ tipo: 'DESCRICAO' });
        expect(resposta.statusCode).toBe(200);
        expect(candidaturaControllerMock.marcarVisualizacao).toHaveBeenCalled();
    });

    it('GET /recruitment/vagas deve listar anuncios autenticado', async () => {
        const resposta = await request(app).get('/recruitment/vagas');
        expect(resposta.statusCode).toBe(200);
        expect(anuncioVagaControllerMock.list).toHaveBeenCalled();
    });

    it('GET /recruitment/vagas/:id deve buscar anuncio por id', async () => {
        const resposta = await request(app).get('/recruitment/vagas/v1');
        expect(resposta.statusCode).toBe(200);
        expect(anuncioVagaControllerMock.getById).toHaveBeenCalled();
    });

    it('PUT /recruitment/vagas/:id deve atualizar anuncio', async () => {
        const resposta = await request(app).put('/recruitment/vagas/v1').send({ tituloVaga: 'Novo' });
        expect(resposta.statusCode).toBe(200);
        expect(anuncioVagaControllerMock.update).toHaveBeenCalled();
    });

    it('PATCH /recruitment/vagas/:id/status deve atualizar status', async () => {
        const resposta = await request(app)
            .patch('/recruitment/vagas/v1/status')
            .send({ status: 'ATIVA' });
        expect(resposta.statusCode).toBe(200);
        expect(anuncioVagaControllerMock.updateStatus).toHaveBeenCalled();
    });

    it('POST /recruitment/publico/vagas/:id/candidaturas deve usar upload opcional', async () => {
        const resposta = await request(app).post('/recruitment/publico/vagas/v1/candidaturas');
        expect(resposta.statusCode).toBe(201);
        expect(uploadMiddlewareMock.middlewareUploadCurriculoOpcional).toHaveBeenCalled();
        expect(candidaturaControllerMock.createPublica).toHaveBeenCalled();
    });

    it('GET /recruitment/candidaturas/:id deve buscar candidatura', async () => {
        const resposta = await request(app).get('/recruitment/candidaturas/c1');
        expect(resposta.statusCode).toBe(200);
        expect(candidaturaControllerMock.getById).toHaveBeenCalled();
    });

    it('GET /recruitment/candidaturas/:id/curriculo deve baixar curriculo', async () => {
        const resposta = await request(app).get('/recruitment/candidaturas/c1/curriculo');
        expect(resposta.statusCode).toBe(200);
        expect(candidaturaControllerMock.downloadCurriculo).toHaveBeenCalled();
    });

    it('GET /recruitment/publico/cadastro-contratacao/:token deve ser publico', async () => {
        const resposta = await request(app).get('/recruitment/publico/cadastro-contratacao/token-abc');
        expect(resposta.statusCode).toBe(200);
        expect(cadastroContratacaoControllerMock.getPublico).toHaveBeenCalled();
    });

    it('POST /recruitment/publico/cadastro-contratacao/:token deve submeter cadastro', async () => {
        const resposta = await request(app)
            .post('/recruitment/publico/cadastro-contratacao/token-abc')
            .send({ nome: 'Candidato' });
        expect(resposta.statusCode).toBe(201);
        expect(cadastroContratacaoControllerMock.submeterPublico).toHaveBeenCalled();
    });

    it('POST /recruitment/candidaturas/:id/convite-cadastro deve gerar convite', async () => {
        const resposta = await request(app).post('/recruitment/candidaturas/c1/convite-cadastro');
        expect(resposta.statusCode).toBe(201);
        expect(cadastroContratacaoControllerMock.gerarConvite).toHaveBeenCalled();
    });

    it('POST /recruitment/cadastros-contratacao/:id/reenviar-email deve reenviar e-mail', async () => {
        const resposta = await request(app).post('/recruitment/cadastros-contratacao/cad1/reenviar-email');
        expect(resposta.statusCode).toBe(200);
        expect(cadastroContratacaoControllerMock.reenviarEmail).toHaveBeenCalled();
    });

    it('GET /recruitment/cadastros-contratacao deve listar cadastros', async () => {
        const resposta = await request(app).get('/recruitment/cadastros-contratacao');
        expect(resposta.statusCode).toBe(200);
        expect(cadastroContratacaoControllerMock.list).toHaveBeenCalled();
    });

    it('GET /recruitment/cadastros-contratacao/:id deve buscar cadastro', async () => {
        const resposta = await request(app).get('/recruitment/cadastros-contratacao/cad1');
        expect(resposta.statusCode).toBe(200);
        expect(cadastroContratacaoControllerMock.getById).toHaveBeenCalled();
    });

    it('PATCH /recruitment/cadastros-contratacao/:id/status deve atualizar status', async () => {
        const resposta = await request(app)
            .patch('/recruitment/cadastros-contratacao/cad1/status')
            .send({ status: 'APROVADO' });
        expect(resposta.statusCode).toBe(200);
        expect(cadastroContratacaoControllerMock.atualizarStatus).toHaveBeenCalled();
    });

    it('GET /recruitment/vagas/ativas deve listar vagas ativas autenticado', async () => {
        const resposta = await request(app).get('/recruitment/vagas/ativas');
        expect(resposta.statusCode).toBe(200);
        expect(anuncioVagaControllerMock.listAtivos).toHaveBeenCalled();
    });

    it('GET /recruitment/vagas/ativas/:id deve buscar vaga ativa', async () => {
        const resposta = await request(app).get('/recruitment/vagas/ativas/v1');
        expect(resposta.statusCode).toBe(200);
        expect(anuncioVagaControllerMock.getAtivo).toHaveBeenCalled();
    });

    it('POST /recruitment/vagas/:id/candidaturas deve criar candidatura autenticada', async () => {
        const resposta = await request(app).post('/recruitment/vagas/v1/candidaturas');
        expect(resposta.statusCode).toBe(201);
        expect(uploadMiddlewareMock.middlewareUploadCurriculoOpcional).toHaveBeenCalled();
        expect(candidaturaControllerMock.createAutenticada).toHaveBeenCalled();
    });

    it('PATCH /recruitment/candidaturas/:id/status deve atualizar status da candidatura', async () => {
        const resposta = await request(app)
            .patch('/recruitment/candidaturas/c1/status')
            .send({ status: 'PROXIMA_FASE' });
        expect(resposta.statusCode).toBe(200);
        expect(candidaturaControllerMock.atualizarStatus).toHaveBeenCalled();
    });
});
