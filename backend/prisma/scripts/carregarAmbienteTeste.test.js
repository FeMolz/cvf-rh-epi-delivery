import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { afterEach, describe, expect, it, jest } from '@jest/globals';

const diretorioScripts = path.dirname(fileURLToPath(import.meta.url));
const arquivoEnvTeste = path.join(diretorioScripts, '../../.env.test');

describe('carregarAmbienteTeste', () => {
    const envOriginal = { ...process.env };
    const existeEnvTeste = fs.existsSync(arquivoEnvTeste);

    afterEach(() => {
        process.env = { ...envOriginal };
        jest.resetModules();
    });

    it('deve aceitar DATABASE_URL do ambiente quando .env.test não existir', async () => {
        const existeSpy = jest.spyOn(fs, 'existsSync').mockReturnValue(false);
        process.env.DATABASE_URL =
            'postgresql://postgres:postgres@localhost:5432/rh_system_ci?schema=public';

        const { carregarAmbienteTeste } = await import('./carregarAmbienteTeste.mjs');
        const url = carregarAmbienteTeste();

        expect(url).toBe(process.env.DATABASE_URL);
        existeSpy.mockRestore();
    });

    it('deve carregar .env.test quando o arquivo existir', async () => {
        if (!existeEnvTeste) {
            return;
        }

        delete process.env.DATABASE_URL;

        const { carregarAmbienteTeste } = await import('./carregarAmbienteTeste.mjs');
        const url = carregarAmbienteTeste();

        expect(url).toContain('postgresql://');
    });
});
