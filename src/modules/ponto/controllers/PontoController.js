import obterResumoBatidasDiaService from '../services/ObterResumoBatidasDiaService.js';

class PontoController {
    constructor() {
        this.obterResumo = this.obterResumo.bind(this);
    }

    async obterResumo(request, response, next) {
        try {
            const { data, companyId, setorId, roleId } = request.query;
            const resumo = await obterResumoBatidasDiaService.execute({
                dataReferencia: data,
                companyId,
                setorId,
                roleId
            });
            return response.status(200).json(resumo);
        } catch (erro) {
            return next(erro);
        }
    }
}

export default new PontoController();
