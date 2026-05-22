import multer from 'multer';
import { MENSAGEM_CURRICULO_OBRIGATORIO } from '../constants/recrutamentoConstantes.js';

const armazenamentoMemoria = multer.memoryStorage();

const uploadCurriculo = multer({
    storage: armazenamentoMemoria,
    limits: { files: 1, fileSize: 10 * 1024 * 1024 }
}).single('curriculo');

export function middlewareUploadCurriculo(requisicao, resposta, proximo) {
    uploadCurriculo(requisicao, resposta, (erro) => {
        if (erro) {
            return proximo(erro);
        }
        if (!requisicao.file) {
            return resposta.status(400).json({ error: MENSAGEM_CURRICULO_OBRIGATORIO });
        }
        return proximo();
    });
}
