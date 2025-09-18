# Sistema de Gestión de Clínica - Contexto y Arquitectura

## 📋 Resumen del Proyecto

**Clínica Management** es un sistema web completo para la gestión de clínicas médicas, desarrollado con Next.js 14, TypeScript, Supabase y Tailwind CSS. El sistema permite administrar pacientes, citas médicas, doctores, servicios y registros médicos de manera eficiente y segura.

## 🏗️ Arquitectura Técnica

### Stack Tecnológico
- **Frontend**: Next.js 14 con App Router
- **Lenguaje**: TypeScript
- **Base de Datos**: Supabase (PostgreSQL)
- **Autenticación**: Supabase Auth
- **UI**: Tailwind CSS + Radix UI
- **Componentes**: shadcn/ui
- **Formularios**: React Hook Form + Zod
- **Estado**: React Hooks (useState, useEffect)
- **Iconos**: Lucide React

### Estructura del Proyecto

```
clinica-management/
├── app/                          # App Router de Next.js
│   ├── auth/                     # Autenticación
│   │   ├── login/page.tsx        # Página de login
│   │   ├── register/page.tsx     # Página de registro
│   │   └── error/page.tsx        # Página de error
│   ├── dashboard/                # Panel principal
│   │   ├── layout.tsx            # Layout del dashboard
│   │   ├── page.tsx              # Dashboard principal
│   │   ├── patients/             # Gestión de pacientes
│   │   ├── appointments/         # Gestión de citas
│   │   ├── doctors/              # Gestión de doctores
│   │   ├── services/             # Gestión de servicios
│   │   └── medical-records/      # Registros médicos
│   ├── layout.tsx                # Layout principal
│   └── page.tsx                  # Página de inicio
├── components/                   # Componentes reutilizables
│   ├── ui/                       # Componentes base (shadcn/ui)
│   ├── dashboard/                # Componentes del dashboard
│   ├── patients/                 # Componentes de pacientes
│   ├── appointments/             # Componentes de citas
│   ├── doctors/                  # Componentes de doctores
│   ├── services/                 # Componentes de servicios
│   └── medical-records/          # Componentes de registros médicos
├── lib/                          # Utilidades y configuración
│   ├── supabase/                 # Cliente de Supabase
│   └── utils.ts                  # Utilidades generales
├── scripts/                      # Scripts de base de datos
└── hooks/                        # Hooks personalizados
```

## 🗄️ Base de Datos (Supabase)

### Esquema Principal

#### 1. **profiles** - Perfiles de Usuario
```sql
- id (UUID, FK a auth.users)
- email (TEXT)
- first_name (TEXT)
- last_name (TEXT)
- role (ENUM: 'admin', 'doctor', 'nurse', 'staff')
- phone (TEXT)
- created_at, updated_at (TIMESTAMP)
```

#### 2. **patients** - Pacientes
```sql
- id (UUID, PK)
- first_name, last_name (TEXT)
- email, phone (TEXT)
- date_of_birth (DATE)
- address (TEXT)
- emergency_contact_name, emergency_contact_phone (TEXT)
- medical_notes (TEXT)
- created_by (UUID, FK a auth.users)
- created_at, updated_at (TIMESTAMP)
```

#### 3. **doctors** - Doctores
```sql
- id (UUID, PK)
- user_id (UUID, FK a auth.users)
- specialty (TEXT)
- created_at (TIMESTAMP)
```

#### 4. **services** - Servicios
```sql
- id (UUID, PK)
- name (TEXT)
- description (TEXT)
- duration_minutes (INTEGER)
- price (DECIMAL)
- created_at (TIMESTAMP)
```

#### 5. **appointments** - Citas Médicas
```sql
- id (UUID, PK)
- patient_id (UUID, FK a patients)
- doctor_id (UUID, FK a doctors)
- service_id (UUID, FK a services)
- appointment_date (TIMESTAMP)
- duration_minutes (INTEGER)
- status (ENUM: 'scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show')
- notes (TEXT)
- created_by (UUID, FK a auth.users)
- created_at, updated_at (TIMESTAMP)
```

#### 6. **medical_records** - Registros Médicos
```sql
- id (UUID, PK)
- patient_id (UUID, FK a patients)
- appointment_id (UUID, FK a appointments)
- doctor_id (UUID, FK a doctors)
- diagnosis (TEXT)
- treatment (TEXT)
- medications (TEXT)
- notes (TEXT)
- record_date (TIMESTAMP)
- created_by (UUID, FK a auth.users)
- created_at (TIMESTAMP)
```

### Seguridad (Row Level Security)
- Todas las tablas tienen RLS habilitado
- Políticas específicas por rol y usuario
- Acceso controlado por autenticación

## 🎯 Funcionalidades Implementadas

### 1. **Autenticación y Autorización**
- ✅ Login/Logout con Supabase Auth
- ✅ Registro de usuarios
- ✅ Middleware de protección de rutas
- ✅ Sistema de roles (admin, doctor, nurse, staff)
- ✅ Redirección automática según estado de autenticación

### 2. **Dashboard Principal**
- ✅ Estadísticas generales (pacientes, citas, servicios)
- ✅ Accesos rápidos a funciones principales
- ✅ Estado del sistema
- ✅ Información del usuario actual

### 3. **Gestión de Pacientes**
- ✅ Lista de pacientes con búsqueda y filtrado
- ✅ Formulario de creación/edición de pacientes
- ✅ Vista detallada de paciente individual
- ✅ Registros médicos por paciente
- ✅ Información de contacto de emergencia

### 4. **Gestión de Citas**
- ✅ Lista de citas con filtros por estado y fecha
- ✅ Formulario de creación/edición de citas
- ✅ Selección de paciente, doctor y servicio
- ✅ Estados de cita (programada, confirmada, en progreso, completada, cancelada, no asistió)
- ✅ Notas y observaciones

### 5. **Gestión de Doctores** (Solo Admin)
- ✅ Lista de doctores con especialidades
- ✅ Formulario de registro de doctores
- ✅ Vinculación con usuarios del sistema

### 6. **Gestión de Servicios** (Solo Admin)
- ✅ Lista de servicios disponibles
- ✅ Configuración de duración y precios
- ✅ Descripción de servicios

### 7. **Registros Médicos**
- ✅ Creación de registros médicos
- ✅ Diagnóstico, tratamiento y medicamentos
- ✅ Vinculación con citas y pacientes
- ✅ Historial médico completo

## 🔐 Sistema de Roles

### **Admin**
- Acceso completo a todas las funcionalidades
- Gestión de doctores y servicios
- Vista de estadísticas generales

### **Doctor**
- Gestión de pacientes asignados
- Creación y edición de citas
- Creación de registros médicos
- Acceso a su información personal

### **Nurse/Staff**
- Gestión básica de pacientes
- Creación de citas
- Acceso limitado según permisos

## 🎨 Interfaz de Usuario

### Componentes UI Utilizados
- **shadcn/ui**: Componentes base modernos y accesibles
- **Radix UI**: Primitivos sin estilos para máxima flexibilidad
- **Tailwind CSS**: Estilos utilitarios para diseño responsivo
- **Lucide React**: Iconografía consistente

### Características de UX
- ✅ Diseño responsivo (mobile-first)
- ✅ Tema claro/oscuro
- ✅ Navegación intuitiva con sidebar
- ✅ Formularios validados
- ✅ Estados de carga y error
- ✅ Búsqueda y filtrado en tiempo real

## 🚀 Estado Actual del Proyecto

### ✅ Completado
- Estructura base del proyecto
- Autenticación completa
- Dashboard funcional
- CRUD completo para todas las entidades
- Base de datos configurada con RLS
- UI/UX moderna y responsiva

### 🔄 En Desarrollo/Mejoras Potenciales
- Calendario visual de citas
- Notificaciones en tiempo real
- Reportes y estadísticas avanzadas
- Integración con sistemas de pago
- Backup automático de datos
- API REST para integraciones externas

## 📝 Scripts de Base de Datos

El proyecto incluye scripts SQL organizados:
1. `001_create_database_schema.sql` - Esquema principal
2. `002_create_profile_trigger.sql` - Trigger para perfiles automáticos
3. `003_seed_initial_data.sql` - Datos iniciales (servicios)
4. `004_update_doctors_table.sql` - Actualizaciones de doctores
5. `005_remove_license_number_from_doctors.sql` - Limpieza de campos

## 🔧 Configuración y Despliegue

### Variables de Entorno Requeridas
```env
NEXT_PUBLIC_SUPABASE_URL=tu_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_supabase_anon_key
NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL=http://localhost:3000/dashboard
```

### Comandos Disponibles
```bash
npm run dev      # Desarrollo
npm run build    # Producción
npm run start    # Servidor de producción
npm run lint     # Linting
```

## 📈 Próximos Pasos Recomendados

1. **Mejoras de UX**
   - Implementar calendario visual para citas
   - Agregar notificaciones push
   - Mejorar filtros y búsquedas

2. **Funcionalidades Avanzadas**
   - Sistema de reportes
   - Integración con sistemas de facturación
   - Backup automático
   - API para integraciones

3. **Optimizaciones**
   - Implementar caché con React Query
   - Optimizar consultas de base de datos
   - Implementar paginación en listas grandes

4. **Seguridad**
   - Audit de permisos RLS
   - Implementar 2FA
   - Logs de auditoría

---

*Este documento proporciona una visión completa del estado actual del proyecto y sirve como guía para futuras modificaciones y extensiones del sistema.*
