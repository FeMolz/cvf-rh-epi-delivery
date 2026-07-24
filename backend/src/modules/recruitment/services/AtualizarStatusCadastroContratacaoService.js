import createEmployeeService from '../../employees/services/CreateEmployeeService.js';
import {
    MENSAGEM_CADASTRO_CONTRATACAO_NAO_ENCONTRADO,
    MENSAGEM_CADASTRO_NAO_AGUARDA_ANALISE,
    MENSAGEM_CADASTRO_NAO_PODE_CANCELAR,
    MENSAGEM_CAMPOS_FUNCIONARIO_OBRIGATORIOS_CADASTRO,
    MENSAGEM_STATUS_CADASTRO_INVALIDO,
    STATUS_CADASTRO_CONTRATACAO,
    STATUS_CANDIDATURA
} from '../constants/recrutamentoConstantes.js';
import cadastroContratacaoRepository from '../repositories/CadastroContratacaoRepository.js';
import candidaturaRepository from '../repositories/CandidaturaRepository.js';
import { validarDadosRhAprovacaoContratacao } from '../utils/validarDadosRhAprovacaoContratacao.js';
import { lancarErroRecrutamento } from '../utils/lancarErroRecrutamento.js';

const STATUS_CANCELAVEIS = new Set([
    STATUS_CADASTRO_CONTRATACAO.AGUARDANDO_PREENCHIMENTO,
    STATUS_CADASTRO_CONTRATACAO.AGUARDANDO_ANALISE_RH
]);

class AtualizarStatusCadastroContratacaoService {
    /**
     * @param {string} identificadorCadastro
     * @param {{ status: string, analisadoPorUserId: string, admissionDate?: string, valeTransporte?: boolean, valeAlimentacao?: boolean, planoSaude?: boolean }} entrada
     */
    async execute(identificadorCadastro, entrada) {
        const status = typeof entrada.status === 'string' ? entrada.status.trim().toUpperCase() : '';

        if (
            ![
                STATUS_CADASTRO_CONTRATACAO.CONTRATADO,
                STATUS_CADASTRO_CONTRATACAO.DESCONTINUADO
            ].includes(status)
        ) {
            lancarErroRecrutamento(MENSAGEM_STATUS_CADASTRO_INVALIDO);
        }

        const cadastro = await cadastroContratacaoRepository.findById(identificadorCadastro);
        if (!cadastro) {
            lancarErroRecrutamento(MENSAGEM_CADASTRO_CONTRATACAO_NAO_ENCONTRADO);
        }

        if (status === STATUS_CADASTRO_CONTRATACAO.DESCONTINUADO) {
            if (!STATUS_CANCELAVEIS.has(cadastro.status)) {
                lancarErroRecrutamento(MENSAGEM_CADASTRO_NAO_PODE_CANCELAR);
            }

            if (cadastro.candidaturaId) {
                await candidaturaRepository.update(cadastro.candidaturaId, {
                    status: STATUS_CANDIDATURA.DESCARTADO,
                    descartadoEm: new Date()
                });
            }

            await cadastroContratacaoRepository.delete(identificadorCadastro);
            return { id: identificadorCadastro, status: STATUS_CADASTRO_CONTRATACAO.DESCONTINUADO };
        }

        if (cadastro.status !== STATUS_CADASTRO_CONTRATACAO.AGUARDANDO_ANALISE_RH) {
            lancarErroRecrutamento(MENSAGEM_CADASTRO_NAO_AGUARDA_ANALISE);
        }

        if (
            !cadastro.name ||
            !cadastro.cpf ||
            !cadastro.email ||
            !cadastro.telefone ||
            !cadastro.birthDate
        ) {
            lancarErroRecrutamento(MENSAGEM_CAMPOS_FUNCIONARIO_OBRIGATORIOS_CADASTRO);
        }

        const dadosRh = validarDadosRhAprovacaoContratacao(entrada);

        const funcionarioCriado = await createEmployeeService.execute({
            name: cadastro.name,
            cpf: cadastro.cpf,
            email: cadastro.email,
            telefone: cadastro.telefone,
            birthDate: cadastro.birthDate,
            admissionDate: dadosRh.admissionDate,
            roleId: cadastro.roleId,
            companyId: cadastro.companyId,
            setorId: cadastro.setorId,
            status: 'ATIVO',
            nacionalidade: cadastro.nacionalidade,
            estadoCivil: cadastro.estadoCivil,
            racaCor: cadastro.racaCor,
            filiacao: cadastro.filiacao,
            grauInstrucao: cadastro.grauInstrucao,
            numeroCtps: cadastro.numeroCtps,
            serieCtps: cadastro.serieCtps,
            numeroDependentes: cadastro.numeroDependentes,
            pis: cadastro.pis,
            chavePix: cadastro.chavePix,
            cep: cadastro.cep,
            logradouro: cadastro.logradouro,
            numeroEndereco: cadastro.numeroEndereco,
            complemento: cadastro.complemento,
            bairro: cadastro.bairro,
            cidade: cadastro.cidade,
            estado: cadastro.estado,
            valeTransporte: dadosRh.valeTransporte,
            valeAlimentacao: dadosRh.valeAlimentacao,
            planoSaude: dadosRh.planoSaude
        });

        return cadastroContratacaoRepository.update(identificadorCadastro, {
            status: STATUS_CADASTRO_CONTRATACAO.CONTRATADO,
            employeeId: funcionarioCriado.id,
            admissionDate: dadosRh.admissionDate,
            valeTransporte: dadosRh.valeTransporte,
            valeAlimentacao: dadosRh.valeAlimentacao,
            planoSaude: dadosRh.planoSaude,
            analisadoPorUserId: entrada.analisadoPorUserId,
            analisadoEm: new Date()
        });
    }
}

export default new AtualizarStatusCadastroContratacaoService();
