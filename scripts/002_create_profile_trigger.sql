-- Este código crea una función y un trigger en PostgreSQL para que, cada vez que se inserte un nuevo usuario en la tabla auth.users (es decir, cuando se registre un usuario nuevo en el sistema), automáticamente se cree un registro correspondiente en la tabla public.profiles.

-- La función handle_new_user toma los datos del nuevo usuario (NEW) y los inserta en la tabla profiles, extrayendo el nombre, apellido y rol desde los metadatos del usuario (raw_user_meta_data). Si no existen esos datos, pone valores por defecto (cadena vacía para nombre y apellido, y 'staff' para el rol). Si ya existe un perfil con ese id, no hace nada (ON CONFLICT DO NOTHING).

-- El trigger on_auth_user_created se asegura de que esta función se ejecute automáticamente después de cada inserción en auth.users.

-- En resumen: este código mantiene sincronizadas las tablas de usuarios y perfiles, creando automáticamente un perfil cada vez que se registra un usuario nuevo.

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, first_name, last_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'first_name', ''),
    COALESCE(NEW.raw_user_meta_data ->> 'last_name', ''),
    COALESCE(NEW.raw_user_meta_data ->> 'role', 'staff')
  )
  ON CONFLICT (id) DO NOTHING;
  
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
