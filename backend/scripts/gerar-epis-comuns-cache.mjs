/**
 * Regenera episComunsCacheConstantes.js consultando a API CAEPI local.
 * Requer: npm run docker:apoio:up -w backend
 *
 * Uso: npm run epis:cache:gerar -w backend
 */

import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const baseUrl = process.env.CAEPI_API_URL || 'http://localhost:8080';

const CATEGORIAS_BUSCA = [
    { termo: 'CAPACETE', limite: 2 },
    { termo: 'BOTINA', limite: 2 },
    { termo: 'CALÇADO BAIXO', limite: 1 },
    { termo: 'BOTA', limite: 1 },
    { termo: 'LUVA PARA PROTEÇÃO CONTRA AGENTES MECÂNICOS', limite: 1 },
    { termo: 'LUVA PARA PROTEÇÃO CONTRA AGENTES MECÂNICOS E QUÍMICOS', limite: 1 },
    { termo: 'LUVA PARA PROTEÇÃO CONTRA AGENTES QUÍMICOS', limite: 1 },
    { termo: 'LUVA PARA PROTEÇÃO CONTRA AGENTES TÉRMICOS', limite: 1 },
    { termo: 'ÓCULOS', limite: 2 },
    { termo: 'PROTETOR AUDITIVO', limite: 2 },
    { termo: 'RESPIRADOR PURIFICADOR', limite: 2 },
    { termo: 'PROTETOR FACIAL', limite: 1 },
    { termo: 'MANGA', limite: 1 }
];

function parseDataValidade(valor) {
    if (!valor || typeof valor !== 'string') {
        return null;
    }

    const partes = valor.split('/');

    if (partes.length !== 3) {
        return null;
    }

    return new Date(`${partes[2]}-${partes[1]}-${partes[0]}T12:00:00.000Z`);
}

function situacaoValida(situacao) {
    const normalizada = String(situacao || '')
        .normalize('NFD')
        .replace(/\p{M}/gu, '')
        .toUpperCase();

    return (
        !normalizada.includes('VENCIDO')
        && !normalizada.includes('CANCELADO')
        && !normalizada.includes('CASSADO')
        && !normalizada.includes('SUSPENSO')
    );
}

async function consultarCa(caNumber) {
    const resposta = await fetch(`${baseUrl}/CA/${caNumber}`);

    if (!resposta.ok) {
        return null;
    }

    return resposta.json();
}

async function buscarPorNome(termo) {
    const resposta = await fetch(
        `${baseUrl}/pesquisarPorNomeEquipamento/${encodeURIComponent(termo)}`
    );

    if (!resposta.ok) {
        return [];
    }

    const dados = await resposta.json();

    return Array.isArray(dados) ? dados : [];
}

const episPorCa = new Map();

for (const categoria of CATEGORIAS_BUSCA) {
    const resultados = await buscarPorNome(categoria.termo);
    let adicionados = 0;

    for (const item of resultados) {
        if (adicionados >= categoria.limite) {
            break;
        }

        const caNumber = String(item.caNumber || '').trim();

        if (!caNumber || episPorCa.has(caNumber)) {
            continue;
        }

        const cadastro = await consultarCa(caNumber);
        const validade = cadastro ? parseDataValidade(cadastro.DataValidade) : null;

        if (!cadastro || !situacaoValida(cadastro.Situacao) || !validade || validade <= new Date()) {
            continue;
        }

        episPorCa.set(caNumber, {
            caNumber,
            name: String(cadastro.NomeEquipamento || item.name || '').trim(),
            caExpirationDate: validade.toISOString().slice(0, 10)
        });
        adicionados += 1;
    }
}

const episOrdenados = [...episPorCa.values()].sort((a, b) =>
    a.name.localeCompare(b.name, 'pt-BR')
);

if (episOrdenados.length === 0) {
    console.error('Nenhum EPI válido encontrado. Suba a CAEPI: npm run docker:apoio:up -w backend');
    process.exit(1);
}

const linhasEpis = episOrdenados
    .map(
        (epi) => `    {
        caNumber: '${epi.caNumber}',
        name: ${JSON.stringify(epi.name)},
        caExpirationDate: '${epi.caExpirationDate}'
    }`
    )
    .join(',\n');

const conteudo = `/**
 * EPIs reais e com validade ativa na base CAEPI (MTE), selecionados por categorias
 * mais usadas em SST (capacete, calçado, luvas, óculos, auditivo, respirador, etc.).
 *
 * Fonte: consulta à API baseCAEPI em ${new Date().toISOString().slice(0, 10)}. Atualize periodicamente ou regenere
 * com \`npm run epis:cache:gerar\` quando a CAEPI estiver disponível localmente.
 *
 * Usado por \`seed_epis_cache_producao.js\` — apenas cache, sem vínculos com cargos.
 */

/** @type {Array<{ caNumber: string, name: string, caExpirationDate: string }>} */
export const EPIS_COMUNS_CACHE = [
${linhasEpis}
];
`;

const destino = join(
    dirname(fileURLToPath(import.meta.url)),
    '../prisma/seeders/dados/episComunsCacheConstantes.js'
);

writeFileSync(destino, conteudo, 'utf8');

console.log(`✅ ${episOrdenados.length} EPIs gravados em prisma/seeders/dados/episComunsCacheConstantes.js`);
