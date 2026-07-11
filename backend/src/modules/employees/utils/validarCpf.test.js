import { validarCpf, extrairDigitosCpf } from './validarCpf.js';

describe('validarCpf', () => {
    it('deve aceitar CPF válido no formato xxx.xxx.xxx-xx', () => {
        expect(validarCpf('529.982.247-25')).toBe('529.982.247-25');
    });

    it('deve rejeitar CPF sem máscara', () => {
        expect(() => validarCpf('52998224725')).toThrow(
            'CPF inválido. Use o formato xxx.xxx.xxx-xx (11 dígitos com pontos e hífen).'
        );
    });

    it('deve rejeitar CPF com dígitos verificadores inválidos', () => {
        expect(() => validarCpf('123.783.245-75')).toThrow(
            'CPF inválido. Os dígitos verificadores não conferem.'
        );
    });

    it('deve rejeitar CPF com todos os dígitos iguais', () => {
        expect(() => validarCpf('111.111.111-11')).toThrow(
            'CPF inválido. Os dígitos verificadores não conferem.'
        );
    });

    it('deve extrair apenas os dígitos do CPF', () => {
        expect(extrairDigitosCpf('529.982.247-25')).toBe('52998224725');
    });

    it('deve validar CPF com resto de verificação igual a dez', () => {
        expect(validarCpf('111.444.777-35')).toBe('111.444.777-35');
        expect(validarCpf('000.000.006-04')).toBe('000.000.006-04');
        expect(validarCpf('077.777.777-00')).toBe('077.777.777-00');
    });
});
