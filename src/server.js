import app from './app.js';
import { PORT, DB_HOST, NODE_ENV } from './config/env.js';


app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT} em ambiente ${NODE_ENV}`);
    console.log(`Acesse http://${DB_HOST}:${PORT}/health para verificar o status do sistema`);
});