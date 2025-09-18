-- Create users profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  first_name TEXT,
  last_name TEXT,
  role TEXT NOT NULL DEFAULT 'staff' CHECK (role IN ('admin', 'doctor', 'nurse', 'staff')),
  phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create patients table
CREATE TABLE IF NOT EXISTS public.patients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  date_of_birth DATE,
  address TEXT,
  emergency_contact_name TEXT,
  emergency_contact_phone TEXT,
  medical_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

-- Create doctors table
CREATE TABLE IF NOT EXISTS public.doctors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  specialty TEXT NOT NULL,
  license_number TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create services table
CREATE TABLE IF NOT EXISTS public.services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  duration_minutes INTEGER DEFAULT 30,
  price DECIMAL(10,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create appointments table
CREATE TABLE IF NOT EXISTS public.appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  doctor_id UUID NOT NULL REFERENCES public.doctors(id),
  service_id UUID REFERENCES public.services(id),
  appointment_date TIMESTAMP WITH TIME ZONE NOT NULL,
  duration_minutes INTEGER DEFAULT 30,
  status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

-- Create medical records table
CREATE TABLE IF NOT EXISTS public.medical_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  appointment_id UUID REFERENCES public.appointments(id),
  doctor_id UUID NOT NULL REFERENCES public.doctors(id),
  diagnosis TEXT,
  treatment TEXT,
  medications TEXT,
  notes TEXT,
  record_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.doctors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medical_records ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "profiles_select_own" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "profiles_insert_own" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- RLS Policies for patients (accessible by all authenticated users)
CREATE POLICY "patients_select_authenticated" ON public.patients FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "patients_insert_authenticated" ON public.patients FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "patients_update_authenticated" ON public.patients FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "patients_delete_authenticated" ON public.patients FOR DELETE USING (auth.role() = 'authenticated');

-- RLS Policies for doctors
CREATE POLICY "doctors_select_authenticated" ON public.doctors FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "doctors_insert_authenticated" ON public.doctors FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "doctors_update_own" ON public.doctors FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for services
CREATE POLICY "services_select_authenticated" ON public.services FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "services_insert_authenticated" ON public.services FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "services_update_authenticated" ON public.services FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "services_delete_authenticated" ON public.services FOR DELETE USING (auth.role() = 'authenticated');

-- RLS Policies for appointments
CREATE POLICY "appointments_select_authenticated" ON public.appointments FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "appointments_insert_authenticated" ON public.appointments FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "appointments_update_authenticated" ON public.appointments FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "appointments_delete_authenticated" ON public.appointments FOR DELETE USING (auth.role() = 'authenticated');

-- RLS Policies for medical records
CREATE POLICY "medical_records_select_authenticated" ON public.medical_records FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "medical_records_insert_authenticated" ON public.medical_records FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "medical_records_update_authenticated" ON public.medical_records FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "medical_records_delete_authenticated" ON public.medical_records FOR DELETE USING (auth.role() = 'authenticated');
