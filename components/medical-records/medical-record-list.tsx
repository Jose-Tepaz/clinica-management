"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { createClient } from "@/lib/supabase/client"
import { MedicalRecordForm } from "./medical-record-form"

interface MedicalRecord {
  id: string
  patient_id: string
  appointment_id?: string
  doctor_id: string
  diagnosis?: string
  treatment?: string
  medications?: string
  notes?: string
  record_date: string
  created_at: string
  patients: {
    first_name: string
    last_name: string
  }
  doctors: {
    first_name: string
    last_name: string
    specialty: string
  }
}

export function MedicalRecordList() {
  const [records, setRecords] = useState<MedicalRecord[]>([])
  const [filteredRecords, setFilteredRecords] = useState<MedicalRecord[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [doctorFilter, setDoctorFilter] = useState("all")
  const [isLoading, setIsLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [selectedRecord, setSelectedRecord] = useState<any>(undefined)
  const [doctors, setDoctors] = useState<any[]>([])

  const fetchRecords = async () => {
    const supabase = createClient()
    setIsLoading(true)

    try {
      const { data, error } = await supabase
        .from("medical_records")
        .select(`
          *,
          patients (first_name, last_name),
          doctors (first_name, last_name, specialty)
        `)
        .order("record_date", { ascending: false })

      if (error) throw error
      setRecords(data || [])
      setFilteredRecords(data || [])

      const uniqueDoctors = Array.from(
        new Map(
          (data || []).map((record) => [record.doctors.first_name + record.doctors.last_name, record.doctors]),
        ).values(),
      )
      setDoctors(uniqueDoctors)
    } catch (error) {
      console.error("Error fetching medical records:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchRecords()
  }, [])

  useEffect(() => {
    let filtered = records

    if (searchTerm) {
      filtered = filtered.filter(
        (record) =>
          record.patients.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          record.patients.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          record.doctors.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          record.doctors.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          record.diagnosis?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          record.treatment?.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    if (doctorFilter !== "all") {
      filtered = filtered.filter(
        (record) => `${record.doctors.first_name} ${record.doctors.last_name}` === doctorFilter,
      )
    }

    setFilteredRecords(filtered)
  }, [searchTerm, doctorFilter, records])

  const handleEditRecord = (record: MedicalRecord) => {
    setSelectedRecord(record)
    setShowForm(true)
  }

  const handleNewRecord = () => {
    setSelectedRecord(undefined)
    setShowForm(true)
  }

  const handleFormSuccess = () => {
    fetchRecords()
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-muted-foreground">Cargando registros médicos...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Registros Médicos</CardTitle>
              <CardDescription>Historial completo de consultas y tratamientos</CardDescription>
            </div>
            <Button onClick={handleNewRecord}>
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Nuevo Registro
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <Input
              placeholder="Buscar por paciente, doctor o diagnóstico..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="sm:max-w-sm"
            />
            <Select value={doctorFilter} onValueChange={setDoctorFilter}>
              <SelectTrigger className="sm:w-[200px]">
                <SelectValue placeholder="Filtrar por doctor" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los doctores</SelectItem>
                {doctors.map((doctor, index) => (
                  <SelectItem key={index} value={`${doctor.first_name} ${doctor.last_name}`}>
                    Dr. {doctor.first_name} {doctor.last_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Badge variant="secondary" className="self-center">
              {filteredRecords.length} registros
            </Badge>
          </div>

          {filteredRecords.length === 0 ? (
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
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <p className="text-muted-foreground">
                {searchTerm || doctorFilter !== "all"
                  ? "No se encontraron registros con los filtros aplicados"
                  : "No hay registros médicos"}
              </p>
              {!searchTerm && doctorFilter === "all" && (
                <Button onClick={handleNewRecord} className="mt-4">
                  Crear Primer Registro
                </Button>
              )}
            </div>
          ) : (
            <div className="grid gap-4">
              {filteredRecords.map((record) => (
                <Card key={record.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="font-semibold text-lg">
                          {record.patients.first_name} {record.patients.last_name}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          Dr. {record.doctors.first_name} {record.doctors.last_name} - {record.doctors.specialty}
                        </p>
                        <p className="text-sm text-muted-foreground">{formatDate(record.record_date)}</p>
                      </div>
                      <Button variant="outline" size="sm" onClick={() => handleEditRecord(record)}>
                        Editar
                      </Button>
                    </div>

                    <div className="space-y-3">
                      {record.diagnosis && (
                        <div>
                          <h4 className="font-medium text-sm text-muted-foreground mb-1">Diagnóstico:</h4>
                          <p className="text-sm">{record.diagnosis}</p>
                        </div>
                      )}

                      {record.treatment && (
                        <div>
                          <h4 className="font-medium text-sm text-muted-foreground mb-1">Tratamiento:</h4>
                          <p className="text-sm">{record.treatment}</p>
                        </div>
                      )}

                      {record.medications && (
                        <div>
                          <h4 className="font-medium text-sm text-muted-foreground mb-1">Medicamentos:</h4>
                          <p className="text-sm">{record.medications}</p>
                        </div>
                      )}

                      {record.notes && (
                        <div>
                          <h4 className="font-medium text-sm text-muted-foreground mb-1">Notas:</h4>
                          <p className="text-sm text-muted-foreground">{record.notes}</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <MedicalRecordForm
        record={selectedRecord}
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        onSuccess={handleFormSuccess}
      />
    </div>
  )
}
