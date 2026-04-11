// app/error.tsx
'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Opcional: puedes enviar el error a un servicio de logging
    console.error('Error global:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-6">
          <AlertTriangle className="w-8 h-8 text-red-600" />
        </div>

        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Algo salió mal
        </h2>
        
        <p className="text-gray-600 mb-8">
          Ha ocurrido un error inesperado. Por favor, inténtalo de nuevo.
        </p>

        <div className="flex gap-4 justify-center">
          <Button onClick={reset} variant="default">
            Intentar de nuevo
          </Button>
          <Button variant="outline" onClick={() => window.location.href = '/'}>
            Volver al inicio
          </Button>
        </div>

        {process.env.NODE_ENV === 'development' && (
          <details className="mt-8 text-left text-xs text-gray-500 bg-gray-100 p-4 rounded">
            <summary className="cursor-pointer mb-2 font-medium">Detalles del error (solo desarrollo)</summary>
            <pre className="whitespace-pre-wrap">{error.message}</pre>
            {error.digest && <p className="mt-2">Digest: {error.digest}</p>}
          </details>
        )}
      </div>
    </div>
  );
}