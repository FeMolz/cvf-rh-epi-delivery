import puppeteer from 'puppeteer';

import env from '../../../config/env.js';

/**
 * @param {string} htmlCompleto
 * @returns {Promise<Buffer>}
 */
export async function renderizarHtmlParaPdf(htmlCompleto) {
    const opcoesLaunch = {
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    };

    if (env.PUPPETEER_EXECUTABLE_PATH) {
        opcoesLaunch.executablePath = env.PUPPETEER_EXECUTABLE_PATH;
    }

    const navegador = await puppeteer.launch(opcoesLaunch);

    try {
        const pagina = await navegador.newPage();
        await pagina.setContent(htmlCompleto, { waitUntil: 'networkidle0' });
        const bytesPdf = await pagina.pdf({
            format: 'A4',
            printBackground: true,
            preferCSSPageSize: true,
            margin: {
                top: '12mm',
                right: '14mm',
                bottom: '18mm',
                left: '14mm'
            }
        });
        return Buffer.from(bytesPdf);
    } finally {
        await navegador.close();
    }
}
