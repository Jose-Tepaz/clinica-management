-- Remove license_number column from doctors table
ALTER TABLE public.doctors DROP COLUMN IF EXISTS license_number;
