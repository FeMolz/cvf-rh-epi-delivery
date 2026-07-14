import { jest } from '@jest/globals';

const prismaClientMock = jest.fn();
const prismaPgMock = jest.fn();
const poolMock = { query: jest.fn() };
const criarPoolPostgresMock = jest.fn().mockReturnValue(poolMock);

jest.unstable_mockModule('@prisma/client', () => ({
    PrismaClient: prismaClientMock
}));

jest.unstable_mockModule('@prisma/adapter-pg', () => ({
    PrismaPg: prismaPgMock
}));

jest.unstable_mockModule('./montarPoolPostgres.js', () => ({
    criarPoolPostgres: criarPoolPostgresMock
}));

describe('database', () => {
    const databaseUrlAnterior = process.env.DATABASE_URL;

    afterEach(() => {
        if (databaseUrlAnterior === undefined) {
            delete process.env.DATABASE_URL;
        } else {
            process.env.DATABASE_URL = databaseUrlAnterior;
        }
        jest.resetModules();
    });

    it('deve inicializar Prisma com pool PostgreSQL quando DATABASE_URL estiver definida', async () => {
        process.env.DATABASE_URL = 'postgresql://usuario:senha@localhost:5432/teste';
        prismaClientMock.mockImplementation(() => ({ prisma: true }));
        prismaPgMock.mockImplementation(() => ({ adapter: true }));

        const prisma = (await import('./database.js')).default;

        expect(criarPoolPostgresMock).toHaveBeenCalledWith('postgresql://usuario:senha@localhost:5432/teste');
        expect(prismaPgMock).toHaveBeenCalledWith(poolMock);
        expect(prismaClientMock).toHaveBeenCalledWith({ adapter: { adapter: true } });
        expect(prisma).toEqual({ prisma: true });
    });

    it('deve lançar erro quando DATABASE_URL não estiver definida', async () => {
        jest.resetModules();
        jest.unstable_mockModule('dotenv/config', () => ({}));
        jest.unstable_mockModule('@prisma/client', () => ({
            PrismaClient: prismaClientMock
        }));
        jest.unstable_mockModule('@prisma/adapter-pg', () => ({
            PrismaPg: prismaPgMock
        }));
        jest.unstable_mockModule('./montarPoolPostgres.js', () => ({
            criarPoolPostgres: criarPoolPostgresMock
        }));

        delete process.env.DATABASE_URL;

        await expect(import('./database.js')).rejects.toThrow(
            'DATABASE_URL is not defined in environment variables'
        );
    });
});
