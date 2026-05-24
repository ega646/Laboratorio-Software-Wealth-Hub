"use client";

import { useEffect, useState } from "react";
import { Header } from "@/components/Header";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  User, Settings, Shield, CreditCard, Briefcase,
  ArrowLeft, LogOut, Link as LinkIcon, Key, Eye, EyeOff
} from "lucide-react";
import { useAuth } from "@/lib/context/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Perfil } from "@/lib/types";


interface PerfilConEmail extends Perfil {
  email: string;
}

type Account = {
  codigo: string
  descripcion: string
  color: string
  status: string
  activa: boolean | null
}

export default function PerfilPage() {
  const [selectedTab, setSelectedTab] = useState("general");
  const [perfil, setPerfil] = useState<PerfilConEmail | null>(null);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const { signOut } = useAuth();
  const router = useRouter();

  useEffect(() => {
    fetch('/api/perfil')
      .then(r => {
        if (!r.ok) throw new Error('Error al cargar perfil')
        return r.json()
      })
      .then(data => {
        setPerfil(data)

        return fetch('/api/cuentas')
      })
      .then(async r => {
        const data = await r.json()

        if (!r.ok) {
          console.error(data)
          throw new Error(data.error || 'Error al cargar cuentas')
        }

        return data
      })
      .then(accounts => {
        setAccounts(accounts)
      })
      .catch(err => {
        console.error(err)
      })
  }, [])


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
    <div className="min-h-screen text-white bg-black">
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Button variant="ghost" asChild className="mb-10 text-zinc-400 hover:text-white h-12 text-lg px-6">
          <Link href="/dashboard" className="flex items-center gap-3">
            <ArrowLeft className="w-6 h-6" />
            Volver al Dashboard
          </Link>
        </Button>

        {/* Header de Perfil */}
        <Card className="bg-zinc-900/70 border border-white/5 mb-12">
          <CardContent className="p-12">
            <div className="flex flex-col md:flex-row gap-8 items-center">
              <div className="w-28 h-28 bg-gradient-to-br from-blue-500 to-purple-500 rounded-3xl flex items-center justify-center text-white text-5xl font-bold shrink-0">
                {iniciales}
              </div>
              <div className="flex-1 text-center md:text-left">
                <h1 className="text-5xl font-bold">{perfil?.nombrecompleto || 'Cargando...'}</h1>
                <p className="text-2xl text-zinc-400 mt-2">{perfil?.email || ''}</p>
                <div className="flex flex-wrap justify-center md:justify-start gap-6 mt-8">
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
              <div className="flex flex-col gap-4">
                <Button asChild variant="outline" className="h-12 px-8 text-lg">
                  <Link href="/profile/edit">Editar Perfil</Link>
                </Button>
                <Button variant="outline" onClick={handleLogout} className="h-12 px-8 text-lg text-red-400 hover:text-red-300">
                  <LogOut className="w-5 h-5 mr-2" />
                  Cerrar Sesión
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

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
            {selectedTab === "accounts" && (
              <LinkedAccounts
                userId={perfil?.id}
                accounts={accounts}
              />
            )}
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

function LinkedAccounts({
  userId,
  accounts
}: {
  userId?: string
  accounts: Account[]
}) {
  const [connectingTo, setConnectingTo] = useState<string | null>(null);
  const [showSecret, setShowSecret] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  const [formData, setFormData] = useState({
    apiKey: "",
    apiSecret: "",
  });



const handleSyncData = async () => {
  setIsSyncing(true);

  try {
    const response = await fetch('/api/services', {
      method: 'POST'
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error);
    }

    console.log('Sincronización completada');

  } catch (error: any) {
    console.error(error.message);

  } finally {
    setIsSyncing(false);
  }
};

  // --- LÓGICA DE GUARDADO ACTUALIZADA CON SERVICIOS ---
  const handleSaveConnection = async () => {
    try {
      const response = await fetch('/api/vinculos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          tipoCuenta: connectingTo,
          apiKey: formData.apiKey,
          apiSecret: formData.apiSecret
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error)
      }

      alert('Cuenta conectada correctamente')

    } catch (err: any) {
      alert(err.message)
    }
  }

  if (connectingTo) {
    const selected = accounts.find(a => a.codigo === connectingTo);
    return (
      <Card className="bg-zinc-900/70 border border-white/5 animate-in fade-in slide-in-from-right-4">
        <CardHeader className="border-b border-white/5 pb-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => { setConnectingTo(null); setFormData({apiKey:"", apiSecret:""}); }}>
              <ArrowLeft className="w-6 h-6" />
            </Button>
            <div>
              <CardTitle className="text-3xl">Conectar {selected?.descripcion}</CardTitle>
              <CardDescription className="text-lg">Introduce tus credenciales de API</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-8 space-y-6">
          <div className="bg-yellow-500/10 border border-yellow-500/20 p-4 rounded-xl text-yellow-200 text-sm">
            Nota: Asegúrate de que la API Key tenga permisos de **"Lectura"** (Read-Only). Nunca compartas una clave con permisos de retiro.
          </div>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="apiKey" className="text-zinc-400">API Key</Label>
              <div className="relative">
                <Key className="absolute left-3 top-3 w-5 h-5 text-zinc-500" />
                <Input 
                  id="apiKey" 
                  placeholder="Tu API Key" 
                  className="bg-zinc-950 border-white/10 pl-11 h-12 text-lg"
                  value={formData.apiKey}
                  onChange={(e) => setFormData({ ...formData, apiKey: e.target.value })}
                  disabled={isSyncing}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="apiSecret" className="text-zinc-400">API Secret / Private Key</Label>
              <div className="relative">
                <Key className="absolute left-3 top-3 w-5 h-5 text-zinc-500" />
                <Input 
                  id="apiSecret" 
                  type={showSecret ? "text" : "password"} 
                  placeholder="Tu API Secret" 
                  className="bg-zinc-950 border-white/10 pl-11 pr-11 h-12 text-lg" 
                  value={formData.apiSecret}
                  onChange={(e) => setFormData({ ...formData, apiSecret: e.target.value })}
                  disabled={isSyncing}
                />
                <button 
                  type="button"
                  onClick={() => setShowSecret(!showSecret)}
                  className="absolute right-3 top-3 text-zinc-500 hover:text-white"
                >
                  {showSecret ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <Button 
              className="flex-1 h-12 text-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold"
              onClick={handleSaveConnection}
              disabled={isSyncing}
            >
              {isSyncing ? "Validando..." : "Validar y Guardar Conexión"}
            </Button>
            <Button variant="ghost" className="h-12 text-lg" onClick={() => setConnectingTo(null)} disabled={isSyncing}>
              Cancelar
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-zinc-900/70 border border-white/5">
      <CardHeader className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <CardTitle className="text-3xl">Cuentas Vinculadas</CardTitle>
          <CardDescription className="text-zinc-400 text-lg">Centraliza tus activos conectando tus plataformas</CardDescription>
        </div>
        <Button 
          onClick={handleSyncData} 
          disabled={isSyncing}
          className="bg-emerald-600 hover:bg-emerald-500 text-white h-11 px-6 text-base font-medium transition-all"
        >
          {isSyncing ? (
            <>
              <span className="animate-spin mr-2">⏳</span>
              Sincronizando...
            </>
          ) : (
            <>Actualizar Datos</>
          )}
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {accounts.map((account) => (
          <div
            key={account.codigo}
            className="flex items-center justify-between p-6 bg-zinc-950/70 rounded-2xl border border-white/5 hover:border-white/10 transition-colors"
          >
            <div className="flex items-center gap-5">
              <div
                className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white font-medium text-xl shadow-lg ${account.color}`}
              >
                {account.descripcion.substring(0, 2)}
              </div>

              <div>
                <p className="font-semibold text-xl">
                  {account.descripcion}
                </p>

                <span
                  className={`text-sm ${
                    account.status === "conectada"
                      ? "text-emerald-400"
                      : "text-zinc-500"
                  }`}
                >
                  {account.status}
                </span>
              </div>
            </div>

            <Button
              variant="outline"
              className="px-6 h-11 border-zinc-700 hover:bg-zinc-800"
              onClick={() => setConnectingTo(account.codigo)}
            >
              <LinkIcon className="w-4 h-4 mr-2" />
              {account.status === "conectada"
                ? "Reconfigurar"
                : "Conectar"}
            </Button>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function RiskProfile({ perfilRiesgo }: { perfilRiesgo?: string }) {
  const perfiles: Record<string, { label: string; desc: string; color: string }> = {
    BAJO:  { label: 'Conservador', desc: '"Prefiero ganar poco pero dormir tranquilo"', color: 'from-green-500 to-emerald-600' },
    MEDIO: { label: 'Moderado',     desc: '"Quiero crecer, pero sin sobresaltos extremos"', color: 'from-blue-500 to-indigo-600' },
    ALTO:  { label: 'Agresivo',     desc: '"Asumo volatilidad porque creo en el crecimiento a largo plazo"', color: 'from-orange-500 to-red-600' },
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