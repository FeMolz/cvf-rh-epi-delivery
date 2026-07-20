import { createClient } from '@supabase/supabase-js';

import env from '../../../config/env.js';
import { MENSAGEM_SUPABASE_STORAGE_NAO_CONFIGURADO } from './constants/storageConstantes.js';

/** @type {import('@supabase/supabase-js').SupabaseClient | null} */
let clienteSupabase = null;

/**
 * @returns {import('@supabase/supabase-js').SupabaseClient}
 */
export function obterClienteSupabase() {
    if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) {
        throw new Error(MENSAGEM_SUPABASE_STORAGE_NAO_CONFIGURADO);
    }

    if (!clienteSupabase) {
        clienteSupabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
            auth: {
                persistSession: false,
                autoRefreshToken: false
            }
        });
    }

    return clienteSupabase;
}

export function reiniciarClienteSupabaseParaTestes() {
    clienteSupabase = null;
}
