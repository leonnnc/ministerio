import { describe, it, expect } from 'vitest';
import { asignarSalon, CONFIGURACION_SALONES } from './asignacionSalon';

describe('asignarSalon', () => {
  it('asigna Cuna para un bebé de 1 año', () => {
    const hoy = new Date();
    const hace1Anio = new Date(hoy.getFullYear() - 1, hoy.getMonth(), hoy.getDate());
    expect(asignarSalon(hace1Anio.toISOString().split('T')[0])).toBe('Cuna');
  });

  it('asigna PrimerNivel para un niño de 4 años', () => {
    const hoy = new Date();
    const hace4Anios = new Date(hoy.getFullYear() - 4, hoy.getMonth(), hoy.getDate());
    expect(asignarSalon(hace4Anios.toISOString().split('T')[0])).toBe('PrimerNivel');
  });

  it('asigna SegundoNivel para un niño de 8 años', () => {
    const hoy = new Date();
    const hace8Anios = new Date(hoy.getFullYear() - 8, hoy.getMonth(), hoy.getDate());
    expect(asignarSalon(hace8Anios.toISOString().split('T')[0])).toBe('SegundoNivel');
  });

  it('asigna TercerNivel para un niño de 12 años', () => {
    const hoy = new Date();
    const hace12Anios = new Date(hoy.getFullYear() - 12, hoy.getMonth(), hoy.getDate());
    expect(asignarSalon(hace12Anios.toISOString().split('T')[0])).toBe('TercerNivel');
  });

  it('asigna TercerNivel para un niño de 10 años (límite inferior)', () => {
    const hoy = new Date();
    const hace10Anios = new Date(hoy.getFullYear() - 10, hoy.getMonth(), hoy.getDate());
    expect(asignarSalon(hace10Anios.toISOString().split('T')[0])).toBe('TercerNivel');
  });

  it('retorna null para un joven de 14 años (fuera de rango)', () => {
    const hoy = new Date();
    const hace14Anios = new Date(hoy.getFullYear() - 14, hoy.getMonth(), hoy.getDate());
    expect(asignarSalon(hace14Anios.toISOString().split('T')[0])).toBeNull();
  });

  it('lanza error para fecha futura', () => {
    const maniana = new Date();
    maniana.setDate(maniana.getDate() + 1);
    expect(() => asignarSalon(maniana.toISOString().split('T')[0])).toThrow(
      'La fecha de nacimiento no puede ser una fecha futura'
    );
  });

  it('CONFIGURACION_SALONES tiene los 4 grupos correctos', () => {
    expect(Object.keys(CONFIGURACION_SALONES)).toEqual([
      'Cuna', 'PrimerNivel', 'SegundoNivel', 'TercerNivel',
    ]);
    expect(CONFIGURACION_SALONES.Cuna.edadMinima).toBe(0);
    expect(CONFIGURACION_SALONES.Cuna.edadMaxima).toBe(2);
    expect(CONFIGURACION_SALONES.TercerNivel.edadMaxima).toBe(13);
  });
});
