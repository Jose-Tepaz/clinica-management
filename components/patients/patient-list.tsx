"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { createClient } from "@/lib/supabase/client"
import { PatientForm } from "./patient-form"
import Link from "next/link"

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

export function PatientList() {
  const [patients, setPatients] = useState<Patient[]>([])
  const [filteredPatients, setFilteredPatients] = useState<Patient[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [selectedPatient, setSelectedPatient] = useState<Patient | undefined>()

  const fetchPatients = async () => {
    const supabase = createClient()
    setIsLoading(true)

    try {
      const { data, error } = await supabase.from("patients").select("*").order("created_at", { ascending: false })

      if (error) throw error
      setPatients(data || [])
      setFilteredPatients(data || [])
    } catch (error) {
      console.error("Error fetching patients:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchPatients()
  }, [])

  useEffect(() => {
    if (searchTerm) {
      const filtered = patients.filter(
        (patient) =>
          patient.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          patient.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          patient.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          patient.phone?.includes(searchTerm),
      )
      setFilteredPatients(filtered)
    } else {
      setFilteredPatients(patients)
    }
  }, [searchTerm, patients])

  const handleEditPatient = (patient: Patient) => {
    setSelectedPatient(patient)
    setShowForm(true)
  }

  const handleNewPatient = () => {
    setSelectedPatient(undefined)
    setShowForm(true)
  }

  const handleFormSuccess = () => {
    fetchPatients()
  }

  const calculateAge = (dateOfBirth?: string) => {
    if (!dateOfBirth) return "N/A"
    const today = new Date()
    const birthDate = new Date(dateOfBirth)
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }
    return age.toString()
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-ES")
  }

  if (isLoading) {
    return (
      <Card className="bg-card">
        <CardContent className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-muted-foreground">Cargando pacientes...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <Card className="bg-card-foreground">
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-secondary">Gestión de Pacientes</CardTitle>
              <CardDescription className="text-secondary">Administra la información de los pacientes de la clínica</CardDescription>
            </div>
            <Button onClick={handleNewPatient} className="w-full sm:w-auto mt-2 sm:mt-0">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Nuevo Paciente
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 mb-4">
            <Input
              placeholder="Buscar pacientes por nombre, email o teléfono..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ backgroundColor: "transparent" }}
              className="w-full sm:max-w-sm text-secondary shadow-none border-secondary focus:bg-transparent focus:ring-0 focus:border-secondary"
            />
            <Badge variant="secondary" className="text-primary-foreground bg-card self-center sm:self-auto">{filteredPatients.length} pacientes</Badge>
          </div>

          {filteredPatients.length === 0 ? (
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
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
              <p className="text-muted">
                {searchTerm ? "No se encontraron pacientes" : "No hay pacientes registrados"}
              </p>
              {!searchTerm && (
                <Button onClick={handleNewPatient} className="mt-4 w-full sm:w-auto">
                  Agregar Primer Paciente
                </Button>
              )}
            </div>
          ) : (
            <div className="rounded-md border">
              {/* Tabla visible en pantallas md y mayores, con overflow-auto */}
              <div className="hidden md:block">
                <div className="overflow-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="hover:bg-transparent">
                        <TableHead className="text-secondary">Nombre</TableHead>
                        <TableHead className="text-secondary">Contacto</TableHead>
                        <TableHead className="text-secondary">Edad</TableHead>
                        <TableHead className="text-secondary">Fecha de Registro</TableHead>
                        <TableHead className="text-secondary">Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredPatients.map((patient) => (
                        <TableRow
                          key={patient.id}
                          className="transition-colors hover:bg-primary/10"
                        >
                          <TableCell>
                            <div>
                              <div className="font-medium text-secondary">
                                {patient.first_name} {patient.last_name}
                              </div>
                              {patient.medical_notes && (
                                <div className="text-xs text-muted mt-1">
                                  <Badge variant="outline" className="text-xs text-secondary">
                                    Tiene notas médicas
                                  </Badge>
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm text-secondary">
                              {patient.email && <div>{patient.email}</div>}
                              {patient.phone && <div className="text-muted">{patient.phone}</div>}
                            </div>
                          </TableCell>
                          <TableCell className="text-secondary">{calculateAge(patient.date_of_birth)} años</TableCell>
                          <TableCell className="text-secondary">{formatDate(patient.created_at)}</TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <Button
                                variant="default"
                                size="sm"
                                onClick={() => handleEditPatient(patient)}
                                className="bg-primary hover:bg-primary/90 text-white"
                              >
                                Editar
                              </Button>
                              <Button
                                variant="default"
                                size="sm"
                                asChild
                                className="bg-secondary hover:bg-secondary/90 text-white"
                              >
                                <Link href={`/dashboard/patients/${patient.id}`}>Ver Historial</Link>
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
              {/* Vista tipo "cards" para móviles */}
              <div className="block md:hidden divide-y">
                {filteredPatients.map((patient) => (
                  <div key={patient.id} className="py-4 px-2 flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <div className="font-medium text-secondary text-lg">
                        {patient.first_name} {patient.last_name}
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => handleEditPatient(patient)}
                          className="bg-primary hover:bg-primary/90 text-white"
                        >
                          Editar
                        </Button>
                        <Button
                          variant="default"
                          size="sm"
                          asChild
                          className="bg-secondary hover:bg-secondary/90 text-white"
                        >
                          <Link href={`/dashboard/patients/${patient.id}`}>Ver</Link>
                        </Button>
                      </div>
                    </div>
                    <div className="text-sm text-secondary">
                      {patient.email && <div>{patient.email}</div>}
                      {patient.phone && <div className="text-muted">{patient.phone}</div>}
                    </div>
                    <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                      <span>Edad: <span className="text-secondary">{calculateAge(patient.date_of_birth)} años</span></span>
                      <span>Registrado: <span className="text-secondary">{formatDate(patient.created_at)}</span></span>
                      {patient.medical_notes && (
                        <Badge variant="outline" className="text-xs text-secondary">
                          Tiene notas médicas
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <PatientForm
        patient={selectedPatient}
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        onSuccess={handleFormSuccess}
      />
    </div>
  )
}
