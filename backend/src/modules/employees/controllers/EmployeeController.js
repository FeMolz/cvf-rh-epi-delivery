import createEmployeeService from '../services/CreateEmployeeService.js';
import deleteEmployeeService from '../services/DeleteEmployeeService.js';
import exportarFuncionarioCompletoPlanilhaService from '../services/ExportarFuncionarioCompletoPlanilhaService.js';
import exportarListaFuncionariosPlanilhaService from '../services/ExportarListaFuncionariosPlanilhaService.js';
import findEmployeeByIdService from '../services/FindEmployeeByIdService.js';
import listEmployeesService from '../services/ListEmployeesService.js';
import updateEmployeeService from '../services/UpdateEmployeeService.js';
import { TIPO_MIME_PLANILHA_XLSX } from '../constants/funcionarioExportacaoConstantes.js';

class EmployeeController {
    constructor() {
        this.create = this.create.bind(this);
        this.exportarLista = this.exportarLista.bind(this);
        this.exportarFuncionarioCompleto = this.exportarFuncionarioCompleto.bind(this);
        this.findAll = this.findAll.bind(this);
        this.findById = this.findById.bind(this);
        this.update = this.update.bind(this);
        this.delete = this.delete.bind(this);
    }

    async create(request, response, next) {
        try {
            const funcionario = await createEmployeeService.execute(request.body);
            return response.status(201).json(funcionario);
        } catch (erro) {
            return next(erro);
        }
    }

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
            const { filtro, companyId, ids } = request.query ?? {};
            const resultado = await exportarListaFuncionariosPlanilhaService.execute({
                filtro,
                companyId,
                ids
            });
            return this.enviarPlanilha(response, resultado);
        } catch (erro) {
            return next(erro);
        }
    }

    async exportarFuncionarioCompleto(request, response, next) {
        try {
            const { id } = request.params;
            const resultado = await exportarFuncionarioCompletoPlanilhaService.execute(id);
            return this.enviarPlanilha(response, resultado);
        } catch (erro) {
            return next(erro);
        }
    }

    async findAll(request, response, next) {
        try {
            const funcionarios = await listEmployeesService.execute(request.query?.filtro);
            return response.json(funcionarios);
        } catch (erro) {
            return next(erro);
        }
    }

    async findById(request, response, next) {
        try {
            const { id } = request.params;
            const funcionario = await findEmployeeByIdService.execute(id);
            return response.json(funcionario);
        } catch (erro) {
            return next(erro);
        }
    }

    async update(request, response, next) {
        try {
            const { id } = request.params;
            const funcionario = await updateEmployeeService.execute(id, request.body);
            return response.json(funcionario);
        } catch (erro) {
            return next(erro);
        }
    }

    async delete(request, response, next) {
        try {
            const { id } = request.params;
            const funcionario = await deleteEmployeeService.execute(id);
            return response.json(funcionario);
        } catch (erro) {
            return next(erro);
        }
    }
}

export default new EmployeeController();
