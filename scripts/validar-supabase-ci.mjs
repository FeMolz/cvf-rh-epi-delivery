import { createClient } from '@supabase/supabase-js';

/**
 * @param {string | undefined} nome
 */
function obterVariavelNormalizada(nome) {
    const valor = process.env[nome];

    if (valor === undefined || valor === null) {
        return null;
    }

    const normalizado = String(valor).trim();

    if (normalizado) {
        process.env[nome] = normalizado;
    }

    return normalizado || null;
}

const supabaseUrl = obterVariavelNormalizada('SUPABASE_URL');
const supabaseServiceRoleKey = obterVariavelNormalizada('SUPABASE_SERVICE_ROLE_KEY');
const bucket =
    obterVariavelNormalizada('SUPABASE_STORAGE_BUCKET_EPI_REPORTS') || 'epi-reports-dev-teste';

if (!supabaseUrl || !supabaseServiceRoleKey) {
    console.error(
        'Configure os secrets SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY no repositório GitHub (Settings → Secrets → Actions).'
    );
    process.exit(1);
}

const cliente = createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false }
});

const { error } = await cliente.storage.from(bucket).list('', { limit: 1 });

if (error) {
    console.error(`Falha ao acessar o bucket "${bucket}" no Supabase Storage: ${error.message}`);
    process.exit(1);
}

console.log(`Supabase OK — bucket "${bucket}" acessível com a service role key informada.`);
