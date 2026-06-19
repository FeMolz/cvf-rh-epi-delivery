import { criarErroHttp } from '../../../shared/errors/criarErroHttp.js';
import secullumBatidasProvider from '../../../shared/providers/SecullumProvider/SecullumBatidasProvider.js';
import { MENSAGEM_DATA_REFERENCIA_INVALIDA } from '../constants/pontoConstantes.js';
import funcionarioPontoRepository from '../repositories/FuncionarioPontoRepository.js';
import { agruparBatidasPorIdentificador } from '../utils/agruparBatidasPorIdentificador.js';
import { classificarFuncionariosComSemBatida } from '../utils/classificarFuncionariosComSemBatida.js';
import { formatarDataReferencia } from '../utils/formatarDataReferencia.js';

class ObterResumoBatidasDiaService {
    /**
     * @param {{
     *   dataReferencia?: string,
     *   companyId?: string,
     *   setorId?: string,
     *   roleId?: string
     * }} entrada
     */
    async execute(entrada = {}) {
        const dataReferencia = formatarDataReferencia(entrada.dataReferencia);

        if (!dataReferencia) {
            throw criarErroHttp(MENSAGEM_DATA_REFERENCIA_INVALIDA);
        }

        const funcionarios = await funcionarioPontoRepository.listarAtivos({
            companyId: entrada.companyId,
            setorId: entrada.setorId,
            roleId: entrada.roleId
        });

        const batidas = await secullumBatidasProvider.listarBatidas({
            dataInicio: dataReferencia,
            dataFim: dataReferencia
        });

        const indiceBatidas = agruparBatidasPorIdentificador(batidas);
        const { comBatida, semBatida } = classificarFuncionariosComSemBatida(
            funcionarios,
            indiceBatidas
        );

        return {
            dataReferencia,
            totais: {
                ativos: funcionarios.length,
                comBatida: comBatida.length,
                semBatida: semBatida.length
            },
            comBatida,
            semBatida
        };
    }
}

export default new ObterResumoBatidasDiaService();
