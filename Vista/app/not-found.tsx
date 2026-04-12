// app/not-found.tsx
import Link from "next/link";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Home, ArrowLeft, Search } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header isLoggedIn={false} />

      <div className="max-w-2xl mx-auto px-4 py-20 flex flex-col items-center justify-center min-h-[calc(100vh-64px)] text-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-12">
            {/* Icono grande */}
            <div className="mx-auto w-24 h-24 bg-blue-100 rounded-2xl flex items-center justify-center mb-8">
              <Search className="w-12 h-12 text-blue-600" />
            </div>

            <h1 className="text-7xl font-bold text-gray-900 mb-2">404</h1>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              Página no encontrada
            </h2>
            
            <p className="text-gray-600 mb-10">
              Lo sentimos, la página que estás buscando no existe o ha sido movida.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg">
                <Link href="/">
                  <Home className="w-5 h-5 mr-2" />
                  Volver al Inicio
                </Link>
              </Button>

              <Button asChild variant="outline" size="lg">
                <Link href="/dashboard">
                  <ArrowLeft className="w-5 h-5 mr-2" />
                  Ir al Dashboard
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Mensaje adicional */}
        <p className="text-sm text-gray-500 mt-10">
          Si crees que esto es un error, por favor contacta con soporte.
        </p>
      </div>
    </div>
  );
}