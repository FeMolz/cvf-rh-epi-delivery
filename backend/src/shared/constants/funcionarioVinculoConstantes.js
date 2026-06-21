/**
 * Status em que o vínculo com a empresa está encerrado (demissão, rescisão, aposentadoria).
 */
export const STATUS_FUNCIONARIO_VINCULO_ENCERRADO = ['DESLIGADO', 'RESCINDIDO', 'APOSENTADO'];

/**
 * @param {string | null | undefined} status
 */
export function statusFuncionarioEncerraVinculo(status) {
    return STATUS_FUNCIONARIO_VINCULO_ENCERRADO.includes(String(status || ''));
}
