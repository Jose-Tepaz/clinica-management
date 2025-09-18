import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import DoctorList from "@/components/doctors/doctor-list"

export default async function DoctorsPage() {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
    redirect("/auth/login")
  }

  // Verificar que el usuario tenga rol de administrador
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", data.user.id).single()

  if (profile?.role !== "admin") {
    redirect("/dashboard")
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-primary">Gestión de Doctores</h1>
        <p className="text-muted">Administra la información de los doctores de la clínica</p>
      </div>
      <DoctorList />
    </div>
  )
}
