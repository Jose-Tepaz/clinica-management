"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { createBrowserClient } from "@supabase/ssr"
import { toast } from "@/hooks/use-toast"
import { Search, Plus, Edit, Trash2, Phone, User } from "lucide-react"
import DoctorForm from "./doctor-form"

export default function DoctorList() {
  const [doctors, setDoctors] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [showForm, setShowForm] = useState(false)
  const [editingDoctor, setEditingDoctor] = useState<any>(null)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )

  const fetchDoctors = async () => {
    try {
      const { data, error } = await supabase.from("doctors").select("*").order("first_name", { ascending: true })

      if (error) throw error
      setDoctors(data || [])
    } catch (error: any) {
      toast({
        title: "Error al cargar doctores",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDoctors()
  }, [])

  const handleDelete = async (id: string) => {
    if (!confirm("¿Estás seguro de que quieres eliminar este doctor?")) return

    try {
      const { error } = await supabase.from("doctors").delete().eq("id", id)

      if (error) throw error
      toast({ title: "Doctor eliminado exitosamente" })
      fetchDoctors()
    } catch (error: any) {
      toast({
        title: "Error al eliminar doctor",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  const filteredDoctors = doctors.filter(
    (doctor) =>
      `${doctor.first_name} ${doctor.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doctor.specialty.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  if (showForm || editingDoctor) {
    return (
      <DoctorForm
        doctor={editingDoctor}
        onSuccess={() => {
          setShowForm(false)
          setEditingDoctor(null)
          fetchDoctors()
        }}
        onCancel={() => {
          setShowForm(false)
          setEditingDoctor(null)
        }}
      />
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Doctores</h1>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Nuevo Doctor
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <Input
          placeholder="Buscar por nombre o especialidad..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 placeholder:text-muted border-secondary focus:bg-transparent focus:ring-0 focus:border-secondary"
        />
      </div>

      {loading ? (
        <div className="text-center py-8 text-muted">Cargando doctores...</div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredDoctors.map((doctor) => (
            <Card key={doctor.id} className="hover:shadow-md transition-shadow bg-card-foreground text-secondary">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-4 h-4 rounded-full border border-gray-300"
                      style={{ backgroundColor: doctor.color }}
                    />
                    <CardTitle className="text-lg">
                      {doctor.first_name} {doctor.last_name}
                    </CardTitle>
                  </div>
                  <div className="flex gap-1">
                    <Button size="sm" variant="ghost" onClick={() => setEditingDoctor(doctor)}>
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => handleDelete(doctor.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <Badge variant="secondary" className="w-fit">
                  {doctor.specialty}
                </Badge>

                {doctor.phone && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Phone className="w-4 h-4" />
                    {doctor.phone}
                  </div>
                )}

                {doctor.license_number && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <User className="w-4 h-4" />
                    Licencia: {doctor.license_number}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {filteredDoctors.length === 0 && !loading && (
        <div className="text-center py-8 text-gray-500">
          {searchTerm ? "No se encontraron doctores con ese criterio" : "No hay doctores registrados"}
        </div>
      )}
    </div>
  )
}
