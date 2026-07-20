import { jest } from '@jest/globals';

import { MENSAGEM_SUPABASE_STORAGE_NAO_CONFIGURADO } from './constants/storageConstantes.js';

const createClientMock = jest.fn(() => ({
    storage: { from: jest.fn() }
}));

const envMock = {
    SUPABASE_URL: 'https://projeto.supabase.co',
    SUPABASE_SERVICE_ROLE_KEY: 'service-role-key'
};

describe('obterClienteSupabase', () => {
    let obterClienteSupabase;
    let reiniciarClienteSupabaseParaTestes;

    beforeEach(async () => {
        jest.resetModules();
        envMock.SUPABASE_URL = 'https://projeto.supabase.co';
        envMock.SUPABASE_SERVICE_ROLE_KEY = 'service-role-key';
        createClientMock.mockClear();

        jest.unstable_mockModule('@supabase/supabase-js', () => ({
            createClient: createClientMock
        }));
        jest.unstable_mockModule('../../../config/env.js', () => ({
            default: envMock
        }));

        ({ obterClienteSupabase, reiniciarClienteSupabaseParaTestes } = await import(
            './obterClienteSupabase.js'
        ));
    });

    afterEach(() => {
        reiniciarClienteSupabaseParaTestes();
        jest.resetModules();
    });

    it('deve lançar erro quando Supabase não estiver configurado', () => {
        envMock.SUPABASE_URL = null;

        expect(() => obterClienteSupabase()).toThrow(MENSAGEM_SUPABASE_STORAGE_NAO_CONFIGURADO);
        expect(createClientMock).not.toHaveBeenCalled();
    });

    it('deve lançar erro quando service role key estiver ausente', () => {
        envMock.SUPABASE_SERVICE_ROLE_KEY = null;

        expect(() => obterClienteSupabase()).toThrow(MENSAGEM_SUPABASE_STORAGE_NAO_CONFIGURADO);
        expect(createClientMock).not.toHaveBeenCalled();
    });

    it('deve criar cliente Supabase singleton com sessão desabilitada', () => {
        const cliente = obterClienteSupabase();
        const mesmoCliente = obterClienteSupabase();

        expect(createClientMock).toHaveBeenCalledTimes(1);
        expect(createClientMock).toHaveBeenCalledWith(
            'https://projeto.supabase.co',
            'service-role-key',
            {
                auth: {
                    persistSession: false,
                    autoRefreshToken: false
                }
            }
        );
        expect(cliente).toBe(mesmoCliente);
    });

    it('deve reiniciar cliente interno para testes', () => {
        obterClienteSupabase();
        reiniciarClienteSupabaseParaTestes();

        expect(createClientMock).toHaveBeenCalledTimes(1);

        obterClienteSupabase();
        expect(createClientMock).toHaveBeenCalledTimes(2);
    });
});
