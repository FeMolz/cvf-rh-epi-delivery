import { jest } from '@jest/globals';

const paginaMock = {
    setContent: jest.fn(),
    pdf: jest.fn(() => Promise.resolve(Buffer.from('%PDF-renderizado')))
};

const navegadorMock = {
    newPage: jest.fn(() => Promise.resolve(paginaMock)),
    close: jest.fn()
};

jest.unstable_mockModule('../../../config/env.js', () => ({
    default: {
        PUPPETEER_EXECUTABLE_PATH: null
    }
}));

jest.unstable_mockModule('puppeteer', () => ({
    default: {
        launch: jest.fn(() => Promise.resolve(navegadorMock))
    }
}));

const { renderizarHtmlParaPdf } = await import('./renderizarHtmlParaPdf.js');

describe('renderizarHtmlParaPdf', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it('deve renderizar HTML em buffer PDF via puppeteer', async () => {
        const bufferPdf = await renderizarHtmlParaPdf('<html><body>teste</body></html>');

        expect(paginaMock.setContent).toHaveBeenCalledWith(
            '<html><body>teste</body></html>',
            { waitUntil: 'networkidle0' }
        );
        expect(paginaMock.pdf).toHaveBeenCalledWith(
            expect.objectContaining({
                format: 'A4',
                printBackground: true
            })
        );
        expect(bufferPdf.toString()).toBe('%PDF-renderizado');
        expect(navegadorMock.close).toHaveBeenCalled();
    });

    it('deve usar executablePath quando env.PUPPETEER_EXECUTABLE_PATH estiver definido', async () => {
        jest.resetModules();

        const puppeteerMock = {
            launch: jest.fn(() => Promise.resolve(navegadorMock))
        };

        jest.unstable_mockModule('../../../config/env.js', () => ({
            default: {
                PUPPETEER_EXECUTABLE_PATH: 'C:\\chrome\\chrome.exe'
            }
        }));

        jest.unstable_mockModule('puppeteer', () => ({
            default: puppeteerMock
        }));

        const { renderizarHtmlParaPdf: renderizarComCaminho } = await import('./renderizarHtmlParaPdf.js');

        await renderizarComCaminho('<html></html>');

        expect(puppeteerMock.launch).toHaveBeenCalledWith(
            expect.objectContaining({
                executablePath: 'C:\\chrome\\chrome.exe'
            })
        );
    });
});
