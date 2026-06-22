import { describe, expect, it } from 'vitest';

import { formatarDataRelatorio, formatarPeriodoRelatorio } from './formatarPeriodoRelatorio.js';

describe('formatarPeriodoRelatorio', () => {
    it('deve formatar data em pt-BR', () => {
        expect(formatarDataRelatorio('2026-01-15T12:00:00.000Z')).toMatch(/15\/01\/2026/);
    });

    it('deve formatar intervalo do relatorio', () => {
        const texto = formatarPeriodoRelatorio('2026-01-01T00:00:00.000Z', '2026-01-31T00:00:00.000Z');

        expect(texto).toContain('01/01/2026');
        expect(texto).toContain('31/01/2026');
    });
});
