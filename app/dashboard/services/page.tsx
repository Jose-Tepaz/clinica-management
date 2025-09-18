import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { ServiceList } from "@/components/services/service-list"

export default async function ServicesPage() {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
    redirect("/auth/login")
  }

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", data.user.id).single()

  if (profile?.role !== "admin") {
    redirect("/dashboard")
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-primary">Gestión de Servicios</h1>
        <p className="text-muted-foreground">Administra los servicios médicos disponibles en la clínica</p>
      </div>
      <ServiceList />
    </div>
  )
}
