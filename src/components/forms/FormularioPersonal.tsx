'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button, Input, Card } from '@/components/ui';
import type { Personal } from '@/types';

const SchemaPersonal = z.object({
  nombreCompleto: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  rol: z.enum(['Coordinadora', 'Maestro', 'Auxiliar'], {
    errorMap: () => ({ message: 'Selecciona un rol válido' }),
  }),
  telefono: z.string().min(7, 'El teléfono debe tener al menos 7 caracteres'),
  email: z.string().email('Correo electrónico inválido'),
  fechaNacimiento: z.string().optional(),
});

type PersonalFormData = z.infer<typeof SchemaPersonal>;

export interface FormularioPersonalProps {
  valorInicial?: Partial<Personal>;
  onGuardar: (personal: Personal) => void;
  onCancelar: () => void;
}

export default function FormularioPersonal({
  valorInicial,
  onGuardar,
  onCancelar,
}: FormularioPersonalProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<PersonalFormData>({
    resolver: zodResolver(SchemaPersonal),
    defaultValues: {
      nombreCompleto: valorInicial?.nombreCompleto ?? '',
      rol: (valorInicial?.rol as PersonalFormData['rol']) ?? undefined,
      telefono: valorInicial?.telefono ?? '',
      email: valorInicial?.email ?? '',
      fechaNacimiento: valorInicial?.fechaNacimiento ?? '',
    },
  });

  function onSubmit(datos: PersonalFormData) {
    const personal: Personal = {
      id: valorInicial?.id ?? crypto.randomUUID(),
      nombreCompleto: datos.nombreCompleto,
      rol: datos.rol,
      telefono: datos.telefono,
      email: datos.email,
      salonesIds: valorInicial?.salonesIds ?? [],
      maestroAsignadoId: valorInicial?.maestroAsignadoId,
      fechaNacimiento: datos.fechaNacimiento || undefined,
    };
    onGuardar(personal);
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-6">
      <Card>
        <h2 className="text-lg font-semibold text-gray-800 mb-4">
          {valorInicial?.id ? 'Editar Personal' : 'Nuevo Personal'}
        </h2>
        <div className="flex flex-col gap-4">
          <Input
            label="Nombre completo"
            placeholder="Ej: Ana Martínez López"
            error={errors.nombreCompleto?.message}
            {...register('nombreCompleto')}
          />

          <div className="flex flex-col gap-1 w-full">
            <label htmlFor="personal-rol" className="text-sm font-medium text-gray-700">
              Rol
            </label>
            <select
              id="personal-rol"
              className={[
                'w-full rounded-lg border px-3 py-2 text-sm text-gray-900',
                'transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-offset-1',
                errors.rol
                  ? 'border-red-500 focus:ring-red-400'
                  : 'border-gray-300 focus:border-primary-500 focus:ring-primary-400',
              ].join(' ')}
              aria-invalid={!!errors.rol}
              aria-describedby={errors.rol ? 'personal-rol-error' : undefined}
              {...register('rol')}
            >
              <option value="">Seleccionar...</option>
              <option value="Coordinadora">Coordinadora</option>
              <option value="Maestro">Maestro</option>
              <option value="Auxiliar">Auxiliar</option>
            </select>
            {errors.rol && (
              <p id="personal-rol-error" className="text-xs text-red-600" role="alert">
                {errors.rol.message}
              </p>
            )}
          </div>

          <Input
            label="Teléfono"
            type="tel"
            placeholder="Ej: +56912345678"
            error={errors.telefono?.message}
            {...register('telefono')}
          />

          <Input
            label="Correo electrónico"
            type="email"
            placeholder="Ej: ana@correo.com"
            error={errors.email?.message}
            {...register('email')}
          />

          <Input
            label="Fecha de nacimiento"
            type="date"
            max={new Date().toISOString().split('T')[0]}
            {...register('fechaNacimiento')}
          />
        </div>
      </Card>

      <div className="flex gap-3 justify-end">
        <Button type="button" variant="outline" onClick={onCancelar} disabled={isSubmitting}>
          Cancelar
        </Button>
        <Button type="submit" loading={isSubmitting}>
          Guardar
        </Button>
      </div>
    </form>
  );
}
