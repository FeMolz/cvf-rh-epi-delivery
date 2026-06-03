import express from 'express';
import prisma from './config/database.js';
import env from './config/env.js';
import { configurarCors } from './shared/middlewares/configurarCors.js';
import { configurarHelmet } from './shared/middlewares/configurarHelmet.js';
import { identificadorRequisicao } from './shared/middlewares/identificadorRequisicao.js';
import { limitadorTaxaGlobal } from './shared/middlewares/criarLimitadorTaxa.js';

const app = express();

if (env.TRUST_PROXY_SALTOS > 0) {
    app.set('trust proxy', env.TRUST_PROXY_SALTOS);
}

app.use(identificadorRequisicao());
app.use(configurarHelmet());
app.use(configurarCors());
app.use(limitadorTaxaGlobal);
app.use(express.json({ limit: '1mb' }));

// ------------------------------------------------------------------------------------------------------------------------------------
// Importar rotas modulares
// ------------------------------------------------------------------------------------------------------------------------------------
import roleRoutes from './modules/roles/routes/role.routes.js';
import userRoutes from './modules/users/routes/user.routes.js';
import employeeRoutes from './modules/employees/routes/employee.routes.js';
import companyRoutes from './modules/companies/routes/company.routes.js';
import setorRoutes from './modules/setores/routes/setor.routes.js';
import epiRoutes from './modules/epis/routes/epi.routes.js';
import epiToRoleRoutes from './modules/chaining/epiToRole/routes/epiToRole.routes.js';
import epiDeliveryRoutes from './modules/epiDeliveries/routes/epiDelivery.routes.js';
import epiDeliveryReportRoutes from './modules/epiDeliveryReports/routes/epiDeliveryReport.routes.js';
import quesitoRoutes from './modules/quesitos/routes/quesito.routes.js';
import quesitoToRoleRoutes from './modules/chaining/quesitoToRole/routes/quesitoToRole.routes.js';
import recruitmentRoutes from './modules/recruitment/routes/recruitment.routes.js';
import pontoRoutes from './modules/ponto/routes/ponto.routes.js';

app.get('/health', async (_requisicao, resposta) => {
    try {
        await prisma.$queryRaw`SELECT 1`;
        return resposta.status(200).json({
            status: 'OK',
            database: 'OK',
            message: 'Sistema de RH e SST operacional'
        });
    } catch {
        return resposta.status(503).json({
            status: 'DEGRADED',
            database: 'UNAVAILABLE',
            message: 'API no ar, mas banco de dados indisponível'
        });
    }
});

app.use('/api/v1/roles', roleRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/employees', employeeRoutes);
app.use('/api/v1/companies', companyRoutes);
app.use('/api/v1/setores', setorRoutes);
app.use('/api/v1/epis', epiRoutes);
app.use('/api/v1/roles-epis', epiToRoleRoutes);
app.use('/api/v1/epi-deliveries', epiDeliveryRoutes);
app.use('/api/v1/epi-delivery-reports', epiDeliveryReportRoutes);
app.use('/api/v1/quesitos', quesitoRoutes);
app.use('/api/v1/roles-quesitos', quesitoToRoleRoutes);
app.use('/api/v1/recruitment', recruitmentRoutes);
app.use('/api/v1/ponto', pontoRoutes);

app.use((erro, requisicao, resposta, _proximo) => {
    const identificador = requisicao.idRequisicao || 'sem-id';

    if (process.env.NODE_ENV === 'production') {
        console.error(`[${identificador}]`, erro.message);
    } else {
        console.error(`[${identificador}]`, erro.stack);
    }

    const codigoStatus = erro.statusCode || 500;

    resposta.status(codigoStatus).json({
        error: erro.message || 'Ocorreu um erro interno no servidor',
        requestId: identificador
    });
});

export default app;
