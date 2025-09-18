"use client"

import { useState, useEffect, useImperativeHandle, forwardRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { createClient } from "@/lib/supabase/client"

interface Appointment {
  id: string
  appointment_date: string
  duration_minutes: number
  status: string
  notes?: string
  patients: {
    first_name: string
    last_name: string
  }
  doctors: {
    id: string
    user_id: string
    specialty: string
    first_name: string
    last_name: string
  }
  services?: {
    name: string
    price: number
  }
}

interface AppointmentListProps {
  onEditAppointment: (appointment: any) => void
}

export const AppointmentList = forwardRef<{ refresh: () => void }, AppointmentListProps>(
  ({ onEditAppointment }, ref) => {
    const [appointments, setAppointments] = useState<Appointment[]>([])
    const [filteredAppointments, setFilteredAppointments] = useState<Appointment[]>([])
    const [searchTerm, setSearchTerm] = useState("")
    const [statusFilter, setStatusFilter] = useState("all")
    const [dateFilter, setDateFilter] = useState("all")
    const [isLoading, setIsLoading] = useState(true)

    const fetchAppointments = async () => {
      const supabase = createClient()
      setIsLoading(true)

      try {
        const { data, error } = await supabase
          .from("appointments")
          .select(`
            *,
            patients (first_name, last_name),
            doctors (
              id,
              user_id,
              specialty,
              first_name,
              last_name
            ),
            services (name, price)
          `)
          .order("appointment_date", { ascending: false })

        if (error) throw error

        console.log("Appointments data received:", data)
        if (data && data.length > 0) {
          console.log("First appointment doctor data:", data[0].doctors)
        }

        setAppointments(data || [])
        setFilteredAppointments(data || [])
      } catch (error) {
        console.error("Error fetching appointments:", error)
      } finally {
        setIsLoading(false)
      }
    }

    useEffect(() => {
      fetchAppointments()
    }, [])

    useEffect(() => {
      let filtered = appointments

      // Filter by search term
      if (searchTerm) {
        filtered = filtered.filter(
          (appointment) =>
            appointment.patients.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            appointment.patients.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            appointment.doctors.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            appointment.doctors.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            appointment.services?.name.toLowerCase().includes(searchTerm.toLowerCase()),
        )
      }

      // Filter by status
      if (statusFilter !== "all") {
        filtered = filtered.filter((appointment) => appointment.status === statusFilter)
      }

      // Filter by date
      if (dateFilter !== "all") {
        const today = new Date()
        const appointmentDate = new Date()

        switch (dateFilter) {
          case "today":
            filtered = filtered.filter((appointment) => {
              const date = new Date(appointment.appointment_date)
              return date.toDateString() === today.toDateString()
            })
            break
          case "week":
            const weekFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)
            filtered = filtered.filter((appointment) => {
              const date = new Date(appointment.appointment_date)
              return date >= today && date <= weekFromNow
            })
            break
          case "month":
            const monthFromNow = new Date(today.getFullYear(), today.getMonth() + 1, today.getDate())
            filtered = filtered.filter((appointment) => {
              const date = new Date(appointment.appointment_date)
              return date >= today && date <= monthFromNow
            })
            break
        }
      }

      setFilteredAppointments(filtered)
    }, [searchTerm, statusFilter, dateFilter, appointments])

    const formatDateTime = (dateString: string) => {
      return new Date(dateString).toLocaleDateString("es-ES", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    }

    const getStatusLabel = (status: string) => {
      const labels = {
        scheduled: "Programada",
        confirmed: "Confirmada",
        in_progress: "En Progreso",
        completed: "Completada",
        cancelled: "Cancelada",
        no_show: "No Asistió",
      }
      return labels[status as keyof typeof labels] || status
    }

    const getStatusVariant = (status: string) => {
      switch (status) {
        case "completed":
          return "default"
        case "confirmed":
          return "secondary"
        case "scheduled":
          return "outline"
        case "cancelled":
        case "no_show":
          return "destructive"
        default:
          return "outline"
      }
    }

    useImperativeHandle(ref, () => ({
      refresh: fetchAppointments,
    }))

    if (isLoading) {
      return (
        <Card className="bg-card-foreground text-secondary" >
          <CardContent className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="mt-2 text-muted-foreground">Cargando citas...</p>
            </div>
          </CardContent>
        </Card>
      )
    }

    return (
      <Card className="bg-card-foreground text-secondary">
        <CardHeader>
          <CardTitle>Lista de Citas</CardTitle>
          <CardDescription className="text-secondary">Gestiona todas las citas médicas</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <Input
              placeholder="Buscar por paciente, doctor o servicio..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="sm:max-w-sm placeholder:text-muted border-secondary focus:bg-transparent focus:ring-0 focus:border-secondary" 
            />
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="sm:w-[180px] placeholder:text-muted border-secondary focus:bg-transparent focus:ring-0 focus:border-secondary">
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los estados</SelectItem>
                <SelectItem value="scheduled">Programada</SelectItem>
                <SelectItem value="confirmed">Confirmada</SelectItem>
                <SelectItem value="in_progress">En Progreso</SelectItem>
                <SelectItem value="completed">Completada</SelectItem>
                <SelectItem value="cancelled">Cancelada</SelectItem>
                <SelectItem value="no_show">No Asistió</SelectItem>
              </SelectContent>
            </Select>
            <Select value={dateFilter} onValueChange={setDateFilter}>
              <SelectTrigger className="sm:w-[180px] placeholder:text-muted border-secondary focus:bg-transparent focus:ring-0 focus:border-secondary">
                <SelectValue placeholder="Fecha" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las fechas</SelectItem>
                <SelectItem value="today">Hoy</SelectItem>
                <SelectItem value="week">Esta semana</SelectItem>
                <SelectItem value="month">Este mes</SelectItem>
              </SelectContent>
            </Select>
            <Badge variant="secondary" className="self-center">
              {filteredAppointments.length} citas
            </Badge>
          </div>

          {filteredAppointments.length === 0 ? (
            <div className="text-center py-8">
              <svg
                className="w-12 h-12 text-muted-foreground mx-auto mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <p className="text-muted-foreground">
                {searchTerm || statusFilter !== "all" || dateFilter !== "all"
                  ? "No se encontraron citas con los filtros aplicados"
                  : "No hay citas programadas"}
              </p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table className="bg-card-foreground text-secondary">
                <TableHeader >
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="text-secondary">Paciente</TableHead>
                    <TableHead className="text-secondary">Doctor</TableHead>
                    <TableHead className="text-secondary">Servicio</TableHead>
                    <TableHead className="text-secondary">Fecha y Hora</TableHead>
                    <TableHead className="text-secondary">Estado</TableHead>
                    <TableHead className="text-secondary">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAppointments.map((appointment) => (
                    <TableRow key={appointment.id} className="hover:bg-primary/10">
                      <TableCell>
                        <div className="font-medium">
                          {appointment.patients.first_name} {appointment.patients.last_name}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">
                            Dr. {appointment.doctors.first_name || 'Sin'} {appointment.doctors.last_name || 'Nombre'}
                          </div>
                         {/* <div className="text-sm text-muted">{appointment.doctors.specialty}</div> */}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          {appointment.services?.name || "Consulta General"}
                          {/* {appointment.services?.price && (
                            <div className="text-sm text-muted-foreground">${appointment.services.price}</div>
                          )} */}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div>{formatDateTime(appointment.appointment_date)}</div>
                          <div className="text-sm text-muted">{appointment.duration_minutes} min</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusVariant(appointment.status)} className="text-muted">
                          {getStatusLabel(appointment.status)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button variant="default" size="sm" onClick={() => onEditAppointment(appointment)} >
                          Editar
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    )
  },
)

AppointmentList.displayName = "AppointmentList"
