import createEmployeeService from '../services/CreateEmployeeService.js';
import deleteEmployeeService from '../services/DeleteEmployeeService.js';
import exportarFuncionarioCompletoPlanilhaService from '../services/ExportarFuncionarioCompletoPlanilhaService.js';
import exportarListaFuncionariosPlanilhaService from '../services/ExportarListaFuncionariosPlanilhaService.js';
import findEmployeeByIdService from '../services/FindEmployeeByIdService.js';
import listEmployeesService from '../services/ListEmployeesService.js';
import updateEmployeeService from '../services/UpdateEmployeeService.js';
import { criarErroHttp } from '../../../shared/errors/criarErroHttp.js';
import {
    MENSAGEM_FILTRO_EXPORTACAO_INVALIDO,
    TIPO_MIME_PLANILHA_XLSX
} from '../constants/funcionarioExportacaoConstantes.js';

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
            return next(this.normalizarErroServico(erro));
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
            const filtro = request.query.filtro;
            const resultado = await exportarListaFuncionariosPlanilhaService.execute(filtro);
            return this.enviarPlanilha(response, resultado);
        } catch (erro) {
            return next(this.normalizarErroServico(erro));
        }
    }

    async exportarFuncionarioCompleto(request, response, next) {
        try {
            const { id } = request.params;
            const resultado = await exportarFuncionarioCompletoPlanilhaService.execute(id);
            return this.enviarPlanilha(response, resultado);
        } catch (erro) {
            return next(this.normalizarErroServico(erro));
        }
    }

    async findAll(request, response, next) {
        try {
            const funcionarios = await listEmployeesService.execute();
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
            return next(this.normalizarErroServico(erro));
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

    /**
     * @param {Error} erro
     * @returns {Error}
     */
    normalizarErroServico(erro) {
        if (erro.statusCode) {
            return erro;
        }

        if (erro.code === 'NOT_FOUND') {
            erro.statusCode = 404;
            return erro;
        }

        if (erro.message === MENSAGEM_FILTRO_EXPORTACAO_INVALIDO) {
            return criarErroHttp(erro.message);
        }

        if (erro.message) {
            return criarErroHttp(erro.message);
        }

        erro.statusCode = 500;
        return erro;
    }
}

export default new EmployeeController();
