"use client";

import { useEffect, useState } from "react";
import { Header } from "@/components/Header";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  User, Settings, Shield, CreditCard, MapPin, Briefcase,
  ArrowLeft, LogOut
} from "lucide-react";
import { useAuth } from "@/lib/context/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Perfil } from "@/lib/types";

interface PerfilConEmail extends Perfil {
  email: string;
}

export default function PerfilPage() {
  const [selectedTab, setSelectedTab] = useState("general");
  const [perfil, setPerfil] = useState<PerfilConEmail | null>(null);
  const { signOut } = useAuth();
  const router = useRouter();

  useEffect(() => {
    fetch('/api/perfil')
      .then(r => r.ok ? r.json() : null)
      .then(data => setPerfil(data))
      .catch(() => {});
  }, []);

  const tabs = [
    { id: "general", label: "Información General", icon: User },
    { id: "accounts", label: "Cuentas Vinculadas", icon: CreditCard },
    { id: "risk", label: "Perfil de Riesgo", icon: Shield },
    { id: "preferences", label: "Preferencias", icon: Settings },
  ];

  const handleLogout = async () => {
    await signOut();
    router.push("/");
  };

  const iniciales = perfil?.nombrecompleto
    ? perfil.nombrecompleto.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2)
    : '??';

  const perfilRiesgoLabel: Record<string, string> = {
    BAJO:  'Inversor Conservador',
    MEDIO: 'Inversor Moderado',
    ALTO:  'Inversor Agresivo',
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-black text-white">
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Button
          variant="ghost"
          asChild
          className="mb-10 text-zinc-400 hover:text-white hover:bg-white/5 h-12 text-lg px-6"
        >
          <Link href="/dashboard" className="flex items-center gap-3">
            <ArrowLeft className="w-6 h-6" />
            Volver al Dashboard
          </Link>
        </Button>

        {/* Perfil Header */}
        <Card className="bg-zinc-900/70 border border-white/5 mb-12">
          <CardContent className="p-12">
            <div className="flex flex-col md:flex-row gap-8 items-center">
              <div className="w-28 h-28 bg-gradient-to-br from-blue-500 to-purple-500 rounded-3xl flex items-center justify-center text-white text-5xl font-bold shrink-0">
                {iniciales}
              </div>
              <div className="flex-1">
                <h1 className="text-5xl font-bold">{perfil?.nombrecompleto || 'Cargando...'}</h1>
                <p className="text-2xl text-zinc-400 mt-2">{perfil?.email || ''}</p>

                <div className="flex flex-wrap gap-6 mt-8">
                  <div className="flex items-center gap-3 text-zinc-400">
                    <Briefcase className="w-5 h-5" />
                    {perfilRiesgoLabel[perfil?.perfilriesgocodigo ?? ''] ?? 'Sin perfil de riesgo'}
                  </div>
                  <div className="flex items-center gap-3">
                    <Shield className="w-5 h-5 text-emerald-400" />
                    <span className="text-emerald-400 font-medium">Cuenta Verificada</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-4">
                <Button
                  asChild
                  variant="outline"
                  className="border-white/10 hover:bg-white/5 text-white h-12 px-8 text-lg"
                >
                  <Link href="/profile/edit">Editar Perfil</Link>
                </Button>
                <Button
                  variant="outline"
                  onClick={handleLogout}
                  className="border-white/10 hover:bg-white/5 text-white h-12 px-8 text-lg"
                >
                  <LogOut className="w-5 h-5 mr-2" />
                  Cerrar Sesión
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Content */}
        <div className="grid lg:grid-cols-4 gap-8">
          <div className="lg:col-span-1">
            <Card className="bg-zinc-900/70 border border-white/5 sticky top-24">
              <CardContent className="p-4">
                <nav className="space-y-2">
                  {tabs.map((tab) => {
                    const Icon = tab.icon;
                    return (
                      <Button
                        key={tab.id}
                        variant={selectedTab === tab.id ? "secondary" : "ghost"}
                        onClick={() => setSelectedTab(tab.id)}
                        className="w-full justify-start text-left h-14 text-lg"
                      >
                        <Icon className="w-6 h-6 mr-4" />
                        <span>{tab.label}</span>
                      </Button>
                    );
                  })}
                </nav>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-3">
            {selectedTab === "general" && <GeneralInfo perfil={perfil} />}
            {selectedTab === "accounts" && <LinkedAccounts />}
            {selectedTab === "risk" && <RiskProfile perfilRiesgo={perfil?.perfilriesgocodigo} />}
            {selectedTab === "preferences" && <Preferences divisaBase={perfil?.divisabasecodigo} />}
          </div>
        </div>
      </div>
    </div>
  );
}

function GeneralInfo({ perfil }: { perfil: PerfilConEmail | null }) {
  return (
    <Card className="bg-zinc-900/70 border border-white/5">
      <CardHeader>
        <CardTitle className="text-3xl">Información General</CardTitle>
        <CardDescription className="text-zinc-400 text-lg">Tus datos personales actuales</CardDescription>
      </CardHeader>
      <CardContent className="space-y-8 pt-4">
        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <p className="text-zinc-500 text-sm mb-1">Nombre completo</p>
            <p className="text-xl font-medium text-white">{perfil?.nombrecompleto || '—'}</p>
          </div>
          <div>
            <p className="text-zinc-500 text-sm mb-1">Correo electrónico</p>
            <p className="text-xl font-medium text-white">{perfil?.email || '—'}</p>
          </div>
        </div>
        <div>
          <p className="text-zinc-500 text-sm mb-2">Tipo de inversor</p>
          <div className="inline-flex items-center px-5 py-2.5 bg-zinc-800/80 border border-zinc-700 rounded-2xl">
            <span className="text-xl font-medium text-white capitalize">
              {perfil?.perfilriesgocodigo || '—'}
            </span>
          </div>
        </div>
        <div>
          <p className="text-zinc-500 text-sm mb-2">Divisa base</p>
          <div className="inline-flex items-center px-5 py-2.5 bg-zinc-800/80 border border-zinc-700 rounded-2xl">
            <span className="text-xl font-medium text-white">{perfil?.divisabasecodigo || '—'}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function LinkedAccounts() {
  const accounts = [
    { name: "Binance", type: "Exchange", status: "Desconectada", color: "bg-yellow-500" },
    { name: "Interactive Brokers", type: "Broker", status: "Desconectada", color: "bg-blue-500" },
    { name: "Coinbase", type: "Exchange", status: "Desconectada", color: "bg-indigo-500" },
  ];

  return (
    <Card className="bg-zinc-900/70 border border-white/5">
      <CardHeader>
        <CardTitle className="text-3xl">Cuentas Vinculadas</CardTitle>
        <CardDescription className="text-zinc-400 text-lg">Exchange y brokers conectados</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {accounts.map((account, index) => (
          <div key={index} className="flex items-center justify-between p-6 bg-zinc-950/70 rounded-2xl border border-white/5">
            <div className="flex items-center gap-5">
              <div className={`w-12 h-12 ${account.color} rounded-2xl flex items-center justify-center text-white font-medium text-xl`}>
                {account.name.substring(0, 2)}
              </div>
              <div>
                <p className="font-semibold text-xl">{account.name}</p>
                <p className="text-zinc-400">{account.type}</p>
              </div>
            </div>
            <Badge variant="secondary" className="text-base px-5 py-1.5">
              {account.status}
            </Badge>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function RiskProfile({ perfilRiesgo }: { perfilRiesgo?: string }) {
  const perfiles: Record<string, { label: string; desc: string; color: string }> = {
    BAJO:  { label: 'Conservador', desc: '"Prefiero ganar poco pero dormir tranquilo"', color: 'from-green-500 to-emerald-600' },
    MEDIO: { label: 'Moderado',    desc: '"Quiero crecer, pero sin sobresaltos extremos"', color: 'from-blue-500 to-indigo-600' },
    ALTO:  { label: 'Agresivo',    desc: '"Asumo volatilidad porque creo en el crecimiento a largo plazo"', color: 'from-orange-500 to-red-600' },
  };

  const actual = perfiles[perfilRiesgo ?? 'MEDIO'] ?? perfiles.MEDIO;

  return (
    <Card className="bg-zinc-900/70 border border-white/5">
      <CardHeader>
        <CardTitle className="text-3xl">Perfil de Riesgo Actual</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-6">
          <div className={`w-16 h-16 bg-gradient-to-br ${actual.color} rounded-3xl flex items-center justify-center text-white text-4xl font-bold`}>
            {actual.label[0]}
          </div>
          <div>
            <p className="text-3xl font-semibold">{actual.label}</p>
            <p className="text-xl text-zinc-400 mt-3 italic">{actual.desc}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function Preferences({ divisaBase }: { divisaBase?: string }) {
  return (
    <Card className="bg-zinc-900/70 border border-white/5">
      <CardHeader>
        <CardTitle className="text-3xl">Preferencias</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6 text-lg">
        <div className="flex justify-between items-center py-5 border-b border-white/5">
          <span className="text-zinc-400">Divisa base</span>
          <span className="font-medium">{divisaBase || 'EUR'}</span>
        </div>
        <div className="flex justify-between items-center py-5">
          <span className="text-zinc-400">Idioma</span>
          <span className="font-medium">Español</span>
        </div>
      </CardContent>
    </Card>
  );
}
