import './carregarAmbienteRaiz.js';

import { EmployeeStatus, EstadoCivil, GrauInstrucao } from '@prisma/client';

import prisma from '../../src/config/database.js';
import {
    QUANTIDADE_FUNCIONARIOS_SEED,
    listarFuncionariosSeed
} from './dados/conteudoVolumeSeedTeste.js';
import { obterIdCargoPorNome } from './utils/resolverReferenciasSeed.js';
import { sincronizarEmpresasSetoresTeste } from './utils/sincronizarEmpresasSetoresTeste.js';

const ESTADOS_CIVIS = [
    EstadoCivil.SOLTEIRO,
    EstadoCivil.CASADO,
    EstadoCivil.DIVORCIADO,
    EstadoCivil.VIUVO
];

const GRAUS_INSTRUCAO = [
    GrauInstrucao.MEDIO_COMPLETO,
    GrauInstrucao.SUPERIOR_INCOMPLETO,
    GrauInstrucao.SUPERIOR_COMPLETO,
    GrauInstrucao.POS_GRADUACAO
];

async function main() {
    console.log('Iniciando seed de funcionários...');

    await sincronizarEmpresasSetoresTeste();
    console.log('- Empresas e setores de teste sincronizados.');

    const funcionariosDados = listarFuncionariosSeed();

    for (const [indice, funcionarioBruto] of funcionariosDados.entries()) {
        const { nomeCargo, ...funcionarioSemCargo } = funcionarioBruto;
        const roleId = await obterIdCargoPorNome(nomeCargo);
        const funcionario = {
            ...funcionarioSemCargo,
            roleId,
            birthDate: new Date(1985 + (indice % 15), indice % 12, (indice % 27) + 1),
            admissionDate: new Date(2020 + (indice % 5), indice % 12, (indice % 20) + 1),
            status: EmployeeStatus.ATIVO,
            estadoCivil: ESTADOS_CIVIS[indice % ESTADOS_CIVIS.length],
            grauInstrucao: GRAUS_INSTRUCAO[indice % GRAUS_INSTRUCAO.length],
            cidade: indice % 2 === 0 ? 'SÃO PAULO' : 'RIO DE JANEIRO',
            estado: indice % 2 === 0 ? 'SP' : 'RJ',
            valeTransporte: indice % 2 === 0,
            valeAlimentacao: indice % 3 !== 0,
            planoSaude: indice % 4 === 0
        };

        const existentePorCpf = await prisma.employee.findUnique({
            where: { cpf: funcionario.cpf }
        });

        if (existentePorCpf && existentePorCpf.id !== funcionario.id) {
            await prisma.employee.delete({ where: { id: existentePorCpf.id } });
        }

        await prisma.employee.upsert({
            where: { id: funcionario.id },
            update: {
                ...funcionario,
                deletedAt: null
            },
            create: funcionario
        });
    }

    console.log(`- ${funcionariosDados.length} funcionários sincronizados.`);
    console.log(`\n=== FUNCIONÁRIOS ATUALIZADOS (${QUANTIDADE_FUNCIONARIOS_SEED} registros) ===`);
}

main()
    .catch((erro) => {
        console.error('Erro no seed de funcionários:', erro);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
