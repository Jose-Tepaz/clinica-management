"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
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
  id?: string
  first_name: string
  last_name: string
  email?: string
  phone?: string
  date_of_birth?: string
  address?: string
  emergency_contact_name?: string
  emergency_contact_phone?: string
  medical_notes?: string
}

interface PatientFormProps {
  patient?: Patient
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export function PatientForm({ patient, isOpen, onClose, onSuccess }: PatientFormProps) {
  const [formData, setFormData] = useState<Patient>({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    date_of_birth: "",
    address: "",
    emergency_contact_name: "",
    emergency_contact_phone: "",
    medical_notes: "",
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    if (patient) {
      setFormData({
        first_name: patient.first_name || "",
        last_name: patient.last_name || "",
        email: patient.email || "",
        phone: patient.phone || "",
        date_of_birth: patient.date_of_birth || "",
        address: patient.address || "",
        emergency_contact_name: patient.emergency_contact_name || "",
        emergency_contact_phone: patient.emergency_contact_phone || "",
        medical_notes: patient.medical_notes || "",
      })
    } else {
      // Reset form for new patient
      setFormData({
        first_name: "",
        last_name: "",
        email: "",
        phone: "",
        date_of_birth: "",
        address: "",
        emergency_contact_name: "",
        emergency_contact_phone: "",
        medical_notes: "",
      })
    }
    setError(null)
  }, [patient])

  const handleInputChange = (field: keyof Patient, value: string) => {
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

      if (patient?.id) {
        // Update existing patient
        const { error } = await supabase
          .from("patients")
          .update({
            ...formData,
            updated_at: new Date().toISOString(),
          })
          .eq("id", patient.id)

        if (error) throw error
      } else {
        // Create new patient
        const { error } = await supabase.from("patients").insert({
          ...formData,
          created_by: user.id,
        })

        if (error) throw error
      }

      onSuccess()
      onClose()
      router.refresh()
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "Error al guardar paciente")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto bg-card-foreground text-secondary">
        <DialogHeader>
          <DialogTitle>{patient ? "Editar Paciente" : "Nuevo Paciente"}</DialogTitle>
          <DialogDescription className="text-secondary">
            {patient ? "Modifica la información del paciente" : "Ingresa los datos del nuevo paciente"}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="first_name">Nombre *</Label>
              <Input
                id="first_name"
                required
                value={formData.first_name}
                onChange={(e) => handleInputChange("first_name", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="last_name">Apellido *</Label>
              <Input
                id="last_name"
                required
                value={formData.last_name}
                onChange={(e) => handleInputChange("last_name", e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">Correo Electrónico</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Teléfono</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => handleInputChange("phone", e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="date_of_birth">Fecha de Nacimiento</Label>
            <Input
              id="date_of_birth"
              type="date"
              value={formData.date_of_birth}
              onChange={(e) => handleInputChange("date_of_birth", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Dirección</Label>
            <Textarea
              id="address"
              value={formData.address}
              onChange={(e) => handleInputChange("address", e.target.value)}
              rows={2}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="emergency_contact_name">Contacto de Emergencia</Label>
              <Input
                id="emergency_contact_name"
                value={formData.emergency_contact_name}
                onChange={(e) => handleInputChange("emergency_contact_name", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="emergency_contact_phone">Teléfono de Emergencia</Label>
              <Input
                id="emergency_contact_phone"
                type="tel"
                value={formData.emergency_contact_phone}
                onChange={(e) => handleInputChange("emergency_contact_phone", e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="medical_notes">Notas Médicas</Label>
            <Textarea
              id="medical_notes"
              value={formData.medical_notes}
              onChange={(e) => handleInputChange("medical_notes", e.target.value)}
              rows={3}
              placeholder="Alergias, condiciones médicas, medicamentos actuales, etc."
            />
          </div>

          {error && <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">{error}</div>}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Guardando..." : patient ? "Actualizar" : "Crear Paciente"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
