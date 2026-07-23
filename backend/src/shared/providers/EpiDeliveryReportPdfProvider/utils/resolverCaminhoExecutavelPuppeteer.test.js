import { jest } from '@jest/globals';
import fs from 'node:fs';

import { resolverCaminhoExecutavelPuppeteer } from './resolverCaminhoExecutavelPuppeteer.js';

describe('resolverCaminhoExecutavelPuppeteer', () => {
    const caminhoOriginal = process.env.PUPPETEER_EXECUTABLE_PATH;
    const plataformaOriginal = process.platform;
    const localAppDataOriginal = process.env.LOCALAPPDATA;

    afterEach(() => {
        if (caminhoOriginal === undefined) {
            delete process.env.PUPPETEER_EXECUTABLE_PATH;
        } else {
            process.env.PUPPETEER_EXECUTABLE_PATH = caminhoOriginal;
        }

        if (localAppDataOriginal === undefined) {
            delete process.env.LOCALAPPDATA;
        } else {
            process.env.LOCALAPPDATA = localAppDataOriginal;
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

    it('deve ignorar caminho configurado apenas com espacos', () => {
        jest.spyOn(fs, 'existsSync').mockReturnValue(false);
        process.env.PUPPETEER_EXECUTABLE_PATH = '   ';
        Object.defineProperty(process, 'platform', { value: 'linux' });

        expect(resolverCaminhoExecutavelPuppeteer()).toBeUndefined();
    });

    it('deve buscar chrome no LOCALAPPDATA no Windows quando configurado', () => {
        const caminhoLocalAppData = 'C:\\Users\\teste\\AppData\\Local\\Google\\Chrome\\Application\\chrome.exe';

        jest.spyOn(fs, 'existsSync').mockImplementation((caminho) => caminho === caminhoLocalAppData);

        delete process.env.PUPPETEER_EXECUTABLE_PATH;
        process.env.LOCALAPPDATA = 'C:\\Users\\teste\\AppData\\Local';
        Object.defineProperty(process, 'platform', { value: 'win32' });

        expect(resolverCaminhoExecutavelPuppeteer()).toBe(caminhoLocalAppData);
    });

    it('deve buscar apenas caminhos padrao no Windows sem LOCALAPPDATA', () => {
        jest.spyOn(fs, 'existsSync').mockImplementation(
            (caminho) => caminho === 'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe'
        );

        delete process.env.PUPPETEER_EXECUTABLE_PATH;
        delete process.env.LOCALAPPDATA;
        Object.defineProperty(process, 'platform', { value: 'win32' });

        expect(resolverCaminhoExecutavelPuppeteer()).toBe(
            'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe'
        );
    });
});
