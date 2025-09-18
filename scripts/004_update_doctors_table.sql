-- Adding new fields to doctors table: name, phone, and color for calendar identification
ALTER TABLE public.doctors 
ADD COLUMN IF NOT EXISTS first_name TEXT,
ADD COLUMN IF NOT EXISTS last_name TEXT,
ADD COLUMN IF NOT EXISTS phone TEXT,
ADD COLUMN IF NOT EXISTS color TEXT DEFAULT '#3B82F6'; -- Default blue color

-- Update existing doctors with sample data if any exist
UPDATE public.doctors 
SET 
  first_name = 'Doctor',
  last_name = 'Ejemplo',
  phone = '555-0000',
  color = '#3B82F6'
WHERE first_name IS NULL;

-- Add constraint to ensure color is a valid hex color
ALTER TABLE public.doctors 
ADD CONSTRAINT doctors_color_format 
CHECK (color ~ '^#[0-9A-Fa-f]{6}$');
