import { createHash } from 'node:crypto';

/**
 * Monta uma impressão digital do conteúdo do banco (contagens + max updatedAt por tabela).
 * Duas execuções com os mesmos dados produzem o mesmo hash.
 *
 * @param {import('pg').Client} cliente
 * @returns {Promise<string>}
 */
export async function calcularFingerprintBanco(cliente) {
    const { rows: tabelas } = await cliente.query(`
        SELECT tablename
        FROM pg_tables
        WHERE schemaname = 'public'
        ORDER BY tablename
    `);

    const partes = [];

    for (const { tablename } of tabelas) {
        const identificador = `"${tablename}"`;
        const contagem = await cliente.query(`SELECT count(*)::bigint AS total FROM ${identificador}`);
        let maxAtualizado = '';

        try {
            const atualizado = await cliente.query(
                `SELECT coalesce(max("updatedAt")::text, '') AS maximo FROM ${identificador}`
            );
            maxAtualizado = atualizado.rows[0].maximo;
        } catch {
            // Tabela sem coluna updatedAt — ignora.
        }

        partes.push(`${tablename}:${contagem.rows[0].total}:${maxAtualizado}`);
    }

    return createHash('sha256').update(partes.join('|')).digest('hex');
}
