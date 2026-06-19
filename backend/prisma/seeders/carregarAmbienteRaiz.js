import path from 'node:path';
import { fileURLToPath } from 'node:url';

import dotenv from 'dotenv';

const diretorioAtualArquivo = path.dirname(fileURLToPath(import.meta.url));
const diretorioRaizRepositorio = path.resolve(diretorioAtualArquivo, '../..');

const nomeArquivoAmbiente = process.env.RH_ENV_ARQUIVO || '.env';

dotenv.config({ path: path.join(diretorioRaizRepositorio, nomeArquivoAmbiente) });

export const diretorioRaizProjeto = diretorioRaizRepositorio;
