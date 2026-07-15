import { jest } from '@jest/globals';

const epiDeliveryRepositoryMock = {
    findFuncionariosAtivos: jest.fn()
};

jest.unstable_mockModule('../repositories/EpiDeliveryRepository.js', () => ({
    default: epiDeliveryRepositoryMock
}));

const getEpiDeliveryPanelService = (await import('./GetEpiDeliveryPanelService.js')).default;

describe('GetEpiDeliveryPanelService', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it('deve retornar funcionarios elegiveis e epis vencidos', async () => {
        const ontem = new Date();
        ontem.setDate(ontem.getDate() - 2);
        ontem.setHours(0, 0, 0, 0);

        epiDeliveryRepositoryMock.findFuncionariosAtivos.mockResolvedValue([
            {
                id: 'f1',
                name: 'Ana',
                roleId: 'r1',
                role: {
                    name: 'Operador',
                    roleEpis: [
                        {
                            periodicityDays: 90,
                            epi: { id: 'e1', name: 'Capacete', caNumber: '11070' }
                        }
                    ]
                },
                epiDeliveries: [
                    {
                        epiId: 'e1',
                        deliveryDate: '2025-01-01',
                        nextDueDate: ontem.toISOString(),
                        epi: { id: 'e1' }
                    }
                ]
            }
        ]);

        const painel = await getEpiDeliveryPanelService.execute();

        expect(painel.funcionariosElegiveis).toHaveLength(1);
        expect(painel.funcionariosElegiveis[0]).toMatchObject({
            id: 'f1',
            name: 'Ana',
            roleName: 'Operador',
            resumoEpis: {
                totalEpis: 1,
                vencidos: 1,
                pendentes: 0,
                emDia: 0
            }
        });
        expect(painel.episVencidos).toHaveLength(1);
        expect(painel.episVencidos[0].caNumber).toBe('11070');
    });

    it('deve usar traco quando cargo nao existir e ignorar funcionarios sem epis no cargo', async () => {
        epiDeliveryRepositoryMock.findFuncionariosAtivos.mockResolvedValue([
            {
                id: 'f2',
                name: 'Carlos',
                roleId: null,
                role: null,
                epiDeliveries: []
            },
            {
                id: 'f3',
                name: 'Diana',
                roleId: 'r2',
                role: { name: 'Auxiliar', roleEpis: [] },
                epiDeliveries: []
            }
        ]);

        const painel = await getEpiDeliveryPanelService.execute();

        expect(painel.funcionariosElegiveis[0].roleName).toBe('—');
        expect(painel.episVencidos).toEqual([]);
    });
});
