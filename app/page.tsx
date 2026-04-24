// app/page.tsx
"use client";

import Link from "next/link";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Zap, BarChart3, Shield } from "lucide-react";
import Image from "next/image";
import { useAuth } from "@/lib/context/AuthContext";

export default function Inicio() {
  const { isLoggedIn } = useAuth();

  const ctaHref = isLoggedIn ? "/dashboard" : "/register";
  const ctaText = isLoggedIn ? "Ir al Dashboard" : "Comenzar Gratis";

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-black text-white overflow-hidden">
      <Header />

      {/* Hero Section */}
      <section className="relative pt-24 pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-10">
              <h1 className="text-6xl md:text-7xl font-bold leading-[1.05] tracking-tighter">
                <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-violet-400 bg-clip-text text-transparent">
                  Tu patrimonio unificado y optimizado
                </span>
              </h1>

              <p className="text-2xl text-zinc-400 max-w-lg">
                Wealth Hub consolida criptomonedas, acciones, ETFs y efectivo en una sola interfaz inteligente.
              </p>

              <div className="flex flex-wrap gap-5">
                <Button 
                  size="lg" 
                  className="bg-white text-black hover:bg-zinc-100 font-semibold text-xl px-12 py-8 rounded-3xl shadow-2xl shadow-white/10"
                  asChild
                >
                  <Link href={ctaHref}>
                    {ctaText}
                  </Link>
                </Button>

                {!isLoggedIn && (
                  <Button 
                    size="lg" 
                    variant="outline" 
                    className="border-white/30 hover:bg-white/10 text-white font-medium text-xl px-10 py-8 rounded-3xl"
                    asChild
                  >
                    <Link href="/login">
                      Iniciar Sesión
                    </Link>
                  </Button>
                )}
              </div>
            </div>

            {/* Imagen Hero */}
            <div className="relative">
              <div className="absolute -inset-6 bg-gradient-to-br from-blue-500/20 via-purple-500/20 to-transparent rounded-[3.5rem] blur-3xl" />
              <Image 
                src="https://images.unsplash.com/photo-1551288049-bebda4e38f71" 
                alt="Wealth Hub Dashboard"
                width={820}
                height={620}
                className="rounded-3xl shadow-2xl border border-white/10 relative z-10"
                priority
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-28 bg-zinc-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-5xl font-bold mb-5">Más que un simple rastreador</h2>
            <p className="text-2xl text-zinc-400 max-w-2xl mx-auto">
              Tres capas de valor que transforman cómo gestionas tu dinero
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="bg-zinc-900 border border-white/10 hover:border-blue-500/40 transition-all duration-300 group h-full">
              <CardContent className="p-12">
                <div className="w-20 h-20 bg-blue-500/10 rounded-3xl flex items-center justify-center mb-10 group-hover:scale-110 transition-transform">
                  <Zap className="w-11 h-11 text-blue-400" />
                </div>
                <h3 className="text-3xl font-semibold mb-5">Agregación Automática</h3>
                <p className="text-xl text-zinc-400 leading-relaxed">
                  Conecta tus exchanges y brokers con APIs de solo lectura. 
                  Tu cartera siempre actualizada en tiempo real.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-zinc-900 border border-white/10 hover:border-purple-500/40 transition-all duration-300 group h-full">
              <CardContent className="p-12">
                <div className="w-20 h-20 bg-purple-500/10 rounded-3xl flex items-center justify-center mb-10 group-hover:scale-110 transition-transform">
                  <BarChart3 className="w-11 h-11 text-purple-400" />
                </div>
                <h3 className="text-3xl font-semibold mb-5">Simulación y Backtesting</h3>
                <p className="text-xl text-zinc-400 leading-relaxed">
                  Descubre qué habría pasado si hubieras invertido antes. 
                  Proyecta tu futuro financiero con precisión.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-zinc-900 border border-white/10 hover:border-emerald-500/40 transition-all duration-300 group h-full">
              <CardContent className="p-12">
                <div className="w-20 h-20 bg-emerald-500/10 rounded-3xl flex items-center justify-center mb-10 group-hover:scale-110 transition-transform">
                  <Shield className="w-11 h-11 text-emerald-400" />
                </div>
                <h3 className="text-3xl font-semibold mb-5">Optimización Inteligente</h3>
                <p className="text-xl text-zinc-400 leading-relaxed">
                  Análisis de riesgo avanzado que te ayuda a maximizar rentabilidad 
                  según tu perfil de inversor.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-28 bg-gradient-to-br from-blue-600 via-purple-600 to-violet-600">
        <div className="max-w-3xl mx-auto text-center px-6">
          <h2 className="text-5xl font-bold mb-8">
            ¿Listo para tomar el control de tu patrimonio?
          </h2>
          <p className="text-2xl text-blue-100 mb-12">
            Únete a miles de inversores que ya gestionan su dinero de forma más inteligente.
          </p>
          
          <Button 
            size="lg" 
            className="bg-white text-black hover:bg-zinc-100 font-semibold text-2xl px-16 py-9 rounded-3xl shadow-2xl"
            asChild
          >
            <Link href={ctaHref}>
              {ctaText}
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
}