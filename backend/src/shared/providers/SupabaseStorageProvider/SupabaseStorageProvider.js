import env from '../../../config/env.js';
import {
    BUCKET_PADRAO_RELATORIOS_EPI,
    MENSAGEM_FALHA_DOWNLOAD_STORAGE,
    MENSAGEM_FALHA_REMOCAO_STORAGE,
    MENSAGEM_FALHA_UPLOAD_STORAGE,
    TIPO_MIME_PDF
} from './constants/storageConstantes.js';
import { montarPathRelatorioEpi } from './montarPathRelatorioEpi.js';
import { obterClienteSupabase } from './obterClienteSupabase.js';

class SupabaseStorageProvider {
    /**
     * @returns {string}
     */
    obterBucketRelatoriosEpi() {
        return env.SUPABASE_STORAGE_BUCKET_EPI_REPORTS || BUCKET_PADRAO_RELATORIOS_EPI;
    }

    /**
     * @param {string} identificadorFuncionario
     * @param {string} identificadorRelatorio
     * @returns {string}
     */
    montarPathRelatorioEpi(identificadorFuncionario, identificadorRelatorio) {
        return montarPathRelatorioEpi(identificadorFuncionario, identificadorRelatorio);
    }

    /**
     * @param {{ bucket: string, path: string, buffer: Buffer, contentType?: string, substituirSeExistir?: boolean }} parametrosUpload
     */
    async uploadArquivo(parametrosUpload) {
        const {
            bucket,
            path,
            buffer,
            contentType = TIPO_MIME_PDF,
            substituirSeExistir = false
        } = parametrosUpload;
        const cliente = obterClienteSupabase();

        const { error } = await cliente.storage.from(bucket).upload(path, buffer, {
            contentType,
            upsert: substituirSeExistir
        });

        if (error) {
            throw new Error(`${MENSAGEM_FALHA_UPLOAD_STORAGE} ${error.message}`);
        }
    }

    /**
     * @param {{ bucket: string, path: string }} parametrosDownload
     * @returns {Promise<Buffer>}
     */
    async downloadArquivo(parametrosDownload) {
        const { bucket, path } = parametrosDownload;
        const cliente = obterClienteSupabase();

        const { data, error } = await cliente.storage.from(bucket).download(path);

        if (error || !data) {
            const detalhe = error?.message ?? 'arquivo ausente';
            throw new Error(`${MENSAGEM_FALHA_DOWNLOAD_STORAGE} ${detalhe}`);
        }

        const arrayBuffer = await data.arrayBuffer();
        return Buffer.from(arrayBuffer);
    }

    /**
     * @param {{ bucket: string, path: string }} parametrosRemocao
     */
    async removerArquivo(parametrosRemocao) {
        const { bucket, path } = parametrosRemocao;
        const cliente = obterClienteSupabase();

        const { error } = await cliente.storage.from(bucket).remove([path]);

        if (error) {
            throw new Error(`${MENSAGEM_FALHA_REMOCAO_STORAGE} ${error.message}`);
        }
    }
}

export default new SupabaseStorageProvider();
