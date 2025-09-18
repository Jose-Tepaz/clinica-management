"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { createClient } from "@/lib/supabase/client"
import { MedicalRecordForm } from "@/components/medical-records/medical-record-form"
import { Plus, Eye, Edit } from "lucide-react"

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
  doctors: {
    first_name: string
    last_name: string
    specialty: string
  }
}

interface PatientMedicalRecordsProps {
  patientId: string
  patientName: string
}

export function PatientMedicalRecords({ patientId, patientName }: PatientMedicalRecordsProps) {
  const [records, setRecords] = useState<MedicalRecord[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [showEditForm, setShowEditForm] = useState(false)
  const [showViewDialog, setShowViewDialog] = useState(false)
  const [selectedRecord, setSelectedRecord] = useState<MedicalRecord | null>(null)

  const fetchRecords = async () => {
    const supabase = createClient()
    setIsLoading(true)

    try {
      const { data, error } = await supabase
        .from("medical_records")
        .select(`
          *,
          doctors (first_name, last_name, specialty)
        `)
        .eq("patient_id", patientId)
        .order("record_date", { ascending: false })

      if (error) throw error
      setRecords(data || [])
    } catch (error) {
      console.error("Error fetching medical records:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchRecords()
  }, [patientId])

  const handleViewRecord = (record: MedicalRecord) => {
    setSelectedRecord(record)
    setShowViewDialog(true)
  }

  const handleEditRecord = (record: MedicalRecord) => {
    setSelectedRecord(record)
    setShowEditForm(true)
  }

  const handleCreateRecord = () => {
    setShowCreateForm(true)
  }

  const handleFormSuccess = () => {
    fetchRecords()
    setShowCreateForm(false)
    setShowEditForm(false)
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
      <Card className="bg-card-foreground">
        <CardContent className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card className="bg-card-foreground text-secondary">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="">Registros Médicos</CardTitle>
              <CardDescription className="text-secondary">
                Historial médico de {patientName} ({records.length} registros)
              </CardDescription>
            </div>
            <Button onClick={handleCreateRecord}>
              <Plus className="w-4 h-4 mr-2" />
              Crear Registro
            </Button>
          </div>
        </CardHeader>
        <CardContent className="bg-card-foreground text-secondary">
          {records.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-12 h-12 mx-auto mb-4 text-muted-foreground">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <p className="text-muted-foreground mb-4">No hay registros médicos para este paciente</p>
              <Button onClick={handleCreateRecord}>
                <Plus className="w-4 h-4 mr-2" />
                Crear Primer Registro
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {records.map((record) => (
                <Card key={record.id} className="hover:shadow-md transition-shadow bg-card-foreground text-secondary">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="outline" className="bg-card">{formatDate(record.record_date)}</Badge>
                          <Badge variant="secondary">
                            Dr. {record.doctors.first_name} {record.doctors.last_name}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted ">{record.doctors.specialty}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => handleViewRecord(record)} className="text-primary">
                          <Eye className="w-4 h-4 mr-1" />
                          Ver
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleEditRecord(record)} className="bg-secondary">
                          <Edit className="w-4 h-4 mr-1" />
                          Editar
                        </Button>
                      </div>
                    </div>

                    {record.diagnosis && (
                      <div className="mb-2">
                        <span className="text-sm font-medium text-muted ">Diagnóstico: </span>
                        <span className="text-sm">{record.diagnosis}</span>
                      </div>
                    )}

                    {record.treatment && (
                      <div className="mb-2">
                        <span className="text-sm font-medium text-muted ">Tratamiento: </span>
                        <span className="text-sm">{record.treatment}</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* View Record Dialog */}
      <Dialog open={showViewDialog} onOpenChange={setShowViewDialog} >
        <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto bg-card-foreground text-secondary">
          <DialogHeader>
            <DialogTitle >Detalle del Registro Médico</DialogTitle>
          </DialogHeader>
          {selectedRecord && (
            <div className="space-y-4 ">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-sm text-muted mb-1">Fecha:</h4>
                  <p className="text-sm">{formatDate(selectedRecord.record_date)}</p>
                </div>
                <div>
                  <h4 className="font-medium text-sm text-muted mb-1">Doctor:</h4>
                  <p className="text-sm">
                    Dr. {selectedRecord.doctors.first_name} {selectedRecord.doctors.last_name}
                  </p>
                  <p className="text-xs text-muted">{selectedRecord.doctors.specialty}</p>
                </div>
              </div>

              {selectedRecord.diagnosis && (
                <div>
                  <h4 className="font-medium text-sm text-muted mb-2">Diagnóstico:</h4>
                  <p className="text-sm  p-3 rounded-md">{selectedRecord.diagnosis}</p>
                </div>
              )}

              {selectedRecord.treatment && (
                <div>
                  <h4 className="font-medium text-sm text-muted mb-2">Tratamiento:</h4>
                  <p className="text-sm  p-3 rounded-md">{selectedRecord.treatment}</p>
                </div>
              )}

              {selectedRecord.medications && (
                <div>
                  <h4 className="font-medium text-sm text-muted mb-2">Medicamentos:</h4>
                  <p className="text-sm  p-3 rounded-md">{selectedRecord.medications}</p>
                </div>
              )}

              {selectedRecord.notes && (
                <div>
                  <h4 className="font-medium text-sm text-muted mb-2">Notas Adicionales:</h4>
                  <p className="text-sm  p-3 rounded-md">{selectedRecord.notes}</p>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button variant="outline" onClick={() => setShowViewDialog(false)}>
                  Cerrar
                </Button>
                <Button
                  onClick={() => {
                    setShowViewDialog(false)
                    handleEditRecord(selectedRecord)
                  }}
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Editar Registro
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Create Record Form */}
      <MedicalRecordForm
        isOpen={showCreateForm}
        onClose={() => setShowCreateForm(false)}
        onSuccess={handleFormSuccess}
        preselectedPatientId={patientId}
      />

      {/* Edit Record Form */}
      <MedicalRecordForm
        record={selectedRecord || undefined}
        isOpen={showEditForm}
        onClose={() => setShowEditForm(false)}
        onSuccess={handleFormSuccess}
      />
    </>
  )
}
