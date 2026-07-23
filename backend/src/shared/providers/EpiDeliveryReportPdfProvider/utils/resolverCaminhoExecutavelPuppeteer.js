import fs from 'node:fs';

const CAMINHOS_CHROME_WINDOWS = [
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe'
];

/**
 * @param {string} caminho
 * @returns {string | null}
 */
function caminhoExecutavelExistente(caminho) {
    if (!caminho || typeof caminho !== 'string') {
        return null;
    }

    const caminhoNormalizado = caminho.trim();
    if (!caminhoNormalizado) {
        return null;
    }

    return fs.existsSync(caminhoNormalizado) ? caminhoNormalizado : null;
}

/**
 * Resolve o executável do Chromium/Chrome para o Puppeteer.
 * @returns {string | undefined}
 */
export function resolverCaminhoExecutavelPuppeteer() {
    const caminhoConfigurado = caminhoExecutavelExistente(process.env.PUPPETEER_EXECUTABLE_PATH);
    if (caminhoConfigurado) {
        return caminhoConfigurado;
    }

    if (process.platform === 'win32') {
        const caminhoLocalAppData = process.env.LOCALAPPDATA
            ? `${process.env.LOCALAPPDATA}\\Google\\Chrome\\Application\\chrome.exe`
            : null;
        const candidatos = caminhoLocalAppData
            ? [...CAMINHOS_CHROME_WINDOWS, caminhoLocalAppData]
            : CAMINHOS_CHROME_WINDOWS;

        for (const caminho of candidatos) {
            const caminhoExistente = caminhoExecutavelExistente(caminho);
            if (caminhoExistente) {
                return caminhoExistente;
            }
        }
    }

    return undefined;
}
