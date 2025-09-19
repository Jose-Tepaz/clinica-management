# 📝 Plantilla de Variables de Entorno

## 🚀 **Variables Necesarias para tu Proyecto**

### **Archivo: `.env.local`**

```bash
# ==============================================
# VARIABLES OBLIGATORIAS
# ==============================================

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here

# ==============================================
# VARIABLES OPCIONALES (Solo para desarrollo)
# ==============================================

# Redirect URL para desarrollo local (opcional)
# Si no se define, usa automáticamente: http://localhost:3000/dashboard
NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL=http://localhost:3000/dashboard
```

## 📋 **Instrucciones:**

1. **Crea el archivo `.env.local`** en la raíz de tu proyecto
2. **Copia el contenido** de arriba
3. **Reemplaza** `your_supabase_project_url_here` con tu URL de Supabase
4. **Reemplaza** `your_supabase_anon_key_here` con tu clave anónima de Supabase
5. **Opcionalmente** configura la URL de redirect para desarrollo

## ✅ **Variables que NO necesitas:**

```bash
# ❌ ESTAS NO SE USAN:
NEXT_PUBLIC_APP_URL=https://tu-dominio.com
NEXT_PUBLIC_VERCEL_ANALYTICS_ID=your_analytics_id  
NODE_ENV=production
```

## 🎯 **Resumen:**

- **✅ 2 variables obligatorias** (Supabase)
- **✅ 1 variable opcional** (solo desarrollo)
- **❌ 3 variables innecesarias** eliminadas

¡Tu proyecto funcionará perfectamente con solo las variables de Supabase!
