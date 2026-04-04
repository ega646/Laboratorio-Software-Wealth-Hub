// components/Header.tsx
"use client";

import Link from "next/link";
import { useState } from "react";
import { useAuth } from "@/lib/context/AuthContext";
import { Button } from "@/components/ui/button";
import { TrendingUp, User, LogOut, Menu, X } from "lucide-react";

export function Header() {
  const { isLoggedIn, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    window.location.href = "/";
  };

  return (
    <header className="border-b border-white/10 bg-zinc-950/90 backdrop-blur-xl sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-20">
          {/* Logo - texto más grande, icono original */}
          <Link href="/" className="flex items-center gap-3 font-semibold text-[26px]">
            <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <span className="text-white tracking-tight">Wealth Hub</span>
          </Link>

          {/* Desktop Navigation + Auth */}
          <div className="flex items-center gap-8">
            {isLoggedIn ? (
              <>
                <Link href="/dashboard" className="hidden md:block">
                  <Button variant="ghost" className="text-zinc-300 hover:text-white text-lg font-medium">Dashboard</Button>
                </Link>
                <Link href="/profile" className="hidden md:block">
                  <Button variant="ghost" className="text-zinc-300 hover:text-white flex items-center gap-2 text-lg font-medium">
                    <User className="w-5 h-5" />
                    Perfil
                  </Button>
                </Link>
                <Button 
                  variant="outline" 
                  className="border-white/30 hover:bg-white/10 text-white text-lg font-medium px-8 py-6"
                  onClick={handleLogout}
                >
                  <LogOut className="w-5 h-5 mr-2" />
                  Cerrar Sesión
                </Button>
              </>
            ) : (
              <>
                <Link href="/login" className="hidden md:block">
                  <Button variant="ghost" className="text-zinc-300 hover:text-white text-base font-medium px-5">
                    Iniciar Sesión
                  </Button>
                </Link>
                <Link href="/register">
                  <Button className="bg-white text-black hover:bg-zinc-100 font-semibold text-base px-6 py-5 rounded-2xl">
                    Crear Cuenta Gratis
                  </Button>
                </Link>
              </>
            )}

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden text-white"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="w-7 h-7" /> : <Menu className="w-7 h-7" />}
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}