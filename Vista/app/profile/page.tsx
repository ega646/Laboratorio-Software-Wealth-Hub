// app/profile/page.tsx
"use client";

import { useState } from "react";
import { Header } from "@/components/Header";
import Link from "next/link";
import { 
  User, Settings, Shield, CreditCard, MapPin, Briefcase, 
  ArrowLeft, LogOut 
} from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function Perfil() {
  const [selectedTab, setSelectedTab] = useState("general");

  const tabs = [
    { id: "general", label: "Información General", icon: User },
    { id: "accounts", label: "Cuentas Vinculadas", icon: CreditCard },
    { id: "risk", label: "Perfil de Riesgo", icon: Shield },
    { id: "preferences", label: "Preferencias", icon: Settings },
  ];

  const handleLogout = () => {
    window.location.href = "/";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-black text-white">
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Back Button */}
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
              <div className="w-28 h-28 bg-gradient-to-br from-blue-500 to-purple-500 rounded-3xl flex items-center justify-center text-white text-6xl font-bold shrink-0">
                JP
              </div>
              <div className="flex-1">
                <h1 className="text-5xl font-bold">Juan Pérez</h1>
                <p className="text-2xl text-zinc-400 mt-2">juan.perez@email.com</p>
                
                <div className="flex flex-wrap gap-6 mt-8">
                  <div className="flex items-center gap-3 text-zinc-400">
                    <Briefcase className="w-5 h-5" />
                    Inversor Moderado
                  </div>
                  <div className="flex items-center gap-3 text-zinc-400">
                    <MapPin className="w-5 h-5" />
                    Madrid, España
                  </div>
                  <div className="flex items-center gap-3">
                    <Shield className="w-5 h-5 text-emerald-400" />
                    <span className="text-emerald-400 font-medium">Cuenta Verificada</span>
                  </div>
                </div>
              </div>

              {/* Botones un poco más grandes y con mismo estilo */}
              <div className="flex gap-4">
                <Button 
                  asChild 
                  variant="outline" 
                  className="border-white/10 hover:bg-white/5 text-white h-12 px-8 text-lg"
                >
                  <Link href="/profile/edit">
                    Editar Perfil
                  </Link>
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

        {/* Main Content con pestañas */}
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar Navigation */}
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

          {/* Content Area */}
          <div className="lg:col-span-3">
            {selectedTab === "general" && <GeneralInfo />}
            {selectedTab === "accounts" && <LinkedAccounts />}
            {selectedTab === "risk" && <RiskProfile />}
            {selectedTab === "preferences" && <Preferences />}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ==================== Subcomponentes - Modo Visualización ==================== */

function GeneralInfo() {
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
            <p className="text-xl font-medium text-white">Juan Pérez</p>
          </div>
          <div>
            <p className="text-zinc-500 text-sm mb-1">Correo electrónico</p>
            <p className="text-xl font-medium text-white">juan.perez@email.com</p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <p className="text-zinc-500 text-sm mb-1">Teléfono</p>
            <p className="text-xl font-medium text-white">+34 612 345 678</p>
          </div>
          <div>
            <p className="text-zinc-500 text-sm mb-1">Ubicación</p>
            <p className="text-xl font-medium text-white">Madrid, España</p>
          </div>
        </div>

        <div>
          <p className="text-zinc-500 text-sm mb-2">Tipo de inversor</p>
          <div className="inline-flex items-center px-5 py-2.5 bg-zinc-800/80 border border-zinc-700 rounded-2xl">
            <span className="text-xl font-medium text-white">Moderado</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function LinkedAccounts() {
  const accounts = [
    { name: "Binance", type: "Exchange", status: "Conectada", color: "bg-yellow-500" },
    { name: "Interactive Brokers", type: "Broker", status: "Conectada", color: "bg-blue-500" },
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
            <Badge variant={account.status === "Conectada" ? "default" : "secondary"} className="text-base px-5 py-1.5">
              {account.status}
            </Badge>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function RiskProfile() {
  return (
    <Card className="bg-zinc-900/70 border border-white/5">
      <CardHeader>
        <CardTitle className="text-3xl">Perfil de Riesgo Actual</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-3xl flex items-center justify-center text-white text-4xl font-bold">
            M
          </div>
          <div>
            <p className="text-3xl font-semibold">Moderado</p>
            <p className="text-xl text-zinc-400 mt-3">"Quiero crecer, pero sin sobresaltos extremos"</p>
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
      <CardContent className="space-y-6 text-lg">
        <div className="flex justify-between items-center py-5 border-b border-white/5">
          <span className="text-zinc-400">Divisa base</span>
          <span className="font-medium">Euro (EUR)</span>
        </div>
        <div className="flex justify-between items-center py-5">
          <span className="text-zinc-400">Idioma</span>
          <span className="font-medium">Español</span>
        </div>
      </CardContent>
    </Card>
  );
}