"use client";

import { useEffect, useState } from "react";
import { Header } from "@/components/Header";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  User, Settings, Shield, CreditCard, Key, Trash2,
  ChevronRight, ArrowLeft, LogOut
} from "lucide-react";
import { useAuth } from "@/lib/context/AuthContext";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Perfil } from "@/lib/types";

interface PerfilConEmail extends Perfil {
  email: string;
}

export default function PerfilEdit() {
  const [selectedTab, setSelectedTab] = useState("general");
  const [perfil, setPerfil] = useState<PerfilConEmail | null>(null);
  const [saving, setSaving] = useState(false);
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
    { id: "security", label: "Seguridad", icon: Shield },
    { id: "preferences", label: "Preferencias", icon: Settings },
  ];

  const handleSaveGeneral = async (nombre: string) => {
    setSaving(true);
    await fetch('/api/perfil', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nombrecompleto: nombre }),
    });
    setSaving(false);
    router.push('/profile');
  };

  const handleSaveRiesgo = async (perfil_riesgo: string) => {
    setSaving(true);
    await fetch('/api/perfil', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ perfilriesgocodigo: perfil_riesgo }),
    });
    setSaving(false);
    router.push('/profile');
  };

  const handleSavePreferencias = async (divisa_base: string) => {
    setSaving(true);
    await fetch('/api/perfil', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ divisabasecodigo: divisa_base }),
    });
    setSaving(false);
    router.push('/profile');
  };

  const handleLogout = async () => {
    await signOut();
    router.push('/');
  };

  const iniciales = perfil?.nombrecompleto
    ? perfil.nombrecompleto.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2)
    : '??';

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-black text-white">
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Button
          variant="ghost"
          asChild
          className="mb-10 text-zinc-500 hover:text-zinc-300 hover:bg-white/5 h-12 text-lg px-6"
        >
          <Link href="/profile" className="flex items-center gap-3">
            <ArrowLeft className="w-6 h-6" />
            Volver al Perfil
          </Link>
        </Button>

        <Card className="bg-zinc-900/70 border border-white/5 mb-12">
          <CardContent className="p-12">
            <div className="flex items-start gap-6">
              <div className="w-28 h-28 bg-gradient-to-br from-blue-500 to-purple-500 rounded-3xl flex items-center justify-center text-white text-5xl font-bold">
                {iniciales}
              </div>
              <div className="flex-1">
                <h1 className="text-5xl font-bold">Editar Perfil</h1>
                <p className="text-2xl text-zinc-400 mt-2">Modifica tus datos personales y preferencias</p>
              </div>
              <Button variant="destructive" onClick={handleLogout} className="h-12 px-8 text-lg">
                <LogOut className="w-5 h-5 mr-2" />
                Cerrar Sesión
              </Button>
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
                        className="w-full justify-start text-left h-16 text-xl font-medium"
                      >
                        <Icon className="w-6 h-6 mr-4" />
                        <span className="flex-1 text-left">{tab.label}</span>
                        <ChevronRight className="w-5 h-5 opacity-50" />
                      </Button>
                    );
                  })}
                </nav>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-3 space-y-8">
            {selectedTab === "general" && (
              <GeneralInfo
                nombre={perfil?.nombrecompleto ?? ''}
                saving={saving}
                onSave={handleSaveGeneral}
                onCancel={() => router.push('/profile')}
              />
            )}
            {selectedTab === "accounts" && <LinkedAccounts />}
            {selectedTab === "risk" && (
              <RiskProfile
                perfilRiesgo={perfil?.perfilriesgocodigo ?? 'MEDIO'}
                saving={saving}
                onSave={handleSaveRiesgo}
              />
            )}
            {selectedTab === "security" && <SecuritySettings />}
            {selectedTab === "preferences" && (
              <Preferences
                divisaBase={perfil?.divisabasecodigo ?? 'EUR'}
                saving={saving}
                onSave={handleSavePreferencias}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function GeneralInfo({ nombre, saving, onSave, onCancel }: {
  nombre: string;
  saving: boolean;
  onSave: (nombre: string) => void;
  onCancel: () => void;
}) {
  const [value, setValue] = useState(nombre);

  useEffect(() => { setValue(nombre); }, [nombre]);

  return (
    <Card className="bg-zinc-900/70 border border-white/5">
      <CardHeader>
        <CardTitle className="text-3xl">Información General</CardTitle>
      </CardHeader>
      <CardContent className="space-y-8 pt-6">
        <div className="space-y-2">
          <Label className="text-xl">Nombre Completo</Label>
          <Input
            value={value}
            onChange={e => setValue(e.target.value)}
            className="bg-zinc-950 border-white/10 h-14 text-2xl"
            placeholder="Tu nombre"
          />
        </div>

        <div className="flex gap-4 pt-6">
          <Button
            onClick={() => onSave(value)}
            disabled={saving}
            className="bg-white text-black hover:bg-zinc-200 h-12 text-base px-8 disabled:opacity-50"
          >
            {saving ? 'Guardando...' : 'Guardar Cambios'}
          </Button>
          <Button variant="outline" onClick={onCancel} className="h-12 text-base px-8">
            Cancelar
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function LinkedAccounts() {
  const accounts = [
    { id: 1, name: "Binance", type: "Exchange", status: "Desconectada", apiKey: "—", lastSync: "—", color: "bg-yellow-500" },
    { id: 2, name: "Interactive Brokers", type: "Broker", status: "Desconectada", apiKey: "—", lastSync: "—", color: "bg-blue-500" },
    { id: 3, name: "Coinbase", type: "Exchange", status: "Desconectada", apiKey: "—", lastSync: "—", color: "bg-indigo-500" },
  ];

  return (
    <div className="space-y-6">
      <Card className="bg-zinc-900/70 border border-white/5">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-3xl">Cuentas Vinculadas</CardTitle>
              <CardDescription>Gestiona las conexiones con tus exchanges y brokers</CardDescription>
            </div>
            <Button className="text-lg">+ Añadir Cuenta</Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {accounts.map((account) => (
            <Card key={account.id} className="bg-zinc-950/70 border border-white/5">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-5">
                    <div className={`w-14 h-14 ${account.color} rounded-2xl flex items-center justify-center text-white text-2xl font-medium`}>
                      {account.name.substring(0, 2)}
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold">{account.name}</h3>
                      <p className="text-zinc-400">{account.type}</p>
                      <Badge variant="secondary" className="mt-2">{account.status}</Badge>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="icon"><Key className="w-5 h-5" /></Button>
                    <Button variant="ghost" size="icon"><Trash2 className="w-5 h-5 text-red-500" /></Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </CardContent>
      </Card>

      <Card className="bg-zinc-900/50 border border-blue-500/20">
        <CardContent className="p-8 flex gap-5">
          <Shield className="w-8 h-8 text-blue-400 mt-1" />
          <div>
            <h3 className="text-xl font-semibold">Seguridad de tus API Keys</h3>
            <p className="text-zinc-400 mt-3">
              Todas las API Keys se almacenan cifradas y solo tienen permisos de lectura.
              Nunca podremos realizar operaciones en tu nombre.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function RiskProfile({ perfilRiesgo, saving, onSave }: {
  perfilRiesgo: string;
  saving: boolean;
  onSave: (riesgo: string) => void;
}) {
  const [selected, setSelected] = useState(perfilRiesgo);

  useEffect(() => { setSelected(perfilRiesgo); }, [perfilRiesgo]);

  const riskProfiles = [
    { id: "BAJO",  name: "Conservador", description: "Prefiero ganar poco pero dormir tranquilo", color: "from-green-500 to-emerald-600" },
    { id: "MEDIO", name: "Moderado",    description: "Quiero crecer, pero sin sobresaltos extremos", color: "from-blue-500 to-indigo-600" },
    { id: "ALTO",  name: "Agresivo",    description: "Asumo volatilidad porque creo en el crecimiento a largo plazo", color: "from-orange-500 to-red-600" },
  ];

  return (
    <Card className="bg-zinc-900/70 border border-white/5">
      <CardHeader>
        <CardTitle className="text-3xl">Perfil de Riesgo</CardTitle>
        <CardDescription>Selecciona tu perfil para recibir recomendaciones personalizadas</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {riskProfiles.map((profile) => (
            <Card
              key={profile.id}
              className={`cursor-pointer transition-all border bg-zinc-950/70 ${
                selected === profile.id ? 'border-blue-500 bg-blue-950/30' : 'border-white/10 hover:border-white/20'
              }`}
              onClick={() => setSelected(profile.id)}
            >
              <CardContent className="p-8">
                <div className="flex items-start gap-6">
                  <div className={`w-20 h-20 bg-gradient-to-br ${profile.color} rounded-3xl flex items-center justify-center text-white text-5xl font-bold`}>
                    {profile.name[0]}
                  </div>
                  <div className="flex-1 pt-2">
                    <div className="flex justify-between items-start">
                      <h3 className="text-3xl font-semibold">{profile.name}</h3>
                      {selected === profile.id && <Badge className="bg-blue-600">Seleccionado</Badge>}
                    </div>
                    <p className="text-xl text-zinc-400 italic mt-4">"{profile.description}"</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Button
          onClick={() => onSave(selected)}
          disabled={saving}
          className="mt-8 w-full h-14 text-lg disabled:opacity-50"
        >
          {saving ? 'Guardando...' : 'Guardar Perfil de Riesgo'}
        </Button>
      </CardContent>
    </Card>
  );
}

function SecuritySettings() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [saving, setSaving] = useState(false);
  const supabase = createClient();

  const handlePasswordChange = async () => {
    if (newPassword !== confirmPassword) {
      setMessage('Las contraseñas no coinciden');
      return;
    }
    if (newPassword.length < 6) {
      setMessage('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    setSaving(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setSaving(false);

    if (error) {
      setMessage('Error al cambiar la contraseña: ' + error.message);
    } else {
      setMessage('Contraseña actualizada correctamente');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    }
  };

  return (
    <Card className="bg-zinc-900/70 border border-white/5">
      <CardHeader>
        <CardTitle className="text-3xl">Seguridad</CardTitle>
      </CardHeader>
      <CardContent className="space-y-10">
        <div>
          <h3 className="text-xl font-semibold mb-6">Cambiar Contraseña</h3>
          <div className="space-y-5">
            <Input
              type="password"
              placeholder="Nueva contraseña"
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              className="bg-zinc-950 border-white/10 h-14 text-2xl"
            />
            <Input
              type="password"
              placeholder="Confirmar nueva contraseña"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              className="bg-zinc-950 border-white/10 h-14 text-2xl"
            />
            {message && (
              <p className={`text-base ${message.includes('correctamente') ? 'text-emerald-400' : 'text-red-400'}`}>
                {message}
              </p>
            )}
            <Button
              onClick={handlePasswordChange}
              disabled={saving}
              className="mt-4 h-12 px-8 text-lg bg-white text-black hover:bg-zinc-200 font-semibold disabled:opacity-50"
            >
              {saving ? 'Actualizando...' : 'Actualizar Contraseña'}
            </Button>
          </div>
        </div>

        <div className="pt-6 border-t border-white/5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-semibold">Autenticación de Dos Factores (2FA)</h3>
              <p className="text-zinc-400 mt-2">Añade una capa extra de seguridad</p>
            </div>
            <Button className="h-12 px-10 text-lg bg-white text-black hover:bg-zinc-200 font-semibold">
              Activar 2FA
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function Preferences({ divisaBase, saving, onSave }: {
  divisaBase: string;
  saving: boolean;
  onSave: (divisa: string) => void;
}) {
  const [divisa, setDivisa] = useState(divisaBase);

  useEffect(() => { setDivisa(divisaBase); }, [divisaBase]);

  return (
    <Card className="bg-zinc-900/70 border border-white/5">
      <CardHeader>
        <CardTitle className="text-3xl">Preferencias</CardTitle>
      </CardHeader>
      <CardContent className="space-y-8 pt-4">
        <div className="space-y-3">
          <Label className="text-lg">Divisa Base</Label>
          <Select value={divisa} onValueChange={setDivisa}>
            <SelectTrigger className="bg-zinc-950 border-white/10 h-14 text-xl">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-white text-black border border-zinc-200 shadow-xl">
              <SelectItem value="EUR" className="text-black hover:bg-zinc-100">EUR - Euro</SelectItem>
              <SelectItem value="USD" className="text-black hover:bg-zinc-100">USD - Dólar Estadounidense</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button
          onClick={() => onSave(divisa)}
          disabled={saving}
          className="mt-6 w-full h-14 text-lg disabled:opacity-50"
        >
          {saving ? 'Guardando...' : 'Guardar Preferencias'}
        </Button>
      </CardContent>
    </Card>
  );
}
