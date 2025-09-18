import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { PatientList } from "@/components/patients/patient-list"

export default async function PatientsPage() {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
    redirect("/auth/login")
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-primary">Pacientes</h1>
        <p className="text-muted-foreground">Gestiona la información de todos los pacientes de la clínica</p>
      </div>
      <PatientList />
    </div>
  )
}
