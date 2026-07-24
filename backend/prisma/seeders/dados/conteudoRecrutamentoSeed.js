import {
    ID_ANUNCIO_VAGA_ANALISTA,
    ID_CANDIDATURA_JOAO,
    ID_CANDIDATURA_MARIA,
    ID_EMPRESA_FILIAL_SUL,
    ID_EMPRESA_MATRIZ,
    ID_EMPRESA_RIO_SPORTS,
    ID_EMPRESA_VIVANT,
    ID_SETOR_ADMINISTRATIVO,
    ID_SETOR_ENGENHARIA,
    ID_SETOR_MARKETING,
    ID_SETOR_OBRAS,
    ID_SETOR_TI
} from './identificadoresSeedConstantes.js';
import { gerarCpfValidoSeed } from '../utils/gerarCpfValidoSeed.js';

export const QUANTIDADE_VAGAS_SEED = 10;
export const QUANTIDADE_CANDIDATURAS_SEED = 10;

const TEXTO_PADRAO_VAGA = {
    apresentacaoEmpresa: 'Empresa em expansão com foco em tecnologia para RH e SST.',
    sobreVaga: 'Oportunidade para atuar em projetos desafiadores com equipe multidisciplinar.',
    responsabilidades: 'Executar atividades do cargo, colaborar com o time e reportar resultados.',
    requisitos: 'Experiência na função, boa comunicação e comprometimento.',
    beneficios: 'Vale refeição, plano de saúde e ambiente colaborativo.',
    jornadaTrabalho: '44h semanais'
};

/**
 * @typedef {import('@prisma/client').StatusAnuncioVaga} StatusAnuncioVaga
 * @typedef {import('@prisma/client').ModoTrabalhoVaga} ModoTrabalhoVaga
 * @typedef {import('@prisma/client').TipoContratacaoVaga} TipoContratacaoVaga
 * @typedef {import('@prisma/client').StatusCandidatura} StatusCandidatura
 */

/** @returns {Array<Record<string, unknown>>} */
export function listarVagasRecrutamentoSeed() {
    return [
        {
            id: ID_ANUNCIO_VAGA_ANALISTA,
            tituloVaga: 'Analista de Sistemas Pleno',
            nomeCargo: 'Analista de Sistemas',
            companyId: ID_EMPRESA_MATRIZ,
            setorId: ID_SETOR_TI,
            localTrabalho: 'São Paulo - SP (híbrido)',
            modoTrabalho: 'HIBRIDO',
            tipoContratacao: 'CLT',
            faixaSalarial: 'R$ 6.000 - R$ 8.000',
            status: 'ATIVA',
            requisitos: 'Experiência com Node.js, PostgreSQL e boas práticas de testes.'
        },
        {
            id: 'a2000002-0002-0002-0002-000000000002',
            tituloVaga: 'Pedreiro Experiente',
            nomeCargo: 'Pedreiro',
            companyId: ID_EMPRESA_MATRIZ,
            setorId: ID_SETOR_OBRAS,
            localTrabalho: 'Campinas - SP',
            modoTrabalho: 'PRESENCIAL',
            tipoContratacao: 'CLT',
            faixaSalarial: 'R$ 3.200 - R$ 4.000',
            status: 'ATIVA'
        },
        {
            id: 'a2000003-0003-0003-0003-000000000003',
            tituloVaga: 'Auxiliar Administrativo',
            nomeCargo: 'Auxiliar Administrativo',
            companyId: ID_EMPRESA_FILIAL_SUL,
            setorId: ID_SETOR_ADMINISTRATIVO,
            localTrabalho: 'Curitiba - PR',
            modoTrabalho: 'PRESENCIAL',
            tipoContratacao: 'CLT',
            faixaSalarial: 'R$ 2.200 - R$ 2.800',
            status: 'ATIVA'
        },
        {
            id: 'a2000004-0004-0004-0004-000000000004',
            tituloVaga: 'Engenheiro Civil Sênior',
            nomeCargo: 'Engenheiro Civil',
            companyId: ID_EMPRESA_MATRIZ,
            setorId: ID_SETOR_ENGENHARIA,
            localTrabalho: 'São Paulo - SP',
            modoTrabalho: 'HIBRIDO',
            tipoContratacao: 'CLT',
            faixaSalarial: 'R$ 12.000 - R$ 15.000',
            status: 'ATIVA'
        },
        {
            id: 'a2000005-0005-0005-0005-000000000005',
            tituloVaga: 'Técnico de Segurança do Trabalho',
            nomeCargo: 'Técnico de Segurança do Trabalho',
            companyId: ID_EMPRESA_MATRIZ,
            setorId: ID_SETOR_OBRAS,
            localTrabalho: 'Santos - SP',
            modoTrabalho: 'PRESENCIAL',
            tipoContratacao: 'CLT',
            faixaSalarial: 'R$ 4.500 - R$ 5.500',
            status: 'ATIVA'
        },
        {
            id: 'a2000006-0006-0006-0006-000000000006',
            tituloVaga: 'Designer Gráfico (rascunho)',
            nomeCargo: 'Designer Gráfico',
            companyId: ID_EMPRESA_VIVANT,
            setorId: ID_SETOR_MARKETING,
            localTrabalho: 'Remoto',
            modoTrabalho: 'REMOTO',
            tipoContratacao: 'PJ',
            faixaSalarial: 'R$ 4.000 - R$ 5.000',
            status: 'INATIVA'
        },
        {
            id: 'a2000007-0007-0007-0007-000000000007',
            tituloVaga: 'Estágio em TI',
            nomeCargo: 'Técnico de TI',
            companyId: ID_EMPRESA_MATRIZ,
            setorId: ID_SETOR_TI,
            localTrabalho: 'São Paulo - SP',
            modoTrabalho: 'PRESENCIAL',
            tipoContratacao: 'ESTAGIO',
            faixaSalarial: 'Bolsa R$ 1.800',
            status: 'INATIVA'
        },
        {
            id: 'a2000008-0008-0008-0008-000000000008',
            tituloVaga: 'Gerente de Projetos',
            nomeCargo: 'Gerente de Projetos',
            companyId: ID_EMPRESA_RIO_SPORTS,
            setorId: ID_SETOR_ENGENHARIA,
            localTrabalho: 'Rio de Janeiro - RJ',
            modoTrabalho: 'HIBRIDO',
            tipoContratacao: 'CLT',
            faixaSalarial: 'R$ 10.000 - R$ 13.000',
            status: 'ENCERRADA'
        },
        {
            id: 'a2000009-0009-0009-0009-000000000009',
            tituloVaga: 'Eletricista Industrial',
            nomeCargo: 'Eletricista',
            companyId: ID_EMPRESA_MATRIZ,
            setorId: ID_SETOR_OBRAS,
            localTrabalho: 'Guarulhos - SP',
            modoTrabalho: 'PRESENCIAL',
            tipoContratacao: 'CLT',
            faixaSalarial: 'R$ 3.800 - R$ 4.500',
            status: 'ENCERRADA'
        },
        {
            id: 'a2000010-0010-0010-0010-000000000010',
            tituloVaga: 'Analista Financeiro',
            nomeCargo: 'Analista Financeiro',
            companyId: ID_EMPRESA_FILIAL_SUL,
            setorId: ID_SETOR_ADMINISTRATIVO,
            localTrabalho: 'Porto Alegre - RS',
            modoTrabalho: 'HIBRIDO',
            tipoContratacao: 'CLT',
            faixaSalarial: 'R$ 5.500 - R$ 7.000',
            status: 'ENCERRADA'
        }
    ].map((vaga) => ({
        ...TEXTO_PADRAO_VAGA,
        ...vaga
    }));
}

/** @returns {Array<Record<string, unknown>>} */
export function listarCandidaturasRecrutamentoSeed() {
    const dataDescarte = new Date('2026-07-20T10:00:00.000Z');
    const dataReativacao = new Date('2026-07-22T14:30:00.000Z');

    return [
        {
            id: ID_CANDIDATURA_MARIA,
            anuncioVagaId: ID_ANUNCIO_VAGA_ANALISTA,
            nomeCompleto: 'Maria Oliveira',
            email: 'maria.oliveira@candidato.com',
            telefone: '(11) 95555-4444',
            cpf: gerarCpfValidoSeed(1),
            cidade: 'São Paulo',
            estado: 'SP',
            pretensaoSalarial: 'R$ 7.000',
            disponibilidadeInicio: 'Imediata',
            mensagemCandidato: 'Tenho experiência com Node.js e Prisma.',
            status: 'PENDENTE'
        },
        {
            id: ID_CANDIDATURA_JOAO,
            anuncioVagaId: ID_ANUNCIO_VAGA_ANALISTA,
            nomeCompleto: 'João Pereira',
            email: 'joao.pereira@candidato.com',
            telefone: '(11) 94444-3333',
            cidade: 'Guarulhos',
            estado: 'SP',
            mensagemCandidato: 'Disponível para entrevista na próxima semana.',
            status: 'PENDENTE'
        },
        {
            id: 'b2000003-0003-0003-0003-000000000003',
            anuncioVagaId: 'a2000002-0002-0002-0002-000000000002',
            nomeCompleto: 'Ana Souza',
            email: 'ana.souza@candidato.com',
            telefone: '(19) 93333-2222',
            cpf: gerarCpfValidoSeed(3),
            cidade: 'Campinas',
            estado: 'SP',
            status: 'PROXIMA_FASE'
        },
        {
            id: 'b2000004-0004-0004-0004-000000000004',
            anuncioVagaId: 'a2000003-0003-0003-0003-000000000003',
            nomeCompleto: 'Pedro Almeida',
            email: 'pedro.almeida@candidato.com',
            telefone: '(41) 92222-1111',
            cidade: 'Curitiba',
            estado: 'PR',
            status: 'PROXIMA_FASE'
        },
        {
            id: 'b2000005-0005-0005-0005-000000000005',
            anuncioVagaId: 'a2000004-0004-0004-0004-000000000004',
            nomeCompleto: 'Lucas Martins',
            email: 'lucas.martins@candidato.com',
            telefone: '(11) 91111-0000',
            cidade: 'São Paulo',
            estado: 'SP',
            status: 'PENDENTE'
        },
        {
            id: 'b2000006-0006-0006-0006-000000000006',
            anuncioVagaId: 'a2000005-0005-0005-0005-000000000005',
            nomeCompleto: 'Fernanda Lima',
            email: 'fernanda.lima@candidato.com',
            telefone: '(13) 98888-7777',
            cidade: 'Santos',
            estado: 'SP',
            status: 'DESCARTADO',
            descartadoEm: dataDescarte
        },
        {
            id: 'b2000007-0007-0007-0007-000000000007',
            anuncioVagaId: 'a2000005-0005-0005-0005-000000000005',
            nomeCompleto: 'Ricardo Gomes',
            email: 'ricardo.gomes@candidato.com',
            telefone: '(13) 97777-6666',
            cidade: 'Praia Grande',
            estado: 'SP',
            status: 'DESCARTADO',
            descartadoEm: dataDescarte
        },
        {
            id: 'b2000008-0008-0008-0008-000000000008',
            anuncioVagaId: 'a2000008-0008-0008-0008-000000000008',
            nomeCompleto: 'Juliana Rocha',
            email: 'juliana.rocha@candidato.com',
            telefone: '(21) 96666-5555',
            cidade: 'Rio de Janeiro',
            estado: 'RJ',
            status: 'PENDENTE',
            reativadoEm: dataReativacao
        },
        {
            id: 'b2000009-0009-0009-0009-000000000009',
            anuncioVagaId: 'a2000002-0002-0002-0002-000000000002',
            nomeCompleto: 'Carlos Nunes',
            email: 'carlos.nunes@candidato.com',
            telefone: '(19) 95555-4444',
            cidade: 'Sumaré',
            estado: 'SP',
            status: 'DESCARTADO',
            descartadoEm: dataDescarte
        },
        {
            id: 'b2000010-0010-0010-0010-000000000010',
            anuncioVagaId: 'a2000004-0004-0004-0004-000000000004',
            nomeCompleto: 'Beatriz Campos',
            email: 'beatriz.campos@candidato.com',
            telefone: '(11) 94444-3333',
            cidade: 'Osasco',
            estado: 'SP',
            status: 'PENDENTE'
        }
    ];
}
