import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export default function Input({
  label,
  error,
  helperText,
  id,
  className = '',
  required,   // interceptado — no se pasa al input nativo para evitar validación del navegador
  ...props
}: InputProps) {
  // Genera un id limpio: sin asteriscos ni caracteres especiales
  const inputId = id ?? (label
    ? label.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
    : undefined);

  return (
    <div className="flex flex-col gap-1 w-full">
      {label && (
        <label htmlFor={inputId} className="text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={[
          'w-full rounded-lg border px-3 py-2 text-sm text-gray-900',
          'placeholder:text-gray-400 transition-colors duration-150',
          'focus:outline-none focus:ring-2 focus:ring-offset-1',
          error
            ? 'border-red-500 focus:ring-red-400'
            : 'border-gray-300 focus:border-primary-500 focus:ring-primary-400',
          'disabled:bg-gray-100 disabled:cursor-not-allowed',
          className,
        ].join(' ')}
        aria-invalid={!!error}
        aria-describedby={
          error ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined
        }
        {...props}
      />
      {error && (
        <p id={`${inputId}-error`} className="text-xs text-red-600" role="alert">
          {error}
        </p>
      )}
      {!error && helperText && (
        <p id={`${inputId}-helper`} className="text-xs text-gray-500">
          {helperText}
        </p>
      )}
    </div>
  );
}
