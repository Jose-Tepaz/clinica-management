import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default async function DashboardPage() {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
    redirect("/auth/login")
  }

  // Get dashboard statistics
  const [
    { count: patientsCount },
    { count: appointmentsCount },
    { count: todayAppointmentsCount },
    { count: servicesCount },
  ] = await Promise.all([
    supabase.from("patients").select("*", { count: "exact", head: true }),
    supabase.from("appointments").select("*", { count: "exact", head: true }),
    supabase
      .from("appointments")
      .select("*", { count: "exact", head: true })
      .gte("appointment_date", new Date().toISOString().split("T")[0])
      .lt("appointment_date", new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split("T")[0]),
    supabase.from("services").select("*", { count: "exact", head: true }),
  ])

  // Get user profile
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", data.user.id).single()

  const getRoleLabel = (role?: string) => {
    const roles = {
      admin: "Administrador",
      doctor: "Doctor",
      nurse: "Enfermero/a",
      staff: "Personal",
    }
    return roles[role as keyof typeof roles] || "Usuario"
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-secondary">Dashboard</h1>
        <p className="text-muted">
          Bienvenido/a, {profile?.first_name} {profile?.last_name} - {getRoleLabel(profile?.role)}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-card-foreground">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-secondary">Total Pacientes</CardTitle>
            <svg className="h-4 w-4 text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-secondary">{patientsCount || 0}</div>
            <p className="text-xs text-muted">Pacientes registrados</p>
          </CardContent>
        </Card>

        <Card className="bg-card-foreground">
          <CardHeader className=" flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-secondary">Citas Hoy</CardTitle>
            <svg className="h-4 w-4 text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-secondary">{todayAppointmentsCount || 0}</div>
            <p className="text-xs text-muted">Citas programadas para hoy</p>
          </CardContent>
        </Card>

        <Card className="bg-card-foreground">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-secondary">Total Citas</CardTitle>
            <svg className="h-4 w-4 text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v6a2 2 0 002 2h6a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-secondary">{appointmentsCount || 0}</div>
            <p className="text-xs text-muted">Citas programadas</p>
          </CardContent>
        </Card>

        <Card className="bg-card-foreground">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-secondary">Servicios</CardTitle>
            <svg className="h-4 w-4 text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
              />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-secondary">{servicesCount || 0}</div>
            <p className="text-xs text-muted">Servicios disponibles</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="bg-card-foreground">
          <CardHeader>
            <CardTitle className="text-secondary">Acciones Rápidas</CardTitle>
            <CardDescription className="text-secondary">Accede rápidamente a las funciones más utilizadas</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <a
                href="/dashboard/patients"
                className="flex items-center p-3 bg-secondary rounded-lg hover:bg-secondary/20 transition-colors"
              >
                <svg className="w-5 h-5 text-primary mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                  />
                </svg>
                <span className="text-sm font-medium">Nuevo Paciente</span>
              </a>
              <a
                href="/dashboard/appointments"
                className="flex items-center p-3 bg-secondary/80 rounded-lg hover:bg-secondary/20 transition-colors"
              >
                <svg className="w-5 h-5 text-secondary mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                <span className="text-sm font-medium">Nueva Cita</span>
              </a>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card text-primary-foreground">
          <CardHeader>
            <CardTitle className="text-primary-foreground">Estado del Sistema</CardTitle>
            <CardDescription className="text-primary-foreground">Información general del sistema</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm ">Sistema</span>
                <span className="text-sm  font-medium">Operativo</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm ">Base de Datos</span>
                <span className="text-sm font-medium">Conectada</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm ">Última Actualización</span>
                <span className="text-sm">Hoy</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
