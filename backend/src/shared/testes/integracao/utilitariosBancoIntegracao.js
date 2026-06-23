import prisma from '../../../config/database.js';

/**
 * Garante que o Postgres de teste está acessível antes de criar fixtures.
 */
export async function verificarConexaoBancoIntegracao() {
    try {
        await prisma.$queryRaw`SELECT 1`;
    } catch (erro) {
        const urlMascarada =
            process.env.DATABASE_URL?.replace(/:([^:@/]+)@/, ':***@') ?? '(não definida)';

        throw new Error(
            `Banco de integração indisponível em ${urlMascarada}. ` +
                'Suba o Postgres de teste e aplique o schema: ' +
                'docker compose -f docker-compose.test.yml up -d && npm run db:test:push. ' +
                `Detalhe: ${erro.message}`
        );
    }
}

/**
 * @param {string} sufixo
 */
export async function criarDadosIntegracaoFuncionariosEpi(sufixo) {
    const empresa = await prisma.company.create({
        data: {
            name: `Empresa Integração ${sufixo}`,
            cnpj: `${String(sufixo).slice(-14).padStart(14, '0')}`
        }
    });

    const setor = await prisma.setor.create({
        data: { nome: `Setor Integração ${sufixo}` }
    });

    const cargo = await prisma.role.create({
        data: {
            name: `Cargo Integração ${sufixo}`,
            description: 'Cargo para testes de integração'
        }
    });

    const usuarioEntregador = await prisma.user.create({
        data: {
            name: 'Entregador EPI Teste',
            email: `entregador-${sufixo}@integracao.test`,
            passwordHash: 'hash-teste-integracao',
            role: 'ALMOXARIFADO',
            isActive: true
        }
    });

    const epi = await prisma.epi.create({
        data: {
            name: `EPI Integração ${sufixo}`,
            caNumber: `CA${String(sufixo).slice(-6).padStart(6, '0')}`,
            caExpirationDate: new Date('2030-12-31')
        }
    });

    await prisma.roleEpi.create({
        data: {
            roleId: cargo.id,
            epiId: epi.id,
            periodicityDays: 180
        }
    });

    const dataAdmissao = new Date('2024-01-15');
    const dadosBaseFuncionario = {
        telefone: '(11) 98888-7777',
        birthDate: new Date('1990-05-20'),
        admissionDate: dataAdmissao,
        companyId: empresa.id,
        roleId: cargo.id,
        setorId: setor.id
    };

    const sufixoCpf = String(sufixo).replace(/\D/g, '').slice(-11).padStart(11, '0');

    const funcionarioAtivo = await prisma.employee.create({
        data: {
            ...dadosBaseFuncionario,
            name: `Ativo ${sufixo}`,
            cpf: `${sufixoCpf.slice(0, 3)}.${sufixoCpf.slice(3, 6)}.${sufixoCpf.slice(6, 9)}-${sufixoCpf.slice(9, 11)}`,
            email: `ativo-${sufixo}@integracao.test`,
            status: 'ATIVO'
        }
    });

    const sufixoCpfFerias = String(Number(sufixoCpf) + 1).padStart(11, '0');
    const funcionarioFerias = await prisma.employee.create({
        data: {
            ...dadosBaseFuncionario,
            name: `Férias ${sufixo}`,
            cpf: `${sufixoCpfFerias.slice(0, 3)}.${sufixoCpfFerias.slice(3, 6)}.${sufixoCpfFerias.slice(6, 9)}-${sufixoCpfFerias.slice(9, 11)}`,
            email: `ferias-${sufixo}@integracao.test`,
            status: 'FERIAS'
        }
    });

    const sufixoCpfInativo = String(Number(sufixoCpf) + 2).padStart(11, '0');
    const funcionarioInativo = await prisma.employee.create({
        data: {
            ...dadosBaseFuncionario,
            name: `Inativo ${sufixo}`,
            cpf: `${sufixoCpfInativo.slice(0, 3)}.${sufixoCpfInativo.slice(3, 6)}.${sufixoCpfInativo.slice(6, 9)}-${sufixoCpfInativo.slice(9, 11)}`,
            email: `inativo-${sufixo}@integracao.test`,
            status: 'INATIVO'
        }
    });

    const vencimentoOriginal = new Date('2026-06-01');
    const entregaEpi = await prisma.epiDelivery.create({
        data: {
            employeeId: funcionarioAtivo.id,
            epiId: epi.id,
            deliveredById: usuarioEntregador.id,
            deliveryDate: new Date('2025-12-01'),
            nextDueDate: vencimentoOriginal
        }
    });

    return {
        empresa,
        setor,
        cargo,
        usuarioEntregador,
        epi,
        funcionarioAtivo,
        funcionarioFerias,
        funcionarioInativo,
        entregaEpi,
        vencimentoOriginal
    };
}

/**
 * @param {Awaited<ReturnType<typeof criarDadosIntegracaoFuncionariosEpi>>} dados
 */
export async function limparDadosIntegracaoFuncionariosEpi(dados) {
    await prisma.epiDelivery.deleteMany({
        where: { employeeId: { in: [dados.funcionarioAtivo.id, dados.funcionarioFerias.id, dados.funcionarioInativo.id] } }
    });
    await prisma.employee.deleteMany({
        where: {
            id: {
                in: [dados.funcionarioAtivo.id, dados.funcionarioFerias.id, dados.funcionarioInativo.id]
            }
        }
    });
    await prisma.roleEpi.deleteMany({ where: { roleId: dados.cargo.id } });
    await prisma.epi.delete({ where: { id: dados.epi.id } });
    await prisma.user.delete({ where: { id: dados.usuarioEntregador.id } });
    await prisma.role.delete({ where: { id: dados.cargo.id } });
    await prisma.setor.delete({ where: { id: dados.setor.id } });
    await prisma.company.delete({ where: { id: dados.empresa.id } });
}

/**
 * @returns {boolean}
 */
export function integracaoHabilitada() {
    return process.env.RUN_INTEGRATION_TESTS === 'true' && Boolean(process.env.DATABASE_URL);
}
