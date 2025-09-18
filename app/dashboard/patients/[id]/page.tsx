import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { PatientDetailWrapper } from "@/components/patients/patient-detail-wrapper"

interface PatientDetailPageProps {
  params: Promise<{ id: string }>
}

export default async function PatientDetailPage({ params }: PatientDetailPageProps) {
  const { id } = await params
  const supabase = await createClient()

  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
    redirect("/auth/login")
  }

  // Get patient details
  const { data: patient, error: patientError } = await supabase.from("patients").select("*").eq("id", id).single()

  if (patientError || !patient) {
    redirect("/dashboard/patients")
  }

  // Get patient's appointments
  const { data: appointments, error: appointmentsError } = await supabase
    .from("appointments")
    .select(`
      *,
      doctors (
        id,
        specialty,
        first_name,
        last_name
      ),
      services (name, description)
    `)
    .eq("patient_id", id)
    .order("appointment_date", { ascending: false })


  return (
    <PatientDetailWrapper 
      patient={patient} 
      appointments={appointments || []} 
    />
  )
}
