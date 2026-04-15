# Wealth Hub

Aplicación de gestión de patrimonio personal. Next.js 15 + TypeScript + Supabase.

---

## Requisitos previos

- Node.js 20 o superior — [nodejs.org](https://nodejs.org)
- Acceso al proyecto de Supabase (credenciales proporcionadas por Jose)

---

## Puesta en marcha

**1. Clonar e instalar dependencias**
```bash
git clone https://github.com/ega646/Laboratorio-Software-Wealth-Hub
cd Laboratorio-Software-Wealth-Hub
npm install
```

**2. Configurar credenciales**
```bash
cp .env.local.example .env.local
```
Abrir `.env.local` y rellenar con los valores
```
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
```

**3. Arrancar en local**
```bash
npm run dev
```
Abre [http://localhost:3000](http://localhost:3000)

## Stack

- Next.js 15 (App Router) + TypeScript
- Supabase (PostgreSQL + Auth + RLS)
- Tailwind CSS + shadcn/ui
- Recharts
