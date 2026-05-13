import { jest } from '@jest/globals';

jest.unstable_mockModule('../../../config/database.js', () => ({
  default: {
    company: {
      findMany: jest.fn()
    }
  }
}));

const prisma = (await import('../../../config/database.js')).default;
const companyController = (await import('./CompanyController.js')).default;

describe('CompanyController', () => {
  let mockReq;
  let mockRes;

  beforeEach(() => {
    mockReq = {};
    mockRes = {
      json: jest.fn().mockReturnThis(),
      status: jest.fn().mockReturnThis(),
    };
    jest.clearAllMocks();
  });

  it('should return a list of companies successfully', async () => {
    const mockCompanies = [
      { id: '1', name: 'Empresa 1', cnpj: '11.111.111/0001-11', isActive: true },
      { id: '2', name: 'Empresa 2', cnpj: '22.222.222/0001-22', isActive: true }
    ];

    prisma.company.findMany.mockResolvedValue(mockCompanies);

    await companyController.findAll(mockReq, mockRes);

    expect(prisma.company.findMany).toHaveBeenCalledTimes(1);
    expect(mockRes.json).toHaveBeenCalledWith(mockCompanies);
  });

  it('should return 500 when an error occurs', async () => {
    prisma.company.findMany.mockRejectedValue(new Error('Database error'));

    // Silencia o console.error no log de testes
    jest.spyOn(console, 'error').mockImplementation(() => {});

    await companyController.findAll(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(500);
    expect(mockRes.json).toHaveBeenCalledWith({ error: 'Internal server error' });

    console.error.mockRestore();
  });
});
