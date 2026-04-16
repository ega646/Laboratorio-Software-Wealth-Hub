// app/dashboard/loading.tsx
export default function Loading() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto"></div>
        <p className="mt-4 text-gray-600">Cargando dashboard...</p>
      </div>
    </div>
  );
}