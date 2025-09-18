-- Check current doctors data
SELECT 
  id,
  user_id,
  specialty,
  first_name,
  last_name,
  created_at
FROM public.doctors
ORDER BY created_at DESC;

-- Check if there are any appointments with doctors
SELECT 
  a.id as appointment_id,
  a.appointment_date,
  d.id as doctor_id,
  d.specialty,
  d.first_name,
  d.last_name
FROM public.appointments a
JOIN public.doctors d ON a.doctor_id = d.id
ORDER BY a.appointment_date DESC
LIMIT 5;
