import createRoleService from '../services/CreateRoleService.js';
import alterarSituacaoCargoService from '../services/AlterarSituacaoCargoService.js';
import deleteRoleService from '../services/DeleteRoleService.js';
import exportarListaCargosPlanilhaService from '../services/ExportarListaCargosPlanilhaService.js';
import findRoleByIdService from '../services/FindRoleByIdService.js';
import listRolesService from '../services/ListRolesService.js';
import updateRoleService from '../services/UpdateRoleService.js';
import { TIPO_MIME_PLANILHA_XLSX } from '../constants/roleConstantes.js';

class RoleController {
    enviarPlanilha(response, resultadoExportacao) {
        response.setHeader('Content-Type', TIPO_MIME_PLANILHA_XLSX);
        response.setHeader(
            'Content-Disposition',
            `attachment; filename="${resultadoExportacao.nomeArquivo}"`
        );
        return response.send(resultadoExportacao.buffer);
    }

    async exportarLista(request, response, next) {
        try {
            const apenasInativos = request.query.apenasInativos === 'true';
            const resultado = await exportarListaCargosPlanilhaService.execute({ apenasInativos });
            return this.enviarPlanilha(response, resultado);
        } catch (erro) {
            return next(erro);
        }
    }
    async create(request, response, next) {
        try {
            const { name, description } = request.body;
            const cargo = await createRoleService.execute({ name, description });
            return response.status(201).json(cargo);
        } catch (erro) {
            return next(erro);
        }
    }

    async findAll(request, response, next) {
        try {
            const incluirInativos = request.query.incluirInativos === 'true';
            const apenasInativos = request.query.apenasInativos === 'true';
            const cargos = await listRolesService.execute({
                incluirInativos,
                apenasInativos,
                papelUsuario: request.user?.role
            });
            return response.status(200).json(cargos);
        } catch (erro) {
            return next(erro);
        }
    }

    async findById(request, response, next) {
        try {
            const { id } = request.params;
            const cargo = await findRoleByIdService.execute(id);
            return response.status(200).json(cargo);
        } catch (erro) {
            return next(erro);
        }
    }

    async update(request, response, next) {
        try {
            const { id } = request.params;
            const { name, description } = request.body;
            const cargo = await updateRoleService.execute(id, { name, description });
            return response.status(200).json(cargo);
        } catch (erro) {
            return next(erro);
        }
    }

    async delete(request, response, next) {
        try {
            const { id } = request.params;
            await deleteRoleService.execute(id);
            return response.status(204).send();
        } catch (erro) {
            return next(erro);
        }
    }

    async alterarSituacao(request, response, next) {
        try {
            const { id } = request.params;
            const { ativo } = request.body;
            const cargo = await alterarSituacaoCargoService.execute(id, { ativo });
            return response.status(200).json(cargo);
        } catch (erro) {
            return next(erro);
        }
    }
}

export default new RoleController();
