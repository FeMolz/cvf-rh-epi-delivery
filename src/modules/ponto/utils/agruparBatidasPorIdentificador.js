import { extrairDigitosCpf } from '../../employees/utils/validarCpf.js';
import { extrairDigitosPis } from './extrairDigitosPis.js';

/**
 * @typedef {import('../../../shared/providers/SecullumProvider/utils/normalizarBatidaSecullum.js').normalizarBatidaSecullum} BatidaNormalizada
 */

/**
 * @param {BatidaNormalizada[]} batidas
 * @returns {{ porCpf: Map<string, BatidaNormalizada[]>, porPis: Map<string, BatidaNormalizada[]> }}
 */
export function agruparBatidasPorIdentificador(batidas) {
    const porCpf = new Map();
    const porPis = new Map();

    for (const batida of batidas) {
        if (batida.funcionarioCpf) {
            const digitosCpf = extrairDigitosCpf(batida.funcionarioCpf);
            const listaCpf = porCpf.get(digitosCpf) || [];
            listaCpf.push(batida);
            porCpf.set(digitosCpf, listaCpf);
        }

        if (batida.funcionarioPis) {
            const digitosPis = extrairDigitosPis(batida.funcionarioPis);
            if (digitosPis) {
                const listaPis = porPis.get(digitosPis) || [];
                listaPis.push(batida);
                porPis.set(digitosPis, listaPis);
            }
        }
    }

    return { porCpf, porPis };
}
