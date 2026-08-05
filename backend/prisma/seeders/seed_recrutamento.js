import './carregarAmbienteRaiz.js';

import {
    StatusAnuncioVaga,
    StatusCadastroContratacao,
    TipoContratacaoVaga
} from '@prisma/client';

import prisma from '../../src/config/database.js';
import { obterConteudoPdfMinimoSeed } from './dados/conteudoPdfMinimoSeed.js';
import {
    EMAIL_ADMIN_PADRAO,
    ID_ANUNCIO_VAGA_ANALISTA,
    ID_CADASTRO_CONTRATACAO_MARIA,
    ID_CANDIDATURA_JOAO,
    ID_CANDIDATURA_MARIA,
    ID_EMPRESA_MATRIZ,
    ID_SETOR_TI,
    TOKEN_CADASTRO_MARIA
} from './dados/identificadoresSeedConstantes.js';
import { normalizarTextoMaiusculo } from '../../src/shared/utils/normalizarTextoMaiusculo.js';
import { obterIdCargoPorNome } from './utils/resolverReferenciasSeed.js';

async function main() {
    console.log('Iniciando seed de recrutamento...');

    const usuarioAdmin = await prisma.user.findUnique({
        where: { email: EMAIL_ADMIN_PADRAO }
    });

    if (!usuarioAdmin) {
        throw new Error('Usuário admin não encontrado. Execute o seed de administrador primeiro.');
    }

    const conteudoCurriculo = obterConteudoPdfMinimoSeed();
    const idCargoAnalista = await obterIdCargoPorNome('Analista de Sistemas');

    await prisma.anuncioVaga.upsert({
        where: { id: ID_ANUNCIO_VAGA_ANALISTA },
        update: {
            tituloVaga: normalizarTextoMaiusculo('Analista de Sistemas Pleno'),
            apresentacaoEmpresa: normalizarTextoMaiusculo(
                'Empresa em expansão com foco em tecnologia para RH e SST.'
            ),
            sobreVaga: normalizarTextoMaiusculo(
                'Oportunidade para atuar no desenvolvimento e sustentação de sistemas internos.'
            ),
            responsabilidades: normalizarTextoMaiusculo(
                'Desenvolver APIs, integrar módulos e apoiar o time de produto.'
            ),
            requisitos: normalizarTextoMaiusculo(
                'Experiência com Node.js, PostgreSQL e boas práticas de testes.'
            ),
            beneficios: normalizarTextoMaiusculo(
                'Vale refeição, plano de saúde e modelo híbrido.'
            ),
            localTrabalho: normalizarTextoMaiusculo('São Paulo - SP (híbrido)'),
            tipoContratacao: TipoContratacaoVaga.CLT,
            jornadaTrabalho: normalizarTextoMaiusculo('44h semanais'),
            faixaSalarial: 'R$ 6.000 - R$ 8.000',
            roleId: idCargoAnalista,
            companyId: ID_EMPRESA_MATRIZ,
            setorId: ID_SETOR_TI,
            status: StatusAnuncioVaga.ATIVA,
            criadoPorUserId: usuarioAdmin.id
        },
        create: {
            id: ID_ANUNCIO_VAGA_ANALISTA,
            tituloVaga: normalizarTextoMaiusculo('Analista de Sistemas Pleno'),
            apresentacaoEmpresa: normalizarTextoMaiusculo(
                'Empresa em expansão com foco em tecnologia para RH e SST.'
            ),
            sobreVaga: normalizarTextoMaiusculo(
                'Oportunidade para atuar no desenvolvimento e sustentação de sistemas internos.'
            ),
            responsabilidades: normalizarTextoMaiusculo(
                'Desenvolver APIs, integrar módulos e apoiar o time de produto.'
            ),
            requisitos: normalizarTextoMaiusculo(
                'Experiência com Node.js, PostgreSQL e boas práticas de testes.'
            ),
            beneficios: normalizarTextoMaiusculo(
                'Vale refeição, plano de saúde e modelo híbrido.'
            ),
            localTrabalho: normalizarTextoMaiusculo('São Paulo - SP (híbrido)'),
            tipoContratacao: TipoContratacaoVaga.CLT,
            jornadaTrabalho: normalizarTextoMaiusculo('44h semanais'),
            faixaSalarial: 'R$ 6.000 - R$ 8.000',
            roleId: idCargoAnalista,
            companyId: ID_EMPRESA_MATRIZ,
            setorId: ID_SETOR_TI,
            status: StatusAnuncioVaga.ATIVA,
            criadoPorUserId: usuarioAdmin.id
        }
    });

    console.log('- Anúncio de vaga sincronizado.');

    await prisma.candidatura.upsert({
        where: { id: ID_CANDIDATURA_MARIA },
        update: {
            anuncioVagaId: ID_ANUNCIO_VAGA_ANALISTA,
            nomeCompleto: normalizarTextoMaiusculo('Maria Oliveira'),
            email: 'maria.oliveira@candidato.com',
            telefone: '(11) 95555-4444',
            cpf: '529.982.247-25',
            cidade: normalizarTextoMaiusculo('São Paulo'),
            estado: 'SP',
            pretensaoSalarial: 'R$ 7.000',
            disponibilidadeInicio: normalizarTextoMaiusculo('Imediata'),
            mensagemCandidato: normalizarTextoMaiusculo(
                'Tenho experiência com Node.js e Prisma.'
            ),
            curriculoConteudo: conteudoCurriculo,
            curriculoNomeArquivo: 'curriculo-maria.pdf',
            curriculoTipoMime: 'application/pdf',
            curriculoTamanhoBytes: conteudoCurriculo.length
        },
        create: {
            id: ID_CANDIDATURA_MARIA,
            anuncioVagaId: ID_ANUNCIO_VAGA_ANALISTA,
            nomeCompleto: normalizarTextoMaiusculo('Maria Oliveira'),
            email: 'maria.oliveira@candidato.com',
            telefone: '(11) 95555-4444',
            cpf: '529.982.247-25',
            cidade: normalizarTextoMaiusculo('São Paulo'),
            estado: 'SP',
            pretensaoSalarial: 'R$ 7.000',
            disponibilidadeInicio: normalizarTextoMaiusculo('Imediata'),
            mensagemCandidato: normalizarTextoMaiusculo(
                'Tenho experiência com Node.js e Prisma.'
            ),
            curriculoConteudo: conteudoCurriculo,
            curriculoNomeArquivo: 'curriculo-maria.pdf',
            curriculoTipoMime: 'application/pdf',
            curriculoTamanhoBytes: conteudoCurriculo.length
        }
    });

    await prisma.candidatura.upsert({
        where: { id: ID_CANDIDATURA_JOAO },
        update: {
            anuncioVagaId: ID_ANUNCIO_VAGA_ANALISTA,
            nomeCompleto: normalizarTextoMaiusculo('João Pereira'),
            email: 'joao.pereira@candidato.com',
            telefone: '(11) 94444-3333',
            cidade: normalizarTextoMaiusculo('Guarulhos'),
            estado: 'SP',
            mensagemCandidato: normalizarTextoMaiusculo(
                'Disponível para entrevista na próxima semana.'
            ),
            curriculoConteudo: conteudoCurriculo,
            curriculoNomeArquivo: 'curriculo-joao.pdf',
            curriculoTipoMime: 'application/pdf',
            curriculoTamanhoBytes: conteudoCurriculo.length
        },
        create: {
            id: ID_CANDIDATURA_JOAO,
            anuncioVagaId: ID_ANUNCIO_VAGA_ANALISTA,
            nomeCompleto: normalizarTextoMaiusculo('João Pereira'),
            email: 'joao.pereira@candidato.com',
            telefone: '(11) 94444-3333',
            cidade: normalizarTextoMaiusculo('Guarulhos'),
            estado: 'SP',
            mensagemCandidato: normalizarTextoMaiusculo(
                'Disponível para entrevista na próxima semana.'
            ),
            curriculoConteudo: conteudoCurriculo,
            curriculoNomeArquivo: 'curriculo-joao.pdf',
            curriculoTipoMime: 'application/pdf',
            curriculoTamanhoBytes: conteudoCurriculo.length
        }
    });

    console.log('- Candidaturas sincronizadas.');

    await prisma.cadastroContratacao.upsert({
        where: { id: ID_CADASTRO_CONTRATACAO_MARIA },
        update: {
            candidaturaId: ID_CANDIDATURA_MARIA,
            tokenAcesso: TOKEN_CADASTRO_MARIA,
            roleId: idCargoAnalista,
            companyId: ID_EMPRESA_MATRIZ,
            setorId: ID_SETOR_TI,
            status: StatusCadastroContratacao.AGUARDANDO_PREENCHIMENTO,
            name: normalizarTextoMaiusculo('Maria Oliveira'),
            email: 'maria.oliveira@candidato.com',
            telefone: '(11) 95555-4444'
        },
        create: {
            id: ID_CADASTRO_CONTRATACAO_MARIA,
            candidaturaId: ID_CANDIDATURA_MARIA,
            tokenAcesso: TOKEN_CADASTRO_MARIA,
            roleId: idCargoAnalista,
            companyId: ID_EMPRESA_MATRIZ,
            setorId: ID_SETOR_TI,
            status: StatusCadastroContratacao.AGUARDANDO_PREENCHIMENTO,
            name: normalizarTextoMaiusculo('Maria Oliveira'),
            email: 'maria.oliveira@candidato.com',
            telefone: '(11) 95555-4444'
        }
    });

    console.log('- Cadastro de contratação (convite) sincronizado.');
    console.log(`  Token público de teste: ${TOKEN_CADASTRO_MARIA}`);
    console.log('\n=== RECRUTAMENTO ATUALIZADO ===');
}

main()
    .catch((erro) => {
        console.error('Erro no seed de recrutamento:', erro);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
