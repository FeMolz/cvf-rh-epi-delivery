import { jest } from '@jest/globals';

const uploadMock = jest.fn();
const downloadMock = jest.fn();
const removeMock = jest.fn();
const fromMock = jest.fn(() => ({
    upload: uploadMock,
    download: downloadMock,
    remove: removeMock
}));

const createClientMock = jest.fn(() => ({
    storage: { from: fromMock }
}));

jest.unstable_mockModule('@supabase/supabase-js', () => ({
    createClient: createClientMock
}));

jest.unstable_mockModule('../../../config/env.js', () => ({
    default: {
        SUPABASE_URL: 'https://projeto.supabase.co',
        SUPABASE_SERVICE_ROLE_KEY: 'service-role-key',
        SUPABASE_STORAGE_BUCKET_EPI_REPORTS: 'epi-reports'
    }
}));

const supabaseStorageProvider = (await import('./SupabaseStorageProvider.js')).default;

describe('SupabaseStorageProvider', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it('deve fazer upload no bucket configurado', async () => {
        uploadMock.mockResolvedValue({ error: null });

        await supabaseStorageProvider.uploadArquivo({
            bucket: 'epi-reports',
            path: 'e1/r1.pdf',
            buffer: Buffer.from('%PDF')
        });

        expect(fromMock).toHaveBeenCalledWith('epi-reports');
        expect(uploadMock).toHaveBeenCalledWith(
            'e1/r1.pdf',
            Buffer.from('%PDF'),
            expect.objectContaining({ contentType: 'application/pdf', upsert: false })
        );
    });

    it('deve propagar erro de upload', async () => {
        uploadMock.mockResolvedValue({ error: { message: 'bucket inexistente' } });

        await expect(
            supabaseStorageProvider.uploadArquivo({
                bucket: 'epi-reports',
                path: 'e1/r1.pdf',
                buffer: Buffer.from('%PDF')
            })
        ).rejects.toThrow('Falha ao enviar arquivo para o Supabase Storage.');
    });

    it('deve baixar arquivo e retornar buffer', async () => {
        const conteudoEsperado = Buffer.from('%PDF-test');
        downloadMock.mockResolvedValue({
            data: {
                arrayBuffer: () => Promise.resolve(conteudoEsperado.buffer.slice(
                    conteudoEsperado.byteOffset,
                    conteudoEsperado.byteOffset + conteudoEsperado.byteLength
                ))
            },
            error: null
        });

        const buffer = await supabaseStorageProvider.downloadArquivo({
            bucket: 'epi-reports',
            path: 'e1/r1.pdf'
        });

        expect(buffer.subarray(0, 4).toString()).toBe('%PDF');
    });

    it('deve propagar erro de download', async () => {
        downloadMock.mockResolvedValue({ data: null, error: { message: 'nao encontrado' } });

        await expect(
            supabaseStorageProvider.downloadArquivo({
                bucket: 'epi-reports',
                path: 'e1/r1.pdf'
            })
        ).rejects.toThrow('Falha ao baixar arquivo do Supabase Storage.');
    });

    it('deve remover arquivo do bucket', async () => {
        removeMock.mockResolvedValue({ error: null });

        await supabaseStorageProvider.removerArquivo({
            bucket: 'epi-reports',
            path: 'e1/r1.pdf'
        });

        expect(removeMock).toHaveBeenCalledWith(['e1/r1.pdf']);
    });

    it('deve propagar erro de remocao', async () => {
        removeMock.mockResolvedValue({ error: { message: 'falha ao remover' } });

        await expect(
            supabaseStorageProvider.removerArquivo({
                bucket: 'epi-reports',
                path: 'e1/r1.pdf'
            })
        ).rejects.toThrow('Falha ao remover arquivo do Supabase Storage.');
    });

    it('deve usar bucket padrao quando env nao definir bucket', async () => {
        jest.resetModules();
        jest.unstable_mockModule('@supabase/supabase-js', () => ({
            createClient: createClientMock
        }));
        jest.unstable_mockModule('../../../config/env.js', () => ({
            default: {
                SUPABASE_URL: 'https://projeto.supabase.co',
                SUPABASE_SERVICE_ROLE_KEY: 'service-role-key',
                SUPABASE_STORAGE_BUCKET_EPI_REPORTS: null
            }
        }));

        const provider = (await import('./SupabaseStorageProvider.js')).default;

        expect(provider.obterBucketRelatoriosEpi()).toBe('epi-reports');
    });

    it('deve propagar erro de download quando arquivo estiver ausente sem mensagem', async () => {
        downloadMock.mockResolvedValue({ data: null, error: null });

        await expect(
            supabaseStorageProvider.downloadArquivo({
                bucket: 'epi-reports',
                path: 'e1/r1.pdf'
            })
        ).rejects.toThrow('Falha ao baixar arquivo do Supabase Storage. arquivo ausente');
    });

    it('deve montar path padrao de relatorio epi', () => {
        expect(supabaseStorageProvider.montarPathRelatorioEpi('e1', 'r1')).toBe('e1/r1.pdf');
        expect(supabaseStorageProvider.obterBucketRelatoriosEpi()).toBe('epi-reports');
    });
});
