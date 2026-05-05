// app/(auth)/login/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/lib/context/AuthContext";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { signIn } = useAuth();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    const { error } = await signIn(email, password);

    if (error) {
      setError("Correo o contraseña incorrectos");
      setLoading(false);
      return;
    }

    router.push("/dashboard");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-black text-white">
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid lg:grid-cols-2 gap-16 items-start">

          {/* Left Side - Branding */}
          <div className="hidden lg:block">
            <div className="bg-zinc-900/70 border border-white/10 backdrop-blur-2xl rounded-3xl p-14 h-full">
              <h2 className="text-5xl font-bold leading-tight mb-6">
                Bienvenido de nuevo
              </h2>
              <p className="text-xl text-zinc-400">
                Accede a tu panel financiero inteligente y sigue optimizando tu patrimonio.
              </p>

              <div className="mt-12 space-y-6">
                {[
                  "Conexión automática con tus exchanges",
                  "Análisis de riesgo en tiempo real",
                  "Simulaciones y backtesting avanzados",
                  "Seguridad de nivel empresarial"
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-4">
                    <div className="w-8 h-8 bg-emerald-500/20 rounded-2xl flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-emerald-400 text-xl">✓</span>
                    </div>
                    <span className="text-xl text-zinc-300">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Side - Form */}
          <div className="max-w-md mx-auto w-full">
            <Card className="bg-zinc-900 border-white/10">
              <CardHeader className="text-center pb-8">
                <CardTitle className="text-4xl font-semibold">Iniciar Sesión</CardTitle>
                <CardDescription className="text-xl text-zinc-400 mt-3">
                  Accede a tu panel de control financiero
                </CardDescription>
              </CardHeader>

              <CardContent className="px-8 pb-10">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-zinc-300">Correo Electrónico</Label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="tu@email.com"
                        className="pl-12 bg-zinc-950 border-white/10 focus:border-blue-500 h-12"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-zinc-300">Contraseña</Label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                      <Input
                        id="password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        className="pl-12 pr-12 bg-zinc-950 border-white/10 focus:border-blue-500 h-12"
                        required
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 h-9 w-9 text-zinc-400 hover:text-white"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </Button>
                    </div>
                  </div>

                  {error && (
                    <p className="text-red-500 text-base text-center bg-red-950/60 border border-red-900/60 p-4 rounded-2xl">
                      {error}
                    </p>
                  )}

                  <Button
                    type="submit"
                    disabled={loading}
                    variant="cta"
                    className="w-full h-14 text-lg mt-4"
                  >
                    {loading ? "Entrando..." : "Iniciar Sesión"}
                  </Button>
                </form>

                <div className="mt-8 text-center">
                  <p className="text-zinc-400">
                    ¿No tienes una cuenta?{" "}
                    <Link href="/register" className="text-blue-400 hover:text-blue-300 font-medium">
                      Regístrate
                    </Link>
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}