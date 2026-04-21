# AUBASA — Sistema de Evaluación de Proveedores Críticos

ISO 9001:2015 · ISO 39001:2015 · PAU/06

## Arranque rápido

### 1. Backend

```bash
cd backend
npm install
# Configurar .env con tu MONGO_URI
node seed/seedETs.js   # Carga las 7 ETs iniciales
npm run dev            # Inicia en puerto 3001
```

### 2. Frontend

```bash
cd frontend
npm install
npm run dev            # Inicia en puerto 5173
```

### 3. Login de prueba

- **Email:** `admin@aubasa.com`
- **Password:** `admin123`

## Variables de entorno

### backend/.env
| Variable | Descripción |
|---|---|
| `MONGO_URI` | URI de MongoDB (local o Atlas) |
| `JWT_SECRET` | Clave secreta para JWT |
| `PORT` | Puerto del servidor (default 3001) |
| `AZURE_CLIENT_ID` | Client ID de Azure AD |
| `AZURE_TENANT_ID` | Tenant ID de Azure AD |

### frontend/.env
| Variable | Descripción |
|---|---|
| `VITE_API_URL` | URL de la API (default http://localhost:3001/api) |
| `VITE_AZURE_CLIENT_ID` | Client ID de Azure AD |
| `VITE_AZURE_TENANT_ID` | Tenant ID de Azure AD |

## Roles

| Rol | Permisos |
|---|---|
| `admin` | CRUD completo, gestión de usuarios y ETs |
| `evaluador_tecnico` | Carga evaluaciones de Desempeño e Inspección |
| `evaluador_compras` | Carga evaluaciones Iniciales y Anuales |
| `lectura` | Solo visualización |

## Estructura

```
aubasa-proveedores/
├── backend/          # Node.js + Express + Mongoose
└── frontend/         # React + Vite + Tailwind CSS
```
