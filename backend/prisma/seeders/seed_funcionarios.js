import './carregarAmbienteRaiz.js';

import { EmployeeStatus, EstadoCivil, GrauInstrucao } from '@prisma/client';

import prisma from '../../src/config/database.js';
import {
    ID_EMPRESA_FILIAL_SUL,
    ID_EMPRESA_MATRIZ,
    ID_FUNCIONARIO_ANA,
    ID_FUNCIONARIO_BRUNO,
    ID_FUNCIONARIO_CARLA,
    ID_SETOR_ALMOXARIFADO,
    ID_SETOR_OBRAS,
    ID_SETOR_TI
} from './dados/identificadoresSeedConstantes.js';
import { obterIdCargoPorNome } from './utils/resolverReferenciasSeed.js';

const funcionariosDados = [
    {
        id: ID_FUNCIONARIO_ANA,
        name: 'Ana Silva',
        cpf: '529.982.247-25',
        email: 'ana.silva@empresa.com',
        telefone: '(11) 98888-7777',
        birthDate: new Date('1992-04-12'),
        admissionDate: new Date('2023-01-10'),
        status: EmployeeStatus.ATIVO,
        estadoCivil: EstadoCivil.SOLTEIRO,
        grauInstrucao: GrauInstrucao.SUPERIOR_COMPLETO,
        cidade: 'São Paulo',
        estado: 'SP',
        valeTransporte: true,
        valeAlimentacao: true,
        planoSaude: false,
        nomeCargo: 'Analista de Sistemas',
        companyId: ID_EMPRESA_MATRIZ,
        setorId: ID_SETOR_TI
    },
    {
        id: ID_FUNCIONARIO_BRUNO,
        name: 'Bruno Costa',
        cpf: '390.533.447-05',
        email: 'bruno.costa@empresa.com',
        telefone: '(21) 97777-6666',
        birthDate: new Date('1988-09-20'),
        admissionDate: new Date('2022-06-01'),
        status: EmployeeStatus.ATIVO,
        estadoCivil: EstadoCivil.CASADO,
        grauInstrucao: GrauInstrucao.MEDIO_COMPLETO,
        cidade: 'Rio de Janeiro',
        estado: 'RJ',
        pis: '12345678901',
        valeTransporte: true,
        valeAlimentacao: false,
        planoSaude: true,
        nomeCargo: 'Pedreiro',
        companyId: ID_EMPRESA_FILIAL_SUL,
        setorId: ID_SETOR_OBRAS
    },
    {
        id: ID_FUNCIONARIO_CARLA,
        name: 'Carla Mendes',
        cpf: '123.456.789-09',
        email: 'carla.mendes@empresa.com',
        telefone: '(11) 96666-5555',
        birthDate: new Date('1995-11-03'),
        admissionDate: new Date('2024-02-15'),
        status: EmployeeStatus.ATIVO,
        estadoCivil: EstadoCivil.SOLTEIRO,
        grauInstrucao: GrauInstrucao.SUPERIOR_INCOMPLETO,
        cidade: 'São Paulo',
        estado: 'SP',
        valeTransporte: false,
        valeAlimentacao: true,
        planoSaude: true,
        nomeCargo: 'Auxiliar Administrativo',
        companyId: ID_EMPRESA_MATRIZ,
        setorId: ID_SETOR_ALMOXARIFADO
    }
];

async function main() {
    console.log('Iniciando seed de funcionários...');

    for (const funcionarioBruto of funcionariosDados) {
        const { nomeCargo, ...funcionarioSemCargo } = funcionarioBruto;
        const roleId = await obterIdCargoPorNome(nomeCargo);
        const funcionario = { ...funcionarioSemCargo, roleId };

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

        console.log(`- Funcionário "${funcionario.name}" sincronizado.`);
    }

    console.log('\n=== FUNCIONÁRIOS ATUALIZADOS ===');
}

main()
    .catch((erro) => {
        console.error('Erro no seed de funcionários:', erro);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
