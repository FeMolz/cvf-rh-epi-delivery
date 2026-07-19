import { jest } from '@jest/globals';
import fs from 'node:fs';

import { resolverCaminhoExecutavelPuppeteer } from './resolverCaminhoExecutavelPuppeteer.js';

describe('resolverCaminhoExecutavelPuppeteer', () => {
    const caminhoOriginal = process.env.PUPPETEER_EXECUTABLE_PATH;
    const plataformaOriginal = process.platform;

    afterEach(() => {
        if (caminhoOriginal === undefined) {
            delete process.env.PUPPETEER_EXECUTABLE_PATH;
        } else {
            process.env.PUPPETEER_EXECUTABLE_PATH = caminhoOriginal;
        }

        Object.defineProperty(process, 'platform', { value: plataformaOriginal });
        jest.restoreAllMocks();
    });

    it('deve retornar caminho configurado quando arquivo existir', () => {
        jest.spyOn(fs, 'existsSync').mockImplementation((caminho) => caminho === 'C:\\chrome\\chrome.exe');

        process.env.PUPPETEER_EXECUTABLE_PATH = 'C:\\chrome\\chrome.exe';

        expect(resolverCaminhoExecutavelPuppeteer()).toBe('C:\\chrome\\chrome.exe');
    });

    it('deve ignorar caminho configurado inexistente e buscar padrao no Windows', () => {
        jest.spyOn(fs, 'existsSync').mockImplementation(
            (caminho) => caminho === 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
        );

        process.env.PUPPETEER_EXECUTABLE_PATH = 'C:\\inexistente\\chrome.exe';
        Object.defineProperty(process, 'platform', { value: 'win32' });

        expect(resolverCaminhoExecutavelPuppeteer()).toBe(
            'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
        );
    });

    it('deve retornar undefined quando nenhum caminho for encontrado', () => {
        jest.spyOn(fs, 'existsSync').mockReturnValue(false);
        delete process.env.PUPPETEER_EXECUTABLE_PATH;
        Object.defineProperty(process, 'platform', { value: 'linux' });

        expect(resolverCaminhoExecutavelPuppeteer()).toBeUndefined();
    });
});
