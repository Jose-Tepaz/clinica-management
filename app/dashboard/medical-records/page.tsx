import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { MedicalRecordList } from "@/components/medical-records/medical-record-list"

export default async function MedicalRecordsPage() {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
    redirect("/auth/login")
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-primary">Historial Médico</h1>
        <p className="text-muted-foreground">Gestiona los registros médicos y consultas de los pacientes</p>
      </div>
      <MedicalRecordList />
    </div>
  )
}
