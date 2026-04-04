// app/profile/edit/page.tsx
"use client";

import { useState } from "react";
import { Header } from "@/components/Header";
import Link from "next/link";
import { 
  User, Settings, Shield, CreditCard, Key, Trash2, 
  ChevronRight, ArrowLeft, LogOut 
} from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function PerfilEdit() {
  const [selectedTab, setSelectedTab] = useState("general");

  const tabs = [
    { id: "general", label: "Información General", icon: User },
    { id: "accounts", label: "Cuentas Vinculadas", icon: CreditCard },
    { id: "risk", label: "Perfil de Riesgo", icon: Shield },
    { id: "security", label: "Seguridad", icon: Shield },
    { id: "preferences", label: "Preferencias", icon: Settings },
  ];

  const [formData, setFormData] = useState({
    firstName: "Juan",
    lastName: "Pérez",
    email: "juan.perez@email.com",
    phone: "+34 612 345 678",
    location: "Madrid, España",
  });

  const [selectedRisk, setSelectedRisk] = useState("moderado");

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = () => {
    alert("✅ Cambios guardados correctamente (simulación)");
    window.location.href = "/profile";
  };

  const handleCancel = () => {
    window.location.href = "/profile";
  };

  const handleLogout = () => {
    window.location.href = "/";
  };

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

        {/* Header */}
        <Card className="bg-zinc-900/70 border border-white/5 mb-12">
          <CardContent className="p-12">
            <div className="flex items-start gap-6">
              <div className="w-28 h-28 bg-gradient-to-br from-blue-500 to-purple-500 rounded-3xl flex items-center justify-center text-white text-6xl font-bold">
                JP
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
          {/* Sidebar */}
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

          {/* Content Area */}
          <div className="lg:col-span-3 space-y-8">
            {selectedTab === "general" && (
              <GeneralInfo 
                formData={formData} 
                handleInputChange={handleInputChange} 
                handleSave={handleSave} 
                handleCancel={handleCancel} 
              />
            )}
            {selectedTab === "accounts" && <LinkedAccounts />}
            {selectedTab === "risk" && <RiskProfile selectedRisk={selectedRisk} setSelectedRisk={setSelectedRisk} />}
            {selectedTab === "security" && <SecuritySettings />}
            {selectedTab === "preferences" && <Preferences />}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ==================== Subcomponentes ==================== */

function GeneralInfo({ formData, handleInputChange, handleSave, handleCancel }: any) {
  return (
    <Card className="bg-zinc-900/70 border border-white/5">
      <CardHeader>
        <CardTitle className="text-3xl">Información General</CardTitle>
      </CardHeader>
      <CardContent className="space-y-8 pt-6">
        {/* ... (sin cambios) */}
        <div className="grid md:grid-cols-2 gap-8">
          <div className="space-y-2">
            <Label className="text-xl">Nombre</Label>
            <Input 
              name="firstName"
              value={formData.firstName}
              onChange={handleInputChange}
              className="bg-zinc-950 border-white/10 h-14 text-2xl"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-xl">Apellidos</Label>
            <Input 
              name="lastName"
              value={formData.lastName}
              onChange={handleInputChange}
              className="bg-zinc-950 border-white/10 h-14 text-2xl"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-xl">Correo Electrónico</Label>
          <Input 
            name="email"
            type="email"
            value={formData.email}
            onChange={handleInputChange}
            className="bg-zinc-950 border-white/10 h-14 text-2xl"
          />
        </div>

        <div className="space-y-2">
          <Label className="text-xl">Teléfono</Label>
          <Input 
            name="phone"
            type="tel"
            value={formData.phone}
            onChange={handleInputChange}
            className="bg-zinc-950 border-white/10 h-14 text-2xl"
          />
        </div>

        <div className="space-y-2">
          <Label className="text-xl">Ubicación</Label>
          <Input 
            name="location"
            value={formData.location}
            onChange={handleInputChange}
            className="bg-zinc-950 border-white/10 h-14 text-2xl"
          />
        </div>

        <div className="flex gap-4 pt-6">
          <Button onClick={handleSave} className="bg-white text-black hover:bg-zinc-200 h-12 text-base px-8">
            Guardar Cambios
          </Button>
          <Button variant="outline" onClick={handleCancel} className="h-12 text-base px-8">
            Cancelar
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function LinkedAccounts() {
  // ... (sin cambios en esta función)
  const accounts = [
    { id: 1, name: "Binance", type: "Exchange", status: "Conectada", apiKey: "bina_****_3f2a", lastSync: "Hace 5 min", color: "bg-yellow-500" },
    { id: 2, name: "Interactive Brokers", type: "Broker", status: "Conectada", apiKey: "ibkr_****_8h9k", lastSync: "Hace 10 min", color: "bg-blue-500" },
    { id: 3, name: "Coinbase", type: "Exchange", status: "Desconectada", apiKey: "coin_****_1m4n", lastSync: "Hace 2 días", color: "bg-indigo-500" },
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
                      <div className="flex items-center gap-4 text-sm mt-2">
                        <span className="text-zinc-500">API Key: {account.apiKey}</span>
                        <Badge variant={account.status === "Conectada" ? "default" : "destructive"}>
                          {account.status}
                        </Badge>
                      </div>
                      <p className="text-xs text-zinc-500 mt-3">Última sincronización: {account.lastSync}</p>
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

function RiskProfile({ selectedRisk, setSelectedRisk }: any) {
  const riskProfiles = [
    { id: "conservador", name: "Conservador", description: "Prefiero ganar poco pero dormir tranquilo", color: "from-green-500 to-emerald-600" },
    { id: "moderado", name: "Moderado", description: "Quiero crecer, pero sin sobresaltos extremos", color: "from-blue-500 to-indigo-600" },
    { id: "agresivo", name: "Agresivo", description: "Asumo volatilidad porque creo en el crecimiento a largo plazo", color: "from-orange-500 to-red-600" },
  ];

  return (
    <Card className="bg-zinc-900/70 border border-white/5">
      <CardHeader>
        <CardTitle className="text-3xl">Perfil de Riesgo</CardTitle>
        <CardDescription>Selecciona tu perfil de riesgo para recibir recomendaciones personalizadas</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {riskProfiles.map((profile) => (
            <Card
              key={profile.id}
              className={`cursor-pointer transition-all border bg-zinc-950/70 ${
                selectedRisk === profile.id 
                  ? 'border-blue-500 bg-blue-950/30' 
                  : 'border-white/10 hover:border-white/20'
              }`}
              onClick={() => setSelectedRisk(profile.id)}
            >
              <CardContent className="p-8">
                <div className="flex items-start gap-6">
                  <div className={`w-20 h-20 bg-gradient-to-br ${profile.color} rounded-3xl flex items-center justify-center text-white text-5xl font-bold`}>
                    {profile.name[0]}
                  </div>
                  <div className="flex-1 pt-2">
                    <div className="flex justify-between items-start">
                      <h3 className="text-3xl font-semibold">{profile.name}</h3>
                      {selectedRisk === profile.id && <Badge className="bg-blue-600">Seleccionado</Badge>}
                    </div>
                    <p className="text-xl text-zinc-400 italic mt-4">"{profile.description}"</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Button className="mt-8 w-full h-14 text-lg">Guardar Perfil de Riesgo</Button>
      </CardContent>
    </Card>
  );
}

// El resto de subcomponentes (SecuritySettings y Preferences) se mantienen iguales
function SecuritySettings() {
  return (
    <Card className="bg-zinc-900/70 border border-white/5">
      <CardHeader>
        <CardTitle className="text-3xl">Seguridad</CardTitle>
      </CardHeader>
      <CardContent className="space-y-10">
        <div>
          <h3 className="text-xl font-semibold mb-6">Cambiar Contraseña</h3>
          <div className="space-y-5">
            <Input type="password" placeholder="Contraseña actual" className="bg-zinc-950 border-white/10 h-14 text-2xl" />
            <Input type="password" placeholder="Nueva contraseña" className="bg-zinc-950 border-white/10 h-14 text-2xl" />
            <Input type="password" placeholder="Confirmar nueva contraseña" className="bg-zinc-950 border-white/10 h-14 text-2xl" />
            <Button className="mt-4 h-12 text-lg">Actualizar Contraseña</Button>
          </div>
        </div>

        <div className="pt-6 border-t border-white/5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-semibold">Autenticación de Dos Factores (2FA)</h3>
              <p className="text-zinc-400 mt-2">Añade una capa extra de seguridad</p>
            </div>
            <Button className="h-12 text-lg">Activar 2FA</Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function Preferences() {
  return (
    <Card className="bg-zinc-900/70 border border-white/5">
      <CardHeader>
        <CardTitle className="text-3xl">Preferencias</CardTitle>
      </CardHeader>
      <CardContent className="space-y-8 pt-4">
        <div className="space-y-3">
          <Label className="text-lg">Divisa Base</Label>
          <Select defaultValue="eur">
            <SelectTrigger className="bg-zinc-950 border-white/10 h-14 text-xl">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-white text-black border border-zinc-200 shadow-xl">
              <SelectItem value="eur" className="text-black hover:bg-zinc-100">EUR - Euro</SelectItem>
              <SelectItem value="usd" className="text-black hover:bg-zinc-100">USD - Dólar Estadounidense</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-3">
          <Label className="text-lg">Idioma</Label>
          <Select defaultValue="es">
            <SelectTrigger className="bg-zinc-950 border-white/10 h-14 text-xl">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-white text-black border border-zinc-200 shadow-xl">
              <SelectItem value="es" className="text-black hover:bg-zinc-100">Español</SelectItem>
              <SelectItem value="en" className="text-black hover:bg-zinc-100">English</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button className="mt-6 w-full h-14 text-lg">Guardar Preferencias</Button>
      </CardContent>
    </Card>
  );
}