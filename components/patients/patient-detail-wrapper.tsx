"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { PatientMedicalRecords } from "@/components/patients/patient-medical-records"
import { PatientAppointmentForm } from "@/components/appointments/patient-appointment-form"
import { useRouter } from "next/navigation"

interface Patient {
  id: string
  first_name: string
  last_name: string
  email?: string
  phone?: string
  date_of_birth?: string
  address?: string
  emergency_contact_name?: string
  emergency_contact_phone?: string
  medical_notes?: string
  created_at: string
}

interface Appointment {
  id: string
  appointment_date: string
  duration_minutes: number
  status: string
  notes?: string
  doctors: {
    id: string
    specialty: string
    first_name: string
    last_name: string
  }
  services?: {
    name: string
    description: string
  }
}

interface PatientDetailWrapperProps {
  patient: Patient
  appointments: Appointment[]
}

export function PatientDetailWrapper({ patient, appointments }: PatientDetailWrapperProps) {
  const [showAppointmentForm, setShowAppointmentForm] = useState(false)
  const router = useRouter()


  const calculateAge = (dateOfBirth?: string) => {
    if (!dateOfBirth) return "N/A"
    const today = new Date()
    const birthDate = new Date(dateOfBirth)
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }
    return age
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const handleAppointmentSuccess = () => {
    // Refrescar la página para mostrar la nueva cita
    router.refresh()
  }

  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-primary">
              {patient.first_name} {patient.last_name}
            </h1>
            <p className="text-muted">Historial médico completo</p>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" asChild className="text-primary">
              <Link href="/dashboard/patients">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Volver
              </Link>
            </Button>
            <Button onClick={() => setShowAppointmentForm(true)}>
              Nueva Cita
            </Button>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <Card className="md:col-span-1 bg-card-foreground text-secondary">
            <CardHeader>
              <CardTitle>Información Personal</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium text-muted">Edad</p>
                <p>{calculateAge(patient.date_of_birth)} años</p>
              </div>
              {patient.date_of_birth && (
                <div>
                  <p className="text-sm font-medium text-muted">Fecha de Nacimiento</p>
                  <p>{formatDate(patient.date_of_birth)}</p>
                </div>
              )}
              {patient.email && (
                <div>
                  <p className="text-sm font-medium text-muted">Email</p>
                  <p>{patient.email}</p>
                </div>
              )}
              {patient.phone && (
                <div>
                  <p className="text-sm font-medium text-muted">Teléfono</p>
                  <p>{patient.phone}</p>
                </div>
              )}
              {patient.address && (
                <div>
                  <p className="text-sm font-medium text-muted">Dirección</p>
                  <p>{patient.address}</p>
                </div>
              )}
              {patient.emergency_contact_name && (
                <div>
                  <p className="text-sm font-medium text-muted">Contacto de Emergencia</p>
                  <p>{patient.emergency_contact_name}</p>
                  {patient.emergency_contact_phone && (
                    <p className="text-sm text-muted-foreground">{patient.emergency_contact_phone}</p>
                  )}
                </div>
              )}
              {patient.medical_notes && (
                <div>
                  <p className="text-sm font-medium text-muted">Notas Médicas</p>
                  <p className="text-sm bg-muted-foreground p-3 rounded-md">{patient.medical_notes}</p>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="md:col-span-2 space-y-6">
            <Card className="bg-card-foreground text-secondary">
              <CardHeader>
                <CardTitle>Citas Recientes</CardTitle>
                <CardDescription className="text-secondary">Historial de citas médicas</CardDescription>
              </CardHeader>
              <CardContent>
                {appointments && appointments.length > 0 ? (
                  <div className="space-y-4">
                    {appointments
                      .slice(0, 5)
                      .map((appointment: any) => (
                        <div key={appointment.id} className="flex items-center justify-between p-4 border rounded-lg">
                          <div>
                            <p className="font-medium">{appointment.services?.name || "Consulta"}</p>
                            <p className="text-sm text-muted">
                              Dr. {appointment.doctors.first_name || 'Sin'} {appointment.doctors.last_name || 'Nombre'}
                            </p>
                            <p className="text-sm text-muted">{formatDateTime(appointment.appointment_date)}</p>
                          </div>
                          <Badge
                            variant={
                              appointment.status === "completed"
                                ? "default"
                                : appointment.status === "scheduled"
                                  ? "secondary"
                                  : appointment.status === "cancelled"
                                    ? "destructive"
                                    : "outline"
                            }
                          >
                            {appointment.status === "completed"
                              ? "Completada"
                              : appointment.status === "scheduled"
                                ? "Programada"
                                : appointment.status === "cancelled"
                                  ? "Cancelada"
                                  : appointment.status}
                          </Badge>
                        </div>
                      ))}
                    {appointments.length > 5 && (
                      <p className="text-sm text-muted-foreground text-center">
                        Y {appointments.length - 5} citas más...
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <svg
                      className="w-12 h-12 text-muted mx-auto mb-4"
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
                    <p className="text-muted">No hay citas registradas</p>
                    <Button className="mt-4" onClick={() => setShowAppointmentForm(true)}>
                      Programar Primera Cita
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            <PatientMedicalRecords patientId={patient.id} patientName={`${patient.first_name} ${patient.last_name}`} />
          </div>
        </div>
      </div>

      <PatientAppointmentForm
        patientId={patient.id}
        patientName={`${patient.first_name} ${patient.last_name}`}
        isOpen={showAppointmentForm}
        onClose={() => setShowAppointmentForm(false)}
        onSuccess={handleAppointmentSuccess}
      />
    </>
  )
}
