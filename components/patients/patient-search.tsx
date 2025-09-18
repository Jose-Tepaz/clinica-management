"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { createClient } from "@/lib/supabase/client"
import { Search, Plus, User } from "lucide-react"

interface Patient {
  id: string
  first_name: string
  last_name: string
  email?: string
  phone?: string
}

interface PatientSearchProps {
  value: string
  onSelect: (patientId: string) => void
  placeholder?: string
}

export function PatientSearch({ value, onSelect, placeholder = "Buscar paciente..." }: PatientSearchProps) {
  const [patients, setPatients] = useState<Patient[]>([])
  const [filteredPatients, setFilteredPatients] = useState<Patient[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isOpen, setIsOpen] = useState(false)
  const [showNewPatientForm, setShowNewPatientForm] = useState(false)
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)
  const [newPatientData, setNewPatientData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    date_of_birth: "",
    address: "",
  })
  const [isLoading, setIsLoading] = useState(false)

  const fetchPatients = useCallback(async () => {
    const supabase = createClient()
    const { data } = await supabase
      .from("patients")
      .select("id, first_name, last_name, email, phone")
      .order("first_name")

    if (data) {
      setPatients(data)
      setFilteredPatients(data)
    }
  }, [])

  useEffect(() => {
    fetchPatients()
  }, [fetchPatients])

  useEffect(() => {
    if (value && patients.length > 0) {
      const patient = patients.find((p) => p.id === value)
      if (patient && (!selectedPatient || selectedPatient.id !== patient.id)) {
        setSelectedPatient(patient)
      }
    } else if (!value && selectedPatient) {
      setSelectedPatient(null)
    }
  }, [value, patients, selectedPatient])

  useEffect(() => {
    if (patients.length === 0) return

    const filtered = patients.filter(
      (patient) =>
        `${patient.first_name} ${patient.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.phone?.includes(searchTerm),
    )
    setFilteredPatients(filtered)
  }, [searchTerm, patients])

  const handleCreatePatient = async () => {
    setIsLoading(true)
    const supabase = createClient()

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) throw new Error("Usuario no autenticado")

      const { data, error } = await supabase
        .from("patients")
        .insert({
          first_name: newPatientData.first_name,
          last_name: newPatientData.last_name,
          email: newPatientData.email,
          phone: newPatientData.phone,
          date_of_birth: newPatientData.date_of_birth,
          address: newPatientData.address,
          created_by: user.id,
        })
        .select()
        .single()

      if (error) throw error

      await fetchPatients()

      // Select the new patient
      setSelectedPatient(data)
      onSelect(data.id)

      // Reset form
      setNewPatientData({
        first_name: "",
        last_name: "",
        email: "",
        phone: "",
        date_of_birth: "",
        address: "",
      })
      setShowNewPatientForm(false)
      setIsOpen(false)
    } catch (error) {
      console.error("Error creating patient:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <div className="space-y-2 bg-card-foreground text-secondary">
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Input
              value={selectedPatient ? `${selectedPatient.first_name} ${selectedPatient.last_name}` : ""}
              placeholder={placeholder}
              onClick={() => setIsOpen(true)}
              readOnly
              className="cursor-pointer"
            />
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          </div>
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => {
              setShowNewPatientForm(true)
              setIsOpen(true)
            }}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen} >
        <DialogContent className="sm:max-w-[500px] bg-card-foreground text-secondary">
          <DialogHeader>
            <DialogTitle>{showNewPatientForm ? "Nuevo Paciente" : "Buscar Paciente"}</DialogTitle>
            <DialogDescription className="text-secondary">
              {showNewPatientForm ? "Ingresa los datos del nuevo paciente" : "Busca y selecciona un paciente existente"}
            </DialogDescription>
          </DialogHeader>

          {!showNewPatientForm ? (
            <div className="space-y-4">
              <div className="relative">
                <Input
                  placeholder="Buscar por nombre, email o teléfono..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="placeholder:text-muted border-secondary focus:bg-transparent focus:ring-0 focus:border-secondary"
                />
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              </div>

              <div className="max-h-60 overflow-y-auto space-y-2">
                {filteredPatients.length === 0 ? (
                  <div className="text-center py-4 text-muted">
                    <User className="h-8 w-8 mx-auto mb-2" />
                    <p>No se encontraron pacientes</p>
                    <Button variant="link" onClick={() => setShowNewPatientForm(true)} className="mt-2">
                      Crear nuevo paciente
                    </Button>
                  </div>
                ) : (
                  filteredPatients.map((patient) => (
                    <div
                      key={patient.id}
                      className="p-3 border rounded-lg cursor-pointer hover:bg-muted-foreground"
                      onClick={() => {
                        setSelectedPatient(patient)
                        onSelect(patient.id)
                        setIsOpen(false)
                      }}
                    >
                      <div className="font-medium">
                        {patient.first_name} {patient.last_name}
                      </div>
                      <div className="text-sm text-muted">
                        {patient.email} • {patient.phone}
                      </div>
                    </div>
                  ))
                )}
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setIsOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={() => setShowNewPatientForm(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Nuevo Paciente
                </Button>
              </DialogFooter>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="first_name">Nombre *</Label>
                  <Input
                    id="first_name"
                    required
                    value={newPatientData.first_name}
                    onChange={(e) => setNewPatientData((prev) => ({ ...prev, first_name: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="last_name">Apellido *</Label>
                  <Input
                    id="last_name"
                    required
                    value={newPatientData.last_name}
                    onChange={(e) => setNewPatientData((prev) => ({ ...prev, last_name: e.target.value }))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={newPatientData.email}
                    onChange={(e) => setNewPatientData((prev) => ({ ...prev, email: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Teléfono</Label>
                  <Input
                    id="phone"
                    value={newPatientData.phone}
                    onChange={(e) => setNewPatientData((prev) => ({ ...prev, phone: e.target.value }))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="date_of_birth">Fecha de Nacimiento</Label>
                  <Input
                    id="date_of_birth"
                    type="date"
                    value={newPatientData.date_of_birth}
                    onChange={(e) => setNewPatientData((prev) => ({ ...prev, date_of_birth: e.target.value }))}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Dirección</Label>
                <Input
                  id="address"
                  value={newPatientData.address}
                  onChange={(e) => setNewPatientData((prev) => ({ ...prev, address: e.target.value }))}
                />
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setShowNewPatientForm(false)}>
                  Volver
                </Button>
                <Button
                  onClick={handleCreatePatient}
                  disabled={isLoading || !newPatientData.first_name || !newPatientData.last_name}
                >
                  {isLoading ? "Creando..." : "Crear Paciente"}
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
