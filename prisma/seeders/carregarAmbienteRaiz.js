import path from 'node:path';
import { fileURLToPath } from 'node:url';

import dotenv from 'dotenv';

const diretorioAtualArquivo = path.dirname(fileURLToPath(import.meta.url));
const diretorioRaizRepositorio = path.resolve(diretorioAtualArquivo, '../..');

dotenv.config({ path: path.join(diretorioRaizRepositorio, '.env') });

export const diretorioRaizProjeto = diretorioRaizRepositorio;
