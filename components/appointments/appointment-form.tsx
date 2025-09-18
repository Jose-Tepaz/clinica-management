"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { createClient } from "@/lib/supabase/client"
import { useRouter, useSearchParams } from "next/navigation"
import { PatientSearch } from "@/components/patients/patient-search"

interface Patient {
  id: string
  first_name: string
  last_name: string
}

interface Doctor {
  id: string
  user_id: string
  specialty: string
  first_name: string
  last_name: string
}

interface Service {
  id: string
  name: string
  duration_minutes: number
  price: number
}

interface Appointment {
  id?: string
  patient_id: string
  doctor_id: string
  service_id?: string
  appointment_date: string
  duration_minutes: number
  status: string
  notes?: string
}

interface AppointmentFormProps {
  appointment?: Appointment
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export function AppointmentForm({ appointment, isOpen, onClose, onSuccess }: AppointmentFormProps) {
  const [formData, setFormData] = useState<Appointment>({
    patient_id: "",
    doctor_id: "",
    service_id: "",
    appointment_date: "",
    duration_minutes: 30,
    status: "scheduled",
    notes: "",
  })
  const [patients, setPatients] = useState<Patient[]>([])
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [services, setServices] = useState<Service[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const searchParams = useSearchParams()
  const isMountedRef = useRef(true)

  const fetchData = async () => {
    const supabase = createClient()

    // Fetch patients
    const { data: patientsData } = await supabase
      .from("patients")
      .select("id, first_name, last_name")
      .order("first_name")

    // Fetch doctors directly from doctors table
    const { data: doctorsData, error: doctorsError } = await supabase
      .from("doctors")
      .select("id, user_id, specialty, first_name, last_name")
      .order("first_name")

    console.log("Original form - Doctors from table:", doctorsData)
    console.log("Original form - Doctors error:", doctorsError)

    // Fetch services
    const { data: servicesData } = await supabase.from("services").select("*").order("name")

    if (isMountedRef.current) {
      setPatients(patientsData || [])
      setDoctors(doctorsData || [])
      setServices(servicesData || [])
    }
  }

  useEffect(() => {
    if (isOpen) {
      isMountedRef.current = true
      fetchData()

      if (appointment) {
        const formatDateForInput = (dateString: string) => {
          const date = new Date(dateString)
          // Obtener la fecha local sin conversión de zona horaria
          const year = date.getFullYear()
          const month = String(date.getMonth() + 1).padStart(2, '0')
          const day = String(date.getDate()).padStart(2, '0')
          const hours = String(date.getHours()).padStart(2, '0')
          const minutes = String(date.getMinutes()).padStart(2, '0')
          
          return `${year}-${month}-${day}T${hours}:${minutes}`
        }

        setFormData({
          patient_id: appointment.patient_id,
          doctor_id: appointment.doctor_id,
          service_id: appointment.service_id || "",
          appointment_date: formatDateForInput(appointment.appointment_date),
          duration_minutes: appointment.duration_minutes,
          status: appointment.status,
          notes: appointment.notes || "",
        })
      } else {
        const patientId = new URLSearchParams(window.location.search).get("patient")
        setFormData({
          patient_id: patientId || "",
          doctor_id: "",
          service_id: "",
          appointment_date: "",
          duration_minutes: 30,
          status: "scheduled",
          notes: "",
        })
      }
    }

    return () => {
      isMountedRef.current = false
    }
  }, [isOpen, appointment])

  const handleInputChange = (field: keyof Appointment, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleServiceChange = (serviceId: string) => {
    const service = services.find((s) => s.id === serviceId)
    setFormData((prev) => ({
      ...prev,
      service_id: serviceId,
      duration_minutes: service?.duration_minutes || 30,
    }))
  }

  const checkAppointmentConflict = async (
    doctorId: string,
    appointmentDate: string,
    serviceId: string,
    excludeId?: string,
  ) => {
    const supabase = createClient()

    // Convertir la fecha a objeto Date para calcular el rango
    const startTime = new Date(appointmentDate)
    const endTime = new Date(startTime.getTime() + formData.duration_minutes * 60000)

    // Buscar citas del mismo doctor en el mismo servicio que se solapen
    let query = supabase
      .from("appointments")
      .select("id, appointment_date, duration_minutes")
      .eq("doctor_id", doctorId)
      .neq("status", "cancelled") // Excluir citas canceladas
      .neq("status", "no_show") // Excluir citas donde no asistió

    // Si hay servicio, filtrar por el mismo servicio
    if (serviceId) {
      query = query.eq("service_id", serviceId)
    }

    // Si estamos editando, excluir la cita actual
    if (excludeId) {
      query = query.neq("id", excludeId)
    }

    const { data: existingAppointments, error } = await query

    if (error) throw error

    // Verificar si hay conflictos de horario
    const hasConflict = existingAppointments?.some((existing) => {
      const existingStart = new Date(existing.appointment_date)
      const existingEnd = new Date(existingStart.getTime() + existing.duration_minutes * 60000)

      // Verificar si los horarios se solapan
      return startTime < existingEnd && endTime > existingStart
    })

    return hasConflict
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    const supabase = createClient()

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) throw new Error("Usuario no autenticado")

      // Crear la fecha interpretando el input como hora local
      const appointmentDateTime = new Date(formData.appointment_date)
      
      // Para evitar problemas de zona horaria, vamos a crear la fecha manualmente
      // El input datetime-local ya viene en formato local, así que lo usamos directamente
      const localDateTime = new Date(formData.appointment_date)
      
      // Si la fecha original existe, mantener la misma zona horaria
      let isoDateTime: string
      if (appointment?.appointment_date) {
        // Para edición: mantener la zona horaria original pero cambiar la fecha/hora
        const originalDate = new Date(appointment.appointment_date)
        const newDate = new Date(formData.appointment_date)
        
        // Crear nueva fecha con la fecha/hora seleccionada pero manteniendo la zona horaria original
        isoDateTime = new Date(
          newDate.getFullYear(),
          newDate.getMonth(),
          newDate.getDate(),
          newDate.getHours(),
          newDate.getMinutes()
        ).toISOString()
      } else {
        // Para nueva cita: usar la fecha local
        isoDateTime = localDateTime.toISOString()
      }

      const hasConflict = await checkAppointmentConflict(
        formData.doctor_id,
        isoDateTime,
        formData.service_id || "",
        appointment?.id,
      )

      if (hasConflict) {
        const appointmentDate = new Date(formData.appointment_date)
        const formattedDate = appointmentDate.toLocaleDateString("es-ES", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })
        const formattedTime = appointmentDate.toLocaleTimeString("es-ES", {
          hour: "2-digit",
          minute: "2-digit",
        })

        const selectedDoctor = doctors.find((d) => d.id === formData.doctor_id)
        const selectedService = services.find((s) => s.id === formData.service_id)

        const errorMessage = `El Dr. ${selectedDoctor?.first_name} ${selectedDoctor?.last_name} ya tiene una cita programada el ${formattedDate} a las ${formattedTime}${selectedService ? ` para el servicio de ${selectedService.name}` : ""}. Por favor, selecciona otro horario.`

        throw new Error(errorMessage)
      }

      const appointmentData = {
        ...formData,
        appointment_date: isoDateTime,
      }

      if (appointment?.id) {
        const { error } = await supabase
          .from("appointments")
          .update({
            ...appointmentData,
            updated_at: new Date().toISOString(),
          })
          .eq("id", appointment.id)

        if (error) throw error
      } else {
        const { error } = await supabase.from("appointments").insert({
          ...appointmentData,
          created_by: user.id,
        })

        if (error) throw error
      }

      onSuccess()
      onClose()
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "Error al guardar cita")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose} >
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto bg-card-foreground text-secondary">
        <DialogHeader>
          <DialogTitle>{appointment ? "Editar Cita" : "Nueva Cita"}</DialogTitle>
          <DialogDescription>
            {appointment ? "Modifica los detalles de la cita" : "Programa una nueva cita médica"}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="patient_id">Paciente *</Label>
            <PatientSearch
              value={formData.patient_id}
              onSelect={(patientId) => handleInputChange("patient_id", patientId)}
              placeholder="Buscar o crear paciente..."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="doctor_id">Doctor *</Label>
            <Select value={formData.doctor_id} onValueChange={(value) => handleInputChange("doctor_id", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona un doctor" />
              </SelectTrigger>
              <SelectContent>
                {doctors.map((doctor) => (
                  <SelectItem key={doctor.id} value={doctor.id}>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-blue-500" />
                      Dr. {doctor.first_name} {doctor.last_name} - {doctor.specialty}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="service_id">Servicio</Label>
            <Select value={formData.service_id} onValueChange={handleServiceChange}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona un servicio" />
              </SelectTrigger>
              <SelectContent>
                {services.map((service) => (
                  <SelectItem key={service.id} value={service.id}>
                    {service.name} - {service.duration_minutes} min - ${service.price}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="appointment_date">Fecha y Hora *</Label>
              <Input
                id="appointment_date"
                type="datetime-local"
                required
                value={formData.appointment_date}
                onChange={(e) => handleInputChange("appointment_date", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="duration_minutes">Duración (minutos)</Label>
              <Input
                id="duration_minutes"
                type="number"
                min="15"
                max="240"
                step="15"
                value={formData.duration_minutes}
                onChange={(e) => handleInputChange("duration_minutes", Number.parseInt(e.target.value))}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Estado</Label>
            <Select value={formData.status} onValueChange={(value) => handleInputChange("status", value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="scheduled">Programada</SelectItem>
                <SelectItem value="confirmed">Confirmada</SelectItem>
                <SelectItem value="in_progress">En Progreso</SelectItem>
                <SelectItem value="completed">Completada</SelectItem>
                <SelectItem value="cancelled">Cancelada</SelectItem>
                <SelectItem value="no_show">No Asistió</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notas</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => handleInputChange("notes", e.target.value)}
              rows={3}
              placeholder="Notas adicionales sobre la cita..."
            />
          </div>

          {error && <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">{error}</div>}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Guardando..." : appointment ? "Actualizar" : "Crear Cita"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
