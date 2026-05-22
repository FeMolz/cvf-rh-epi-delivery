import {
    MENSAGEM_CADASTRO_CONTRATACAO_NAO_ENCONTRADO,
    MENSAGEM_CADASTRO_NAO_DISPONIVEL_PREENCHIMENTO,
    MENSAGEM_TOKEN_CADASTRO_INVALIDO,
    STATUS_CADASTRO_CONTRATACAO
} from '../constants/recrutamentoConstantes.js';
import cadastroContratacaoRepository from '../repositories/CadastroContratacaoRepository.js';

class GetCadastroContratacaoPublicoService {
    /**
     * @param {string} tokenAcesso
     */
    async execute(tokenAcesso) {
        const token = typeof tokenAcesso === 'string' ? tokenAcesso.trim() : '';
        if (!token) {
            throw new Error(MENSAGEM_TOKEN_CADASTRO_INVALIDO);
        }

        const cadastro = await cadastroContratacaoRepository.findByToken(token);
        if (!cadastro) {
            throw new Error(MENSAGEM_CADASTRO_CONTRATACAO_NAO_ENCONTRADO);
        }

        if (cadastro.status !== STATUS_CADASTRO_CONTRATACAO.AGUARDANDO_PREENCHIMENTO) {
            throw new Error(MENSAGEM_CADASTRO_NAO_DISPONIVEL_PREENCHIMENTO);
        }

        const candidatura = cadastro.candidatura;

        return {
            tokenAcesso: cadastro.tokenAcesso,
            cargo: cadastro.role,
            empresa: cadastro.company,
            setor: cadastro.setor,
            cargoBloqueado: true,
            empresaBloqueada: true,
            setorBloqueado: true,
            sugestaoPreenchimento: {
                name: cadastro.name || candidatura?.nomeCompleto || null,
                email: cadastro.email || candidatura?.email || null,
                telefone: cadastro.telefone || candidatura?.telefone || null,
                cpf: cadastro.cpf || candidatura?.cpf || null
            },
            camposPermitidosCandidato: {
                obrigatorios: ['name', 'cpf', 'email', 'telefone', 'birthDate'],
                opcionaisPessoais: [
                    'nacionalidade',
                    'estadoCivil',
                    'racaCor',
                    'filiacao',
                    'grauInstrucao',
                    'numeroCtps',
                    'serieCtps',
                    'numeroDependentes',
                    'pis',
                    'chavePix',
                    'cep',
                    'logradouro',
                    'numeroEndereco',
                    'complemento',
                    'bairro',
                    'cidade',
                    'estado'
                ]
            },
            dadosPreenchidos: {
                name: cadastro.name,
                cpf: cadastro.cpf,
                email: cadastro.email,
                telefone: cadastro.telefone,
                birthDate: cadastro.birthDate,
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
                estado: cadastro.estado
            }
        };
    }
}

export default new GetCadastroContratacaoPublicoService();
