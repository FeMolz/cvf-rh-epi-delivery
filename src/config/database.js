import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

import { criarPoolPostgres } from './montarPoolPostgres.js';

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
    throw new Error('DATABASE_URL is not defined in environment variables');
}

const pool = criarPoolPostgres(connectionString);
const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({ adapter });

export default prisma;
