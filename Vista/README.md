# Wealth Hub - Vista

## Requisitos del Proyecto

Este proyecto es una aplicación **Next.js 15** con **TypeScript**, **Tailwind CSS** y **shadcn/ui**.

### Tecnologías y Librerías Principales
- Next.js 15 (App Router)
- React 19
- TypeScript
- Tailwind CSS
- shadcn/ui (componentes)
- Lucide React (iconos)
- Recharts (gráficos)
- Next.js Image

---

## 1. Instalación en Windows

### Paso 1: Instalar Node.js (recomendado versión 20 o superior)
1. Descarga e instala Node.js desde: [https://nodejs.org](https://nodejs.org)
2. Elige la versión **LTS** (20.x o 22.x)
3. Después de instalar, abre **PowerShell** y verifica:
   ```powershell
   node -v
   npm -v

### Paso 2: Instalar dependencias del proyecto
Abre PowerShell o Terminal dentro de la carpeta del proyecto (Vista) y ejecuta:

#### Instalar todas las dependencias
npm install

npx shadcn@latest add button card input label badge alert-dialog checkbox select separator switch table tabs accordion avatar breadcrumb calendar collapsible command context-menu dialog drawer dropdown-menu form hover-card menubar navigation-menu pagination popover progress radio-group resizable scroll-area sheet sidebar skeleton slider sonner textarea toggle-group toggle tooltip

#### (Recomendado la primera vez) Instalación limpia
Remove-Item -Recurse -Force node_modules, package-lock.json -ErrorAction SilentlyContinue

npm install

npx shadcn@latest add button card input label badge alert-dialog checkbox select separator switch table tabs accordion avatar breadcrumb calendar collapsible command context-menu dialog drawer dropdown-menu form hover-card menubar navigation-menu pagination popover progress radio-group resizable scroll-area sheet sidebar skeleton slider sonner textarea toggle-group toggle tooltip

### Paso 3: Ejecutar el proyecto
npm run dev

Abre tu navegador en: http://localhost:3000

## 2. Instalación en Linux (Ubuntu / Debian)

### Paso 1: Instalar Node.js (versión 20 o superior)
#### Actualizar sistema
sudo apt update && sudo apt upgrade -y

#### Instalar Node.js 20 (LTS)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -

sudo apt install -y nodejs

#### Verificar
node -v
npm -v

### Paso 2: Instalar dependencias del proyecto
cd ~/ruta/a/tu/proyecto/Vista

#### Instalar dependencias
npm install

npx shadcn@latest add button card input label badge alert-dialog checkbox select separator switch table tabs accordion avatar breadcrumb calendar collapsible command context-menu dialog drawer dropdown-menu form hover-card menubar navigation-menu pagination popover progress radio-group resizable scroll-area sheet sidebar skeleton slider sonner textarea toggle-group toggle tooltip

#### (Opcional) Instalación limpia
rm -rf node_modules package-lock.json

npm install

npx shadcn@latest add button card input label badge alert-dialog checkbox select separator switch table tabs accordion avatar breadcrumb calendar collapsible command context-menu dialog drawer dropdown-menu form hover-card menubar navigation-menu pagination popover progress radio-group resizable scroll-area sheet sidebar skeleton slider sonner textarea toggle-group toggle tooltip

### Paso 3: Ejecutar el proyecto
npm run dev

Abre tu navegador en: http://localhost:3000
