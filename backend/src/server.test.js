import { jest } from '@jest/globals';

const listenMock = jest.fn((_porta, callback) => callback());
const aguardarCaepiSeNecessarioMock = jest.fn().mockResolvedValue(undefined);
const reverterAfastamentosExpiradosServiceMock = {
    execute: jest.fn().mockResolvedValue(0)
};

function configurarMocksServidor(envConfig) {
    jest.unstable_mockModule('./config/env.js', () => ({
        default: envConfig
    }));

    jest.unstable_mockModule('./app.js', () => ({
        default: { listen: listenMock }
    }));

    jest.unstable_mockModule('./config/aguardarCaepiInicializacao.js', () => ({
        aguardarCaepiSeNecessario: aguardarCaepiSeNecessarioMock
    }));

    jest.unstable_mockModule(
        './modules/employees/services/ReverterAfastamentosExpiradosService.js',
        () => ({
            default: reverterAfastamentosExpiradosServiceMock
        })
    );
}

describe('server', () => {
    const nodeEnvAnterior = process.env.NODE_ENV;
    const setIntervalAnterior = global.setInterval;

    beforeEach(() => {
        jest.resetModules();
        listenMock.mockClear();
        aguardarCaepiSeNecessarioMock.mockClear();
        reverterAfastamentosExpiradosServiceMock.execute.mockReset();
        reverterAfastamentosExpiradosServiceMock.execute.mockResolvedValue(0);
        process.env.NODE_ENV = 'test';
    });

    afterEach(() => {
        if (nodeEnvAnterior === undefined) {
            delete process.env.NODE_ENV;
        } else {
            process.env.NODE_ENV = nodeEnvAnterior;
        }
        global.setInterval = setIntervalAnterior;
        jest.resetModules();
    });

    it('deve aguardar CAEPI e iniciar servidor em ambiente de teste', async () => {
        const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

        configurarMocksServidor({
            PORT: 3000,
            DB_HOST: 'localhost',
            NODE_ENV: 'test',
            CAEPI_API_URL: 'http://localhost:8080',
            CAEPI_AGUARDAR_INICIO: false
        });

        await import('./server.js');

        expect(aguardarCaepiSeNecessarioMock).toHaveBeenCalledWith({
            nodeEnv: 'test',
            urlCaepi: 'http://localhost:8080',
            aguardarInicio: false
        });
        expect(reverterAfastamentosExpiradosServiceMock.execute).not.toHaveBeenCalled();
        expect(listenMock).toHaveBeenCalledWith(3000, expect.any(Function));
        expect(consoleLogSpy).toHaveBeenCalledWith('Servidor rodando na porta 3000 em ambiente test');
        expect(consoleLogSpy).toHaveBeenCalledWith(
            'Acesse http://localhost:3000/health para verificar o status do sistema'
        );

        consoleLogSpy.mockRestore();
    });

    it('deve executar reversão periódica fora do ambiente de teste', async () => {
        const setIntervalMock = jest.fn();
        global.setInterval = setIntervalMock;
        const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

        configurarMocksServidor({
            PORT: 3001,
            DB_HOST: '127.0.0.1',
            NODE_ENV: 'development',
            CAEPI_API_URL: 'http://localhost:8080',
            CAEPI_AGUARDAR_INICIO: true
        });
        reverterAfastamentosExpiradosServiceMock.execute.mockResolvedValue(2);

        await import('./server.js');
        await Promise.resolve();

        expect(reverterAfastamentosExpiradosServiceMock.execute).toHaveBeenCalledTimes(1);
        expect(consoleLogSpy).toHaveBeenCalledWith(
            '[afastamentos] 2 funcionário(s) reativado(s) após data de retorno.'
        );
        expect(setIntervalMock).toHaveBeenCalledWith(expect.any(Function), 60 * 60 * 1000);

        consoleLogSpy.mockRestore();
    });

    it('deve registrar falha ao reverter afastamentos expirados', async () => {
        const setIntervalMock = jest.fn();
        global.setInterval = setIntervalMock;
        const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
        const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

        configurarMocksServidor({
            PORT: 3002,
            DB_HOST: 'localhost',
            NODE_ENV: 'development',
            CAEPI_API_URL: 'http://localhost:8080',
            CAEPI_AGUARDAR_INICIO: false
        });
        reverterAfastamentosExpiradosServiceMock.execute.mockRejectedValue(
            new Error('falha no banco')
        );

        await import('./server.js');
        await Promise.resolve();

        expect(consoleErrorSpy).toHaveBeenCalledWith(
            '[afastamentos] Falha ao reverter afastamentos expirados:',
            'falha no banco'
        );
        expect(setIntervalMock).toHaveBeenCalled();

        consoleErrorSpy.mockRestore();
        consoleLogSpy.mockRestore();
    });

    it('não deve logar reversão quando nenhum afastamento for revertido', async () => {
        const setIntervalMock = jest.fn();
        global.setInterval = setIntervalMock;
        const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

        configurarMocksServidor({
            PORT: 3003,
            DB_HOST: 'localhost',
            NODE_ENV: 'development',
            CAEPI_API_URL: 'http://localhost:8080',
            CAEPI_AGUARDAR_INICIO: false
        });
        reverterAfastamentosExpiradosServiceMock.execute.mockResolvedValue(0);

        await import('./server.js');
        await Promise.resolve();

        expect(reverterAfastamentosExpiradosServiceMock.execute).toHaveBeenCalled();
        expect(consoleLogSpy).not.toHaveBeenCalledWith(
            expect.stringContaining('[afastamentos]')
        );

        consoleLogSpy.mockRestore();
    });
});
