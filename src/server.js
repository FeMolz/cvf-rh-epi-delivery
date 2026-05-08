import app from './app.js';
import env from './config/env.js';
const { PORT, DB_HOST, NODE_ENV } = env;


app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT} em ambiente ${NODE_ENV}`);
    console.log(`Acesse http://${DB_HOST}:${PORT}/health para verificar o status do sistema`);
});