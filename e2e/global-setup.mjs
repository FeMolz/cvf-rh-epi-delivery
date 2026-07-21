import {
    garantirInfraestruturaTeste,
    prepararBancoTeste
} from './helpers/infraestruturaTeste.mjs';

export default async function globalSetup() {
    console.log('\n[e2e] Preparando banco de teste e seeds...');

    await garantirInfraestruturaTeste();
    prepararBancoTeste();

    console.log('[e2e] Ambiente de dados pronto.\n');
}
