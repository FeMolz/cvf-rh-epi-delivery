import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const diretorioRecrutamento = path.resolve(
    path.dirname(fileURLToPath(import.meta.url)),
    '../../src/modules/recruitment'
);

function listarArquivosJs(diretorio) {
    const resultados = [];
    for (const nome of fs.readdirSync(diretorio)) {
        const caminho = path.join(diretorio, nome);
        if (fs.statSync(caminho).isDirectory()) {
            resultados.push(...listarArquivosJs(caminho));
        } else if (
            nome.endsWith('.js') &&
            !nome.endsWith('.test.js') &&
            nome !== 'lancarErroRecrutamento.js' &&
            nome !== 'recrutamentoErrosHttp.js'
        ) {
            resultados.push(caminho);
        }
    }
    return resultados;
}

for (const arquivo of listarArquivosJs(diretorioRecrutamento)) {
    let conteudo = fs.readFileSync(arquivo, 'utf8');
    if (!conteudo.includes('throw new Error(')) {
        continue;
    }

    conteudo = conteudo.replace(/throw new Error\(/g, 'lancarErroRecrutamento(');

    const relativo = path.relative(diretorioRecrutamento, path.dirname(arquivo));
    const profundidade = relativo === '' ? 0 : relativo.split(path.sep).length;
    const importRelativo =
        profundidade === 0
            ? './utils/lancarErroRecrutamento.js'
            : `${'../'.repeat(profundidade)}utils/lancarErroRecrutamento.js`;

    if (!conteudo.includes("from './utils/lancarErroRecrutamento.js'") &&
        !conteudo.includes(`from '${importRelativo}'`)) {
        const linhas = conteudo.split('\n');
        let indiceInsercao = 0;
        for (let indice = 0; indice < linhas.length; indice += 1) {
            if (linhas[indice].startsWith('import ')) {
                indiceInsercao = indice + 1;
            }
        }
        linhas.splice(
            indiceInsercao,
            0,
            `import { lancarErroRecrutamento } from '${importRelativo}';`
        );
        conteudo = linhas.join('\n');
    }

    fs.writeFileSync(arquivo, conteudo);
    console.log('Atualizado:', path.relative(process.cwd(), arquivo));
}
