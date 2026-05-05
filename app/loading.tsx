// app/dashboard/loading.tsx
export default function Loading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-black flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin w-8 h-8 border-4 border-violet-500 border-t-transparent rounded-full mx-auto"></div>
        <p className="mt-4 text-zinc-400">Cargando...</p>
      </div>
    </div>
  );
}
