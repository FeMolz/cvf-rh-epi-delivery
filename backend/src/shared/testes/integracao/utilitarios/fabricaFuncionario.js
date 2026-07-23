import prisma from '../../../../config/database.js';
import { gerarCpfIntegracao } from './gerarCpfIntegracao.js';

/**
 * @param {{
 *   sufixo: string,
 *   empresaId: string,
 *   cargoId: string,
 *   setorId: string,
 *   status?: string
 * }} parametros
 */
export async function criarFuncionarioIntegracao({
    sufixo,
    empresaId,
    cargoId,
    setorId,
    status = 'ATIVO'
}) {
    return prisma.employee.create({
        data: {
            name: `Funcionário ${sufixo}`,
            cpf: gerarCpfIntegracao(sufixo),
            email: `funcionario-${sufixo}@integracao.test`,
            telefone: '(11) 98888-7777',
            birthDate: new Date('1990-05-20'),
            admissionDate: new Date('2024-01-15'),
            companyId: empresaId,
            roleId: cargoId,
            setorId,
            status
        }
    });
}
