-- Script para agregar nuevos roles a la tabla profiles
-- Ejecuta este script si quieres agregar roles adicionales

-- Opción 1: Agregar el rol 'assistant'
ALTER TABLE public.profiles 
DROP CONSTRAINT IF EXISTS profiles_role_check;

ALTER TABLE public.profiles 
ADD CONSTRAINT profiles_role_check 
CHECK (role IN ('admin', 'doctor', 'nurse', 'staff', 'assistant'));

-- Opción 2: Agregar múltiples roles personalizados
-- Descomenta y modifica según tus necesidades:

-- ALTER TABLE public.profiles 
-- DROP CONSTRAINT IF EXISTS profiles_role_check;

-- ALTER TABLE public.profiles 
-- ADD CONSTRAINT profiles_role_check 
-- CHECK (role IN (
--   'admin',           -- Administrador
--   'doctor',          -- Doctor
--   'nurse',           -- Enfermera/Enfermero
--   'staff',           -- Personal General
--   'assistant',       -- Asistente
--   'receptionist',    -- Recepcionista
--   'manager',         -- Gerente
--   'supervisor'       -- Supervisor
-- ));

-- Verificar que la restricción se aplicó correctamente
SELECT 
  conname as constraint_name,
  pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conname = 'profiles_role_check';
