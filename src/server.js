import env from './config/env.js';
import app from './app.js';
import { aguardarCaepiSeNecessario } from './config/aguardarCaepiInicializacao.js';

const { PORT, DB_HOST, NODE_ENV } = env;

await aguardarCaepiSeNecessario({
    nodeEnv: NODE_ENV,
    urlCaepi: env.CAEPI_API_URL,
    aguardarInicio: env.CAEPI_AGUARDAR_INICIO
});

app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT} em ambiente ${NODE_ENV}`);
    console.log(`Acesse http://${DB_HOST}:${PORT}/health para verificar o status do sistema`);
});
