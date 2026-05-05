// app/not-found.tsx
import Link from "next/link";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Home, ArrowLeft, Search } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-black text-white">
      <Header />

      <div className="max-w-2xl mx-auto px-4 py-20 flex flex-col items-center justify-center min-h-[calc(100vh-80px)] text-center">
        <div className="w-24 h-24 bg-zinc-800 rounded-3xl flex items-center justify-center mb-8">
          <Search className="w-12 h-12 text-zinc-400" />
        </div>

        <h1 className="text-8xl font-bold tracking-tighter mb-2">404</h1>
        <h2 className="text-2xl font-semibold text-zinc-300 mb-4">
          Página no encontrada
        </h2>

        <p className="text-zinc-500 mb-12 text-lg">
          Lo sentimos, la página que estás buscando no existe o ha sido movida.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild size="lg" className="h-12 px-8 text-base">
            <Link href="/">
              <Home className="w-5 h-5 mr-2" />
              Volver al Inicio
            </Link>
          </Button>

          <Button asChild variant="outline" size="lg" className="h-12 px-8 text-base">
            <Link href="/dashboard">
              <ArrowLeft className="w-5 h-5 mr-2" />
              Ir al Dashboard
            </Link>
          </Button>
        </div>

        <p className="text-sm text-zinc-600 mt-12">
          Si crees que esto es un error, por favor contacta con soporte.
        </p>
      </div>
    </div>
  );
}
