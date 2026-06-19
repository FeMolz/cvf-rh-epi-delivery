import { extrairDigitosCpf } from '../../employees/utils/validarCpf.js';
import { extrairDigitosPis } from './extrairDigitosPis.js';

/**
 * @typedef {{ id: string, name: string, cpf: string, pis: string|null }} FuncionarioResumo
 * @typedef {import('../../../shared/providers/SecullumProvider/utils/normalizarBatidaSecullum.js').normalizarBatidaSecullum} BatidaNormalizada
 */

/**
 * @param {FuncionarioResumo} funcionario
 * @param {{ porCpf: Map<string, BatidaNormalizada[]>, porPis: Map<string, BatidaNormalizada[]> }} indiceBatidas
 * @returns {BatidaNormalizada[]}
 */
function obterBatidasDoFuncionario(funcionario, indiceBatidas) {
    const digitosCpf = extrairDigitosCpf(funcionario.cpf);
    const batidasPorCpf = indiceBatidas.porCpf.get(digitosCpf) || [];

    const digitosPis = extrairDigitosPis(funcionario.pis);
    const batidasPorPis = digitosPis ? indiceBatidas.porPis.get(digitosPis) || [] : [];

    const chavesUnicas = new Set();
    const batidasUnificadas = [];

    for (const batida of [...batidasPorCpf, ...batidasPorPis]) {
        const chave = JSON.stringify(batida.dadosBrutos);
        if (!chavesUnicas.has(chave)) {
            chavesUnicas.add(chave);
            batidasUnificadas.push(batida);
        }
    }

    return batidasUnificadas;
}

/**
 * @param {FuncionarioResumo[]} funcionarios
 * @param {{ porCpf: Map<string, BatidaNormalizada[]>, porPis: Map<string, BatidaNormalizada[]> }} indiceBatidas
 */
export function classificarFuncionariosComSemBatida(funcionarios, indiceBatidas) {
    const comBatida = [];
    const semBatida = [];

    for (const funcionario of funcionarios) {
        const batidas = obterBatidasDoFuncionario(funcionario, indiceBatidas);

        if (batidas.length > 0) {
            comBatida.push({
                employeeId: funcionario.id,
                name: funcionario.name,
                cpf: funcionario.cpf,
                pis: funcionario.pis,
                quantidadeBatidas: batidas.length,
                batidas: batidas.map(batida => ({
                    dataHora: batida.dataHora,
                    origem: batida.origem
                }))
            });
        } else {
            semBatida.push({
                employeeId: funcionario.id,
                name: funcionario.name,
                cpf: funcionario.cpf,
                pis: funcionario.pis
            });
        }
    }

    return { comBatida, semBatida };
}
