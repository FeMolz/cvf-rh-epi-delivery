import './carregarAmbienteRaiz.js';

import { StatusCadastroContratacao } from '@prisma/client';

import prisma from '../../src/config/database.js';
import { obterConteudoPdfMinimoSeed } from './dados/conteudoPdfMinimoSeed.js';
import {
    listarCandidaturasRecrutamentoSeed,
    listarVagasRecrutamentoSeed,
    QUANTIDADE_CANDIDATURAS_SEED,
    QUANTIDADE_VAGAS_SEED
} from './dados/conteudoRecrutamentoSeed.js';
import {
    EMAIL_ADMIN_PADRAO,
    ID_CADASTRO_CONTRATACAO_MARIA,
    ID_CANDIDATURA_MARIA,
    ID_EMPRESA_MATRIZ,
    ID_SETOR_TI,
    TOKEN_CADASTRO_MARIA
} from './dados/identificadoresSeedConstantes.js';
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
    const vagas = listarVagasRecrutamentoSeed();
    const candidaturas = listarCandidaturasRecrutamentoSeed();
    const cacheCargos = new Map();

    for (const vaga of vagas) {
        let roleId = cacheCargos.get(vaga.nomeCargo);

        if (!roleId) {
            roleId = await obterIdCargoPorNome(vaga.nomeCargo);
            cacheCargos.set(vaga.nomeCargo, roleId);
        }

        const dadosVaga = {
            tituloVaga: vaga.tituloVaga,
            apresentacaoEmpresa: vaga.apresentacaoEmpresa,
            sobreVaga: vaga.sobreVaga,
            responsabilidades: vaga.responsabilidades,
            requisitos: vaga.requisitos,
            beneficios: vaga.beneficios,
            localTrabalho: vaga.localTrabalho,
            modoTrabalho: vaga.modoTrabalho,
            tipoContratacao: vaga.tipoContratacao,
            jornadaTrabalho: vaga.jornadaTrabalho,
            faixaSalarial: vaga.faixaSalarial,
            roleId,
            companyId: vaga.companyId,
            setorId: vaga.setorId,
            status: vaga.status,
            criadoPorUserId: usuarioAdmin.id
        };

        await prisma.anuncioVaga.upsert({
            where: { id: vaga.id },
            update: dadosVaga,
            create: { id: vaga.id, ...dadosVaga }
        });
    }

    console.log(`- ${vagas.length} anúncios de vaga sincronizados.`);

    for (const candidatura of candidaturas) {
        const dadosCandidatura = {
            anuncioVagaId: candidatura.anuncioVagaId,
            nomeCompleto: candidatura.nomeCompleto,
            email: candidatura.email,
            telefone: candidatura.telefone ?? null,
            cpf: candidatura.cpf ?? null,
            cidade: candidatura.cidade ?? null,
            estado: candidatura.estado ?? null,
            pretensaoSalarial: candidatura.pretensaoSalarial ?? null,
            disponibilidadeInicio: candidatura.disponibilidadeInicio ?? null,
            mensagemCandidato: candidatura.mensagemCandidato ?? null,
            status: candidatura.status,
            descartadoEm: candidatura.descartadoEm ?? null,
            reativadoEm: candidatura.reativadoEm ?? null,
            curriculoConteudo: conteudoCurriculo,
            curriculoNomeArquivo: `curriculo-${candidatura.id.slice(0, 8)}.pdf`,
            curriculoTipoMime: 'application/pdf',
            curriculoTamanhoBytes: conteudoCurriculo.length
        };

        await prisma.candidatura.upsert({
            where: { id: candidatura.id },
            update: dadosCandidatura,
            create: { id: candidatura.id, ...dadosCandidatura }
        });
    }

    console.log(`- ${candidaturas.length} candidaturas sincronizadas.`);

    const idCargoAnalista = cacheCargos.get('Analista de Sistemas')
        ?? (await obterIdCargoPorNome('Analista de Sistemas'));

    await prisma.cadastroContratacao.upsert({
        where: { id: ID_CADASTRO_CONTRATACAO_MARIA },
        update: {
            candidaturaId: ID_CANDIDATURA_MARIA,
            tokenAcesso: TOKEN_CADASTRO_MARIA,
            roleId: idCargoAnalista,
            companyId: ID_EMPRESA_MATRIZ,
            setorId: ID_SETOR_TI,
            status: StatusCadastroContratacao.AGUARDANDO_PREENCHIMENTO,
            name: 'Maria Oliveira',
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
            name: 'Maria Oliveira',
            email: 'maria.oliveira@candidato.com',
            telefone: '(11) 95555-4444'
        }
    });

    console.log('- Cadastro de contratação (convite) sincronizado.');
    console.log(`  Token público de teste: ${TOKEN_CADASTRO_MARIA}`);
    console.log(
        `\n=== RECRUTAMENTO ATUALIZADO (${QUANTIDADE_VAGAS_SEED} vagas + ${QUANTIDADE_CANDIDATURAS_SEED} candidaturas) ===`
    );
}

main()
    .catch((erro) => {
        console.error('Erro no seed de recrutamento:', erro);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
