"use client"

import type React from "react"

import { useState, useEffect } from "react"
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
import { useRouter } from "next/navigation"

interface Patient {
  id: string
  first_name: string
  last_name: string
}

interface Doctor {
  id: string
  first_name: string
  last_name: string
  specialty: string
}

interface Appointment {
  id: string
  appointment_date: string
  patients: {
    first_name: string
    last_name: string
  } | null
}

interface AppointmentWithPatient {
  id: string
  appointment_date: string
  patients: {
    first_name: string
    last_name: string
  }
}

interface MedicalRecord {
  id?: string
  patient_id: string
  appointment_id?: string
  doctor_id: string
  diagnosis?: string
  treatment?: string
  medications?: string
  notes?: string
  record_date: string
}

interface MedicalRecordFormProps {
  record?: MedicalRecord
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  preselectedPatientId?: string
  preselectedAppointmentId?: string
}

export function MedicalRecordForm({
  record,
  isOpen,
  onClose,
  onSuccess,
  preselectedPatientId,
  preselectedAppointmentId,
}: MedicalRecordFormProps) {
  const [formData, setFormData] = useState<MedicalRecord>({
    patient_id: "",
    appointment_id: "",
    doctor_id: "",
    diagnosis: "",
    treatment: "",
    medications: "",
    notes: "",
    record_date: new Date().toISOString().split("T")[0],
  })
  const [patients, setPatients] = useState<Patient[]>([])
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [appointments, setAppointments] = useState<AppointmentWithPatient[]>([])
  const [preselectedPatientName, setPreselectedPatientName] = useState<string>("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    if (record) {
      setFormData({
        patient_id: record.patient_id,
        appointment_id: record.appointment_id || "",
        doctor_id: record.doctor_id,
        diagnosis: record.diagnosis || "",
        treatment: record.treatment || "",
        medications: record.medications || "",
        notes: record.notes || "",
        record_date: record.record_date.split("T")[0],
      })
    } else {
      setFormData((prev) => ({
        ...prev,
        patient_id: preselectedPatientId || "",
        appointment_id: preselectedAppointmentId || "",
      }))
    }
  }, [record, preselectedPatientId, preselectedAppointmentId])

  useEffect(() => {
    const fetchData = async () => {
      const supabase = createClient()

      // Fetch patients
      const { data: patientsData } = await supabase
        .from("patients")
        .select("id, first_name, last_name")
        .order("first_name")

      // Fetch doctors
      const { data: doctorsData } = await supabase
        .from("doctors")
        .select("id, first_name, last_name, specialty")
        .order("first_name")

      setPatients(patientsData || [])
      setDoctors(doctorsData || [])

      if (preselectedPatientId && patientsData) {
        const preselectedPatient = patientsData.find((p) => p.id === preselectedPatientId)
        if (preselectedPatient) {
          setPreselectedPatientName(`${preselectedPatient.first_name} ${preselectedPatient.last_name}`)
        }
      }
    }

    if (isOpen) {
      fetchData()
    }
  }, [isOpen, preselectedPatientId])

  useEffect(() => {
    const fetchAppointments = async () => {
      if (!formData.patient_id) {
        setAppointments([])
        return
      }

      const supabase = createClient()
      const { data } = await supabase
        .from("appointments")
        .select(`
          id,
          appointment_date,
          patients (first_name, last_name)
        `)
        .eq("patient_id", formData.patient_id)
        .order("appointment_date", { ascending: false })

      setAppointments((data as unknown) as AppointmentWithPatient[] || [])
    }

    fetchAppointments()
  }, [formData.patient_id])

  const handleInputChange = (field: keyof MedicalRecord, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
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

      const recordData = {
        ...formData,
        appointment_id: formData.appointment_id || null,
        record_date: new Date(formData.record_date).toISOString(),
      }

      if (record?.id) {
        // Update existing record
        const { error } = await supabase.from("medical_records").update(recordData).eq("id", record.id)

        if (error) throw error
      } else {
        // Create new record
        const { error } = await supabase.from("medical_records").insert({
          ...recordData,
          created_by: user.id,
        })

        if (error) throw error
      }

      onSuccess()
      onClose()
      router.refresh()
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "Error al guardar registro médico")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose} >
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto bg-card-foreground text-secondary">
        <DialogHeader>
          <DialogTitle>{record ? "Editar Registro Médico" : "Nuevo Registro Médico"}</DialogTitle>
          <DialogDescription>
            {record ? "Modifica la información del registro médico" : "Crea un nuevo registro médico para el paciente"}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {!preselectedPatientId ? (
              <div className="space-y-2">
                <Label htmlFor="patient_id">Paciente *</Label>
                <Select value={formData.patient_id} onValueChange={(value) => handleInputChange("patient_id", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona un paciente" />
                  </SelectTrigger>
                  <SelectContent>
                    {patients.map((patient) => (
                      <SelectItem key={patient.id} value={patient.id}>
                        {patient.first_name} {patient.last_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ) : (
              <div className="space-y-2">
                <Label>Paciente</Label>
                <div className="flex items-center h-10 px-3 py-2 border border-input rounded-md text-sm">
                  {preselectedPatientName || "Cargando..."}
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="doctor_id">Doctor *</Label>
              <Select value={formData.doctor_id} onValueChange={(value) => handleInputChange("doctor_id", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un doctor" />
                </SelectTrigger>
                <SelectContent>
                  {doctors.map((doctor) => (
                    <SelectItem key={doctor.id} value={doctor.id}>
                      Dr. {doctor.first_name} {doctor.last_name} - {doctor.specialty}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="appointment_id">Cita Relacionada (Opcional)</Label>
              <Select
                value={formData.appointment_id}
                onValueChange={(value) => handleInputChange("appointment_id", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona una cita" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Sin cita asociada</SelectItem>
                  {appointments.map((appointment) => (
                    <SelectItem key={appointment.id} value={appointment.id}>
                      {new Date(appointment.appointment_date).toLocaleDateString("es-ES", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                      {` - ${appointment.patients.first_name} ${appointment.patients.last_name}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="record_date">Fecha del Registro *</Label>
              <Input
                id="record_date"
                type="date"
                required
                value={formData.record_date}
                onChange={(e) => handleInputChange("record_date", e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="diagnosis">Diagnóstico</Label>
            <Textarea
              id="diagnosis"
              value={formData.diagnosis}
              onChange={(e) => handleInputChange("diagnosis", e.target.value)}
              rows={3}
              placeholder="Describe el diagnóstico médico..."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="treatment">Tratamiento</Label>
            <Textarea
              id="treatment"
              value={formData.treatment}
              onChange={(e) => handleInputChange("treatment", e.target.value)}
              rows={3}
              placeholder="Describe el tratamiento recomendado..."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="medications">Medicamentos</Label>
            <Textarea
              id="medications"
              value={formData.medications}
              onChange={(e) => handleInputChange("medications", e.target.value)}
              rows={2}
              placeholder="Lista de medicamentos prescritos..."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notas Adicionales</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => handleInputChange("notes", e.target.value)}
              rows={3}
              placeholder="Observaciones, recomendaciones adicionales..."
            />
          </div>

          {error && <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">{error}</div>}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Guardando..." : record ? "Actualizar" : "Crear Registro"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
