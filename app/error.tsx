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
    console.error('Error global:', error);
  }, [error]);

  return (
    <div className="min-h-screen text-white flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        <div className="mx-auto w-16 h-16 bg-red-900/30 border border-red-800/40 rounded-2xl flex items-center justify-center mb-6">
          <AlertTriangle className="w-8 h-8 text-red-400" />
        </div>

        <h2 className="text-2xl font-bold mb-2">
          Algo salió mal
        </h2>

        <p className="text-zinc-400 mb-8">
          Ha ocurrido un error inesperado. Por favor, inténtalo de nuevo.
        </p>

        <div className="flex gap-4 justify-center">
          <Button onClick={reset} className="h-11 px-6">
            Intentar de nuevo
          </Button>
          <Button variant="outline" onClick={() => window.location.href = '/'} className="h-11 px-6">
            Volver al inicio
          </Button>
        </div>

        {process.env.NODE_ENV === 'development' && (
          <details className="mt-8 text-left text-xs text-zinc-500 bg-zinc-900 border border-white/10 p-4 rounded-xl">
            <summary className="cursor-pointer mb-2 font-medium">Detalles del error (solo desarrollo)</summary>
            <pre className="whitespace-pre-wrap">{error.message}</pre>
            {error.digest && <p className="mt-2">Digest: {error.digest}</p>}
          </details>
        )}
      </div>
    </div>
  );
}
