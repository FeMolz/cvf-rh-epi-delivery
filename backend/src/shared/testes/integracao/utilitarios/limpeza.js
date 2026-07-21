import prisma from '../../../../config/database.js';

/**
 * @param {string[]} idsRelatorios
 */
export async function limparRelatoriosEpi(idsRelatorios) {
    if (!idsRelatorios.length) {
        return;
    }

    await prisma.epiDeliveryReport.deleteMany({
        where: { id: { in: idsRelatorios } }
    });
}

/**
 * @param {string[]} idsEntregas
 */
export async function limparEntregasEpi(idsEntregas) {
    if (!idsEntregas.length) {
        return;
    }

    await prisma.epiDelivery.deleteMany({
        where: { id: { in: idsEntregas } }
    });
}

/**
 * @param {string[]} idsFuncionarios
 */
export async function limparFuncionarios(idsFuncionarios) {
    if (!idsFuncionarios.length) {
        return;
    }

    await prisma.epiDelivery.deleteMany({
        where: { employeeId: { in: idsFuncionarios } }
    });
    await prisma.epiDeliveryReport.deleteMany({
        where: { employeeId: { in: idsFuncionarios } }
    });
    await prisma.employee.deleteMany({
        where: { id: { in: idsFuncionarios } }
    });
}

/**
 * @param {string} cargoId
 */
export async function limparCargoComDependencias(cargoId) {
    await prisma.roleEpi.deleteMany({ where: { roleId: cargoId } });
    await prisma.role.delete({ where: { id: cargoId } });
}

/**
 * @param {string} empresaId
 */
export async function limparEmpresa(empresaId) {
    await prisma.company.delete({ where: { id: empresaId } });
}

/**
 * @param {string} setorId
 */
export async function limparSetor(setorId) {
    await prisma.setor.delete({ where: { id: setorId } });
}

/**
 * @param {string} epiId
 */
export async function limparEpi(epiId) {
    await prisma.epi.delete({ where: { id: epiId } });
}

/**
 * @param {string} usuarioId
 */
export async function limparUsuario(usuarioId) {
    await prisma.user.delete({ where: { id: usuarioId } });
}
