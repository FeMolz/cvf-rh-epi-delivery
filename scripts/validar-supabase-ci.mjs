/**
 * Valida secrets Supabase no CI sem @supabase/supabase-js (evita dependência de WebSocket no Node 20).
 */

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

/**
 * @param {string} supabaseUrl
 * @param {string} serviceRoleKey
 * @param {string} bucket
 */
async function validarBucketSupabase(supabaseUrl, serviceRoleKey, bucket) {
    const baseUrl = supabaseUrl.replace(/\/$/, '');
    const resposta = await fetch(`${baseUrl}/storage/v1/object/list/${bucket}`, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${serviceRoleKey}`,
            apikey: serviceRoleKey,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            prefix: '',
            limit: 1,
            offset: 0
        })
    });

    if (!resposta.ok) {
        const detalhe = await resposta.text();
        throw new Error(`HTTP ${resposta.status}: ${detalhe || resposta.statusText}`);
    }
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

try {
    await validarBucketSupabase(supabaseUrl, supabaseServiceRoleKey, bucket);
} catch (erro) {
    const mensagem = erro instanceof Error ? erro.message : String(erro);
    console.error(`Falha ao acessar o bucket "${bucket}" no Supabase Storage: ${mensagem}`);
    process.exit(1);
}

console.log(`Supabase OK — bucket "${bucket}" acessível com a service role key informada.`);
