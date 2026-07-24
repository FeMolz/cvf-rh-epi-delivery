import env from './config/env.js';
import app from './app.js';
import { aguardarCaepiSeNecessario } from './config/aguardarCaepiInicializacao.js';
import reverterAfastamentosExpiradosService from './modules/employees/services/ReverterAfastamentosExpiradosService.js';
import limparCandidaturasDescartadasService from './modules/recruitment/services/LimparCandidaturasDescartadasService.js';

const { PORT, DB_HOST, NODE_ENV } = env;
const INTERVALO_REVERSAO_AFASTAMENTO_MS = 60 * 60 * 1000;
const INTERVALO_LIMPEZA_CANDIDATURAS_DESCARTADAS_MS = 24 * 60 * 60 * 1000;

async function executarReversaoAfastamentosExpirados() {
    try {
        const quantidade = await reverterAfastamentosExpiradosService.execute();

        if (quantidade > 0 && NODE_ENV !== 'test') {
            console.log(
                `[afastamentos] ${quantidade} funcionário(s) reativado(s) após data de retorno.`
            );
        }
    } catch (erro) {
        console.error('[afastamentos] Falha ao reverter afastamentos expirados:', erro.message);
    }
}

async function executarLimpezaCandidaturasDescartadas() {
    try {
        const quantidade = await limparCandidaturasDescartadasService.execute();

        if (quantidade > 0 && NODE_ENV !== 'test') {
            console.log(
                `[recrutamento] ${quantidade} candidatura(s) descartada(s) removida(s) permanentemente.`
            );
        }
    } catch (erro) {
        console.error('[recrutamento] Falha ao limpar candidaturas descartadas:', erro.message);
    }
}

await aguardarCaepiSeNecessario({
    nodeEnv: NODE_ENV,
    urlCaepi: env.CAEPI_API_URL,
    aguardarInicio: env.CAEPI_AGUARDAR_INICIO
});

if (NODE_ENV !== 'test') {
    await executarReversaoAfastamentosExpirados();
    setInterval(executarReversaoAfastamentosExpirados, INTERVALO_REVERSAO_AFASTAMENTO_MS);

    await executarLimpezaCandidaturasDescartadas();
    setInterval(executarLimpezaCandidaturasDescartadas, INTERVALO_LIMPEZA_CANDIDATURAS_DESCARTADAS_MS);
}

app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT} em ambiente ${NODE_ENV}`);
    console.log(`Acesse http://${DB_HOST}:${PORT}/health para verificar o status do sistema`);
});
