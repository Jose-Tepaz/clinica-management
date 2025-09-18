-- Add first_name and last_name columns to doctors table
ALTER TABLE public.doctors 
ADD COLUMN IF NOT EXISTS first_name TEXT,
ADD COLUMN IF NOT EXISTS last_name TEXT;

-- Update existing doctors with names from profiles if they exist
UPDATE public.doctors 
SET first_name = p.first_name, last_name = p.last_name
FROM public.profiles p
WHERE doctors.user_id = p.id 
AND (doctors.first_name IS NULL OR doctors.last_name IS NULL);
