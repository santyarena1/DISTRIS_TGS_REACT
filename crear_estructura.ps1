# Nombre del proyecto
$projectName = "marketplace-distribucion"

# Crear proyecto con Vite (React + TS)
Write-Host "Creando proyecto Vite..."
npm create vite@latest $projectName -- --template react-ts

# Entrar al directorio
Set-Location $projectName

# Instalar dependencias base y de UI
Write-Host "Instalando dependencias..."
npm install
npm install -D tailwindcss postcss autoprefixer
npm install lucide-react class-variance-authority clsx tailwind-merge react-router-dom axios

# Inicializar Tailwind
npx tailwindcss init -p

# Crear estructura de carpetas limpia
Write-Host "Creando estructura de carpetas..."
New-Item -ItemType Directory -Force -Path "src/components/ui"
New-Item -ItemType Directory -Force -Path "src/components/layout"
New-Item -ItemType Directory -Force -Path "src/pages"
New-Item -ItemType Directory -Force -Path "src/context"
New-Item -ItemType Directory -Force -Path "src/hooks"
New-Item -ItemType Directory -Force -Path "src/services"
New-Item -ItemType Directory -Force -Path "src/types"
New-Item -ItemType Directory -Force -Path "src/utils"
New-Item -ItemType Directory -Force -Path "src/assets/images"

# Crear archivos base vacíos (los llenaremos luego)
New-Item -ItemType File -Force -Path "src/services/api.ts"
New-Item -ItemType File -Force -Path "src/services/auth.service.ts"
New-Item -ItemType File -Force -Path "src/services/product.service.ts"
New-Item -ItemType File -Force -Path "src/services/sync.service.ts"
New-Item -ItemType File -Force -Path "src/context/AuthContext.tsx"
New-Item -ItemType File -Force -Path "src/types/index.ts"
New-Item -ItemType File -Force -Path "src/utils/cn.ts"

# Limpieza inicial
Remove-Item "src/App.css" -ErrorAction SilentlyContinue
Remove-Item "src/assets/react.svg" -ErrorAction SilentlyContinue

Write-Host "¡Estructura creada! Ahora configuraremos los archivos base."