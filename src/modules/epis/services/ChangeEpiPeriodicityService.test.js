import { jest } from '@jest/globals';

const prismaMock = {
    roleEpi: {
        findUnique: jest.fn(),
        update: jest.fn()
    }
};

jest.unstable_mockModule('../../../config/database.js', () => ({
    default: prismaMock
}));

const changeEpiPeriodicityService = (await import('./ChangeEpiPeriodicityService.js')).default;

describe('ChangeEpiPeriodicityService', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should throw error if missing fields', async () => {
        await expect(changeEpiPeriodicityService.execute({ roleId: '1' })).rejects.toThrow('roleId, epiId e newPeriodicityDays são obrigatórios.');
    });

    it('should throw error if periodicity <= 0', async () => {
        await expect(changeEpiPeriodicityService.execute({ roleId: '1', epiId: '2', newPeriodicityDays: 0 })).rejects.toThrow('A periodicidade deve ser maior que zero.');
    });

    it('should throw error if link not found', async () => {
        prismaMock.roleEpi.findUnique.mockResolvedValue(null);
        await expect(changeEpiPeriodicityService.execute({ roleId: '1', epiId: '2', newPeriodicityDays: 30 })).rejects.toThrow('Vínculo entre este Cargo e EPI não encontrado.');
    });

    it('should update and return the link if valid', async () => {
        const mockLink = { roleId: '1', epiId: '2', periodicityDays: 30 };
        prismaMock.roleEpi.findUnique.mockResolvedValue(mockLink);
        prismaMock.roleEpi.update.mockResolvedValue({ ...mockLink, periodicityDays: 60 });

        const result = await changeEpiPeriodicityService.execute({ roleId: '1', epiId: '2', newPeriodicityDays: 60 });
        expect(result.periodicityDays).toBe(60);
        expect(prismaMock.roleEpi.update).toHaveBeenCalled();
    });
});
