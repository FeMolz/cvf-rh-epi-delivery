import {
    ID_CARGO_ANALISTA_SISTEMAS,
    ID_CARGO_AUXILIAR_ADMINISTRATIVO,
    ID_CARGO_PEDREIRO,
    ID_EMPRESA_FILIAL_SUL,
    ID_EMPRESA_MATRIZ,
    ID_EMPRESA_RIO_SPORTS,
    ID_EMPRESA_VIVANT,
    ID_EPI_CAPACETE,
    ID_EPI_LUVA,
    ID_FUNCIONARIO_ANA,
    ID_FUNCIONARIO_BRUNO,
    ID_FUNCIONARIO_CARLA,
    ID_QUESITO_AREA_SINALIZADA,
    ID_QUESITO_USO_EPI,
    ID_SETOR_ADMINISTRATIVO,
    ID_SETOR_ALMOXARIFADO,
    ID_SETOR_ENGENHARIA,
    ID_SETOR_MARKETING,
    ID_SETOR_OBRAS,
    ID_SETOR_RIO_SPORTS,
    ID_SETOR_TI,
    ID_SETOR_VIVANT
} from './identificadoresSeedConstantes.js';
import { CAS_REAIS_EPIS_SEED } from './casReaisEpiSeedConstantes.js';
import { gerarCpfValidoSeed } from '../utils/gerarCpfValidoSeed.js';

export const QUANTIDADE_FUNCIONARIOS_SEED = 50;
export const QUANTIDADE_CARGOS_ATIVOS_SEED = 20;
export const QUANTIDADE_CARGOS_INATIVOS_SEED = 10;
export const QUANTIDADE_EPIS_SEED = 50;
export const QUANTIDADE_QUESITOS_SEED = 45;
export const ENTREGAS_POR_FUNCIONARIO_SEED = 4;
export const QUANTIDADE_CARGOS_COM_MINIMO_EPIS = 8;
export const MINIMO_EPIS_POR_CARGO_PRIORITARIO = 5;

export const EMPRESAS_SEED = [
    {
        id: ID_EMPRESA_MATRIZ,
        name: 'CVF Incorporadora',
        cnpj: '11.111.111/0001-11'
    },
    {
        id: ID_EMPRESA_FILIAL_SUL,
        name: 'Ligasul Ltda',
        cnpj: '22.222.222/0001-22'
    },
    {
        id: ID_EMPRESA_VIVANT,
        name: 'Vivant',
        cnpj: '33.333.333/0001-33'
    },
    {
        id: ID_EMPRESA_RIO_SPORTS,
        name: 'Rio Sports',
        cnpj: '44.444.444/0001-44'
    }
];

export const SETORES_SEED = [
    { id: ID_SETOR_ADMINISTRATIVO, nome: 'ADMINISTRATIVO' },
    { id: ID_SETOR_OBRAS, nome: 'OBRAS' },
    { id: ID_SETOR_TI, nome: 'TI' },
    { id: ID_SETOR_MARKETING, nome: 'MARKETING' },
    { id: ID_SETOR_ENGENHARIA, nome: 'ENGENHARIA' },
    { id: ID_SETOR_ALMOXARIFADO, nome: 'ALMOXARIFADO' },
    { id: ID_SETOR_VIVANT, nome: 'VIVANT' },
    { id: ID_SETOR_RIO_SPORTS, nome: 'RIO SPORTS' }
];

const CARGOS_ATIVOS_ADICIONAIS = [
    'Encarregado de Obra',
    'Mestre de Obras',
    'Eletricista',
    'Soldador',
    'Técnico de Segurança do Trabalho',
    'Engenheiro Civil',
    'Coordenador de Marketing',
    'Designer Gráfico',
    'Gerente de Projetos',
    'Estoquista',
    'Operador de Empilhadeira',
    'Assistente de RH',
    'Analista Financeiro',
    'Técnico de TI',
    'Supervisor de Produção',
    'Servente de Obras',
    'Pintor'
];

const CARGOS_INATIVOS_NOMES = [
    'Carpinteiro',
    'Topógrafo',
    'Armador',
    'Caldeireiro',
    'Operador de Guindaste',
    'Costureiro',
    'Recepcionista',
    'Motorista',
    'Comprador',
    'Zelador'
];

const NOMES_EPIS_BASE = [
    'Capacete de Segurança',
    'Luva de Proteção',
    'Óculos de Proteção',
    'Botina de Segurança',
    'Protetor Auricular',
    'Máscara PFF2',
    'Avental Impermeável',
    'Cinto de Segurança',
    'Mangote',
    'Perneira',
    'Colete Refletivo',
    'Capa de Chuva',
    'Protetor Facial',
    'Luva Anticorte',
    'Bota Cano Longo',
    'Talabarte',
    'Trava-Queda',
    'Respirador Semi-Facial',
    'Macacão Tyvek',
    'Luva Nitrílica',
    'Protetor Solar Industrial',
    'Capuz de Soldador',
    'Avental de Raspa',
    'Luva Vaqueta',
    'Óculos Ampla Visão'
];

const BLOCOS_QUESITOS = ['SST', 'RH', 'QUALIDADE', 'OPERACIONAL', 'MEIO AMBIENTE'];

const PRIMEIROS_NOMES = [
    'Ana',
    'Bruno',
    'Carla',
    'Daniel',
    'Eduarda',
    'Felipe',
    'Gabriela',
    'Henrique',
    'Isabela',
    'João',
    'Karina',
    'Lucas',
    'Mariana',
    'Nicolas',
    'Olivia',
    'Paulo',
    'Renata',
    'Samuel',
    'Tatiana',
    'Ulisses',
    'Vanessa',
    'William',
    'Yasmin',
    'Zeca',
    'Alice'
];

const SOBRENOMES = [
    'Silva',
    'Costa',
    'Mendes',
    'Oliveira',
    'Souza',
    'Lima',
    'Ferreira',
    'Almeida',
    'Ribeiro',
    'Carvalho',
    'Gomes',
    'Martins',
    'Barbosa',
    'Rocha',
    'Dias'
];

/**
 * @param {string} prefixoHex
 * @param {number} sequencia
 * @returns {string}
 */
export function gerarUuidDeterministico(prefixoHex, sequencia) {
    const sufixo = String(sequencia).padStart(12, '0');

    return `${prefixoHex}-0000-4000-8000-${sufixo}`;
}

/**
 * @returns {Array<{ id: string, name: string, description: string, deletedAt: null }>}
 */
export function listarCargosAtivosSeed() {
    const cargosFixos = [
        {
            id: ID_CARGO_ANALISTA_SISTEMAS,
            name: 'Analista de Sistemas',
            description: 'Desenvolvimento, sustentação e integrações de sistemas.'
        },
        {
            id: ID_CARGO_PEDREIRO,
            name: 'Pedreiro',
            description: 'Execução de serviços de alvenaria e acabamento em obras.'
        },
        {
            id: ID_CARGO_AUXILIAR_ADMINISTRATIVO,
            name: 'Auxiliar Administrativo',
            description: 'Apoio administrativo, documentação e rotinas de RH.'
        }
    ];

    const cargosGerados = CARGOS_ATIVOS_ADICIONAIS.map((name, indice) => ({
        id: gerarUuidDeterministico('b1000000', indice + 1),
        name,
        description: `Atividades relacionadas ao cargo de ${name.toLowerCase()}.`
    }));

    return [...cargosFixos, ...cargosGerados];
}

/**
 * @returns {Array<{ id: string, name: string, description: string, deletedAt: Date }>}
 */
export function listarCargosInativosSeed() {
    const dataExclusao = new Date('2024-06-15T12:00:00.000Z');

    return CARGOS_INATIVOS_NOMES.map((name, indice) => ({
        id: gerarUuidDeterministico('b2000000', indice + 1),
        name,
        description: `Cargo inativo: ${name.toLowerCase()}.`,
        deletedAt: dataExclusao
    }));
}

/**
 * @returns {Array<{ id: string, name: string, caNumber: string, caExpirationDate: Date }>}
 */
export function listarEpisSeed() {
    const epis = [];

    for (let indice = 0; indice < QUANTIDADE_EPIS_SEED; indice += 1) {
        const nomeBase = NOMES_EPIS_BASE[indice % NOMES_EPIS_BASE.length];
        const variante = Math.floor(indice / NOMES_EPIS_BASE.length) + 1;
        const id =
            indice === 0
                ? ID_EPI_CAPACETE
                : indice === 1
                  ? ID_EPI_LUVA
                  : gerarUuidDeterministico('d1000000', indice + 1);

        epis.push({
            id,
            name: variante > 1 ? `${nomeBase} ${variante}` : nomeBase,
            caNumber: CAS_REAIS_EPIS_SEED[indice],
            caExpirationDate: new Date(2027 + (indice % 3), (indice % 12) + 1, 15)
        });
    }

    return epis;
}

/**
 * @returns {Array<{ id: string, nome: string, descricao: string, bloco: string }>}
 */
export function listarQuesitosSeed() {
    const quesitos = [];

    for (let indice = 0; indice < QUANTIDADE_QUESITOS_SEED; indice += 1) {
        const bloco = BLOCOS_QUESITOS[indice % BLOCOS_QUESITOS.length];
        const numero = String(indice + 1).padStart(2, '0');
        const id =
            indice === 0
                ? ID_QUESITO_USO_EPI
                : indice === 1
                  ? ID_QUESITO_AREA_SINALIZADA
                  : gerarUuidDeterministico('e1000000', indice + 1);

        quesitos.push({
            id,
            nome: indice === 0 ? 'uso_epi_obrigatorio' : indice === 1 ? 'area_sinalizada' : `quesito_${bloco.toLowerCase()}_${numero}`,
            descricao:
                indice === 0
                    ? 'O colaborador utiliza EPI adequado às atividades?'
                    : indice === 1
                      ? 'A área de trabalho está sinalizada conforme normas?'
                      : `Quesito ${numero} de verificação do bloco ${bloco}.`,
            bloco
        });
    }

    return quesitos;
}

/**
 * @returns {Array<{ id: string, name: string, cpf: string, email: string, telefone: string, nomeCargo: string, companyId: string, setorId: string }>}
 */
export function listarFuncionariosSeed() {
    const cargosAtivos = listarCargosAtivosSeed();
    const empresas = EMPRESAS_SEED.map((empresa) => empresa.id);
    const setores = SETORES_SEED.map((setor) => setor.id);
    const funcionarios = [];

    const funcionariosFixos = [
        {
            id: ID_FUNCIONARIO_ANA,
            name: 'Ana Silva',
            cpf: '529.982.247-25',
            email: 'ana.silva@cvf.com',
            telefone: '(11) 98888-7777',
            nomeCargo: 'Analista de Sistemas',
            companyId: ID_EMPRESA_MATRIZ,
            setorId: ID_SETOR_TI
        },
        {
            id: ID_FUNCIONARIO_BRUNO,
            name: 'Bruno Costa',
            cpf: '390.533.447-05',
            email: 'bruno.costa@ligasul.com',
            telefone: '(21) 97777-6666',
            nomeCargo: 'Pedreiro',
            companyId: ID_EMPRESA_FILIAL_SUL,
            setorId: ID_SETOR_OBRAS
        },
        {
            id: ID_FUNCIONARIO_CARLA,
            name: 'Carla Mendes',
            cpf: '123.456.789-09',
            email: 'carla.mendes@cvf.com',
            telefone: '(11) 96666-5555',
            nomeCargo: 'Auxiliar Administrativo',
            companyId: ID_EMPRESA_MATRIZ,
            setorId: ID_SETOR_ALMOXARIFADO
        }
    ];

    funcionarios.push(...funcionariosFixos);

    for (let indice = 3; indice < QUANTIDADE_FUNCIONARIOS_SEED; indice += 1) {
        const nome = `${PRIMEIROS_NOMES[indice % PRIMEIROS_NOMES.length]} ${SOBRENOMES[indice % SOBRENOMES.length]}`;
        const slug = nome.toLowerCase().replace(/\s+/g, '.');

        funcionarios.push({
            id: gerarUuidDeterministico('c1000000', indice + 1),
            name: nome,
            cpf: gerarCpfValidoSeed(indice + 100),
            email: `${slug}${indice}@seed.cvf.com`,
            telefone: `(11) 9${String(1000 + indice).slice(-4)}-${String(2000 + indice).slice(-4)}`,
            nomeCargo: cargosAtivos[indice % cargosAtivos.length].name,
            companyId: empresas[indice % empresas.length],
            setorId: setores[indice % setores.length]
        });
    }

    return funcionarios;
}

/**
 * @param {Array<{ id: string }>} epis
 * @param {Array<{ id: string, name: string }>} cargosAtivos
 * @returns {Array<{ nomeCargo: string, epiId: string, periodicityDays: number }>}
 */
export function montarVinculosCargoEpiSeed(epis, cargosAtivos) {
    const vinculos = [];

    for (let indiceCargo = 0; indiceCargo < cargosAtivos.length; indiceCargo += 1) {
        const cargo = cargosAtivos[indiceCargo];
        const quantidadeEpis =
            indiceCargo < QUANTIDADE_CARGOS_COM_MINIMO_EPIS
                ? MINIMO_EPIS_POR_CARGO_PRIORITARIO
                : 2;

        for (let indiceEpi = 0; indiceEpi < quantidadeEpis; indiceEpi += 1) {
            const indiceGlobalEpi =
                indiceCargo * MINIMO_EPIS_POR_CARGO_PRIORITARIO + indiceEpi;

            vinculos.push({
                nomeCargo: cargo.name,
                epiId: epis[indiceGlobalEpi % epis.length].id,
                periodicityDays: 90 + (indiceEpi % 4) * 30
            });
        }
    }

    return vinculos;
}

/**
 * @param {Array<{ name: string }>} cargosAtivos
 * @returns {Array<{ nomeCargo: string, quesitoId: string }>}
 */
export function montarVinculosCargoQuesitoSeed(cargosAtivos, quesitos) {
    const vinculos = [];

    for (let indiceCargo = 0; indiceCargo < cargosAtivos.length; indiceCargo += 1) {
        const quantidadeQuesitos = indiceCargo < 5 ? 3 : 1;

        for (let indiceQuesito = 0; indiceQuesito < quantidadeQuesitos; indiceQuesito += 1) {
            const quesito = quesitos[(indiceCargo + indiceQuesito) % quesitos.length];

            vinculos.push({
                nomeCargo: cargosAtivos[indiceCargo].name,
                quesitoId: quesito.id
            });
        }
    }

    return vinculos;
}
