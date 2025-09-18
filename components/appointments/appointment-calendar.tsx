"use client"

import { useState, useEffect, useImperativeHandle, forwardRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
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
    color: string
  }
  services?: {
    name: string
  }
}

interface AppointmentCalendarProps {
  onEditAppointment: (appointment: any) => void
}

export const AppointmentCalendar = forwardRef<{ refresh: () => void }, AppointmentCalendarProps>(
  ({ onEditAppointment }, ref) => {
    const [appointments, setAppointments] = useState<Appointment[]>([])
    const [currentDate, setCurrentDate] = useState(new Date())
    const [isLoading, setIsLoading] = useState(true)

    const fetchAppointments = async (date: Date) => {
      const supabase = createClient()
      setIsLoading(true)

      try {
        const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1)
        const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0)

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
              last_name,
              color
            ),
            services (name)
          `)
          .gte("appointment_date", startOfMonth.toISOString())
          .lte("appointment_date", endOfMonth.toISOString())
          .order("appointment_date")

        if (error) throw error
        setAppointments(data || [])
      } catch (error) {
        console.error("Error fetching appointments:", error)
      } finally {
        setIsLoading(false)
      }
    }

    useEffect(() => {
      fetchAppointments(currentDate)
    }, [currentDate])

    const getDaysInMonth = (date: Date) => {
      const year = date.getFullYear()
      const month = date.getMonth()
      const firstDay = new Date(year, month, 1)
      const lastDay = new Date(year, month + 1, 0)
      const daysInMonth = lastDay.getDate()
      const startingDayOfWeek = firstDay.getDay()

      const days = []

      for (let i = 0; i < startingDayOfWeek; i++) {
        days.push(null)
      }

      for (let day = 1; day <= daysInMonth; day++) {
        days.push(new Date(year, month, day))
      }

      return days
    }

    const getAppointmentsForDay = (date: Date | null) => {
      if (!date) return []

      return appointments.filter((appointment) => {
        const appointmentDate = new Date(appointment.appointment_date)
        return appointmentDate.toDateString() === date.toDateString()
      })
    }

    const navigateMonth = (direction: "prev" | "next") => {
      setCurrentDate((prev) => {
        const newDate = new Date(prev)
        if (direction === "prev") {
          newDate.setMonth(prev.getMonth() - 1)
        } else {
          newDate.setMonth(prev.getMonth() + 1)
        }
        return newDate
      })
    }

    const formatTime = (dateString: string) => {
      return new Date(dateString).toLocaleTimeString("es-ES", {
        hour: "2-digit",
        minute: "2-digit",
      })
    }

    const getStatusColor = (status: string) => {
      switch (status) {
        case "completed":
          return "bg-green-100 text-green-800"
        case "confirmed":
          return "bg-blue-100 text-blue-800"
        case "scheduled":
          return "bg-yellow-100 text-yellow-800"
        case "cancelled":
          return "bg-red-100 text-red-800"
        case "no_show":
          return "bg-gray-100 text-gray-800"
        default:
          return "bg-gray-100 text-gray-800"
      }
    }

    const days = getDaysInMonth(currentDate)
    const monthNames = [
      "Enero",
      "Febrero",
      "Marzo",
      "Abril",
      "Mayo",
      "Junio",
      "Julio",
      "Agosto",
      "Septiembre",
      "Octubre",
      "Noviembre",
      "Diciembre",
    ]
    const dayNames = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"]

    useImperativeHandle(ref, () => ({
      refresh: () => fetchAppointments(currentDate),
    }))

    if (isLoading) {
      return (
        <Card className="bg-card-foreground text-secondary">
          <CardContent className="flex items-center justify-center h-64 bg-card-foreground text-secondary">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="mt-2 text-muted-foreground">Cargando calendario...</p>
            </div>
          </CardContent>
        </Card>
      )
    }

    return (
      <Card className="bg-card-foreground text-secondary">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </CardTitle>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" onClick={() => navigateMonth("prev")}>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </Button>
              <Button variant="outline" size="sm" onClick={() => setCurrentDate(new Date())}>
                Hoy
              </Button>
              <Button variant="outline" size="sm" onClick={() => navigateMonth("next")}>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-1 mb-4">
            {dayNames.map((day) => (
              <div key={day} className="p-2 text-center text-sm font-medium text-muted-foreground">
                {day}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {days.map((day, index) => {
              const dayAppointments = getAppointmentsForDay(day)
              const isToday = day && day.toDateString() === new Date().toDateString()

              return (
                <div
                  key={index}
                  className={`min-h-[100px] p-1 border rounded-lg ${
                    day ? "bg-background" : "bg-muted/30"
                  } ${isToday ? "ring-2 ring-primary" : ""}`}
                >
                  {day && (
                    <>
                      <div className={`text-sm font-medium mb-1 ${isToday ? "text-primary" : ""}`}>{day.getDate()}</div>
                      <div className="space-y-1">
                        {dayAppointments.slice(0, 3).map((appointment) => (
                          <div
                            key={appointment.id}
                            className={`text-xs p-1 rounded cursor-pointer hover:opacity-80 ${getStatusColor(appointment.status)}`}
                            onClick={() => onEditAppointment(appointment)}
                            style={{ borderLeft: `3px solid ${appointment.doctors.color}` }}
                          >
                            <div className="font-medium truncate">{formatTime(appointment.appointment_date)}</div>
                            <div className="truncate">
                              {appointment.patients.first_name} {appointment.patients.last_name}
                            </div>
                            <div className="truncate flex items-center gap-1">
                              <div
                                className="w-2 h-2 rounded-full flex-shrink-0"
                                style={{ backgroundColor: appointment.doctors.color }}
                              />
                              {appointment.doctors.first_name} {appointment.doctors.last_name}
                            </div>
                          </div>
                        ))}
                        {dayAppointments.length > 3 && (
                          <div className="text-xs text-muted-foreground text-center">
                            +{dayAppointments.length - 3} más
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    )
  },
)

AppointmentCalendar.displayName = "AppointmentCalendar"
