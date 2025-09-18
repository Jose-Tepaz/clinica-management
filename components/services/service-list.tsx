"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

interface Service {
  id: string
  name: string
  description?: string
  duration_minutes: number
  price: number
  created_at: string
}

export function ServiceList() {
  const [services, setServices] = useState<Service[]>([])
  const [filteredServices, setFilteredServices] = useState<Service[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [selectedService, setSelectedService] = useState<Service | undefined>()
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    duration_minutes: 30,
    price: 0,
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const fetchServices = async () => {
    const supabase = createClient()
    setIsLoading(true)

    try {
      const { data, error } = await supabase.from("services").select("*").order("name")

      if (error) throw error
      setServices(data || [])
      setFilteredServices(data || [])
    } catch (error) {
      console.error("Error fetching services:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchServices()
  }, [])

  useEffect(() => {
    if (searchTerm) {
      const filtered = services.filter(
        (service) =>
          service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          service.description?.toLowerCase().includes(searchTerm.toLowerCase()),
      )
      setFilteredServices(filtered)
    } else {
      setFilteredServices(services)
    }
  }, [searchTerm, services])

  const handleEditService = (service: Service) => {
    setSelectedService(service)
    setFormData({
      name: service.name,
      description: service.description || "",
      duration_minutes: service.duration_minutes,
      price: service.price,
    })
    setShowForm(true)
  }

  const handleNewService = () => {
    setSelectedService(undefined)
    setFormData({
      name: "",
      description: "",
      duration_minutes: 30,
      price: 0,
    })
    setShowForm(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    const supabase = createClient()

    try {
      if (selectedService?.id) {
        // Update existing service
        const { error } = await supabase.from("services").update(formData).eq("id", selectedService.id)

        if (error) throw error
      } else {
        // Create new service
        const { error } = await supabase.from("services").insert(formData)

        if (error) throw error
      }

      fetchServices()
      setShowForm(false)
      router.refresh()
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "Error al guardar servicio")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteService = async (serviceId: string) => {
    if (!confirm("¿Estás seguro de que quieres eliminar este servicio?")) {
      return
    }

    const supabase = createClient()

    try {
      const { error } = await supabase.from("services").delete().eq("id", serviceId)

      if (error) throw error
      fetchServices()
    } catch (error) {
      console.error("Error deleting service:", error)
    }
  }

  if (isLoading) {
    return (
      <Card className="bg-card-foreground text-secondary">
        <CardContent className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-muted">Cargando servicios...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <Card className="bg-card-foreground text-secondary">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Servicios Médicos</CardTitle>
              <CardDescription className="text-secondary">Gestiona los servicios disponibles en la clínica</CardDescription>
            </div>
            <Button onClick={handleNewService}>
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Nuevo Servicio
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2 mb-4">
            <Input
              placeholder="Buscar servicios..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm placeholder:text-muted border-secondary focus:bg-transparent focus:ring-0 focus:border-secondary"
            />
            <Badge variant="secondary">{filteredServices.length} servicios</Badge>
          </div>

          {filteredServices.length === 0 ? (
            <div className="text-center py-8 text-muted">
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
                  d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
                />
              </svg>
              <p className="text-muted">
                {searchTerm ? "No se encontraron servicios" : "No hay servicios registrados"}
              </p>
              {!searchTerm && (
                <Button onClick={handleNewService} className="mt-4">
                  Agregar Primer Servicio
                </Button>
              )}
            </div>
          ) : (
            <div className="rounded-md border">
              <Table className="bg-card-foreground text-secondary">
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="text-secondary">Servicio</TableHead>
                    <TableHead className="text-secondary">Duración</TableHead>
                    <TableHead className="text-secondary">Precio</TableHead>
                    <TableHead className="text-secondary">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredServices.map((service) => (
                    <TableRow key={service.id} className="hover:bg-primary/10">
                      <TableCell>
                        <div>
                          <div className="font-medium">{service.name}</div>
                          {service.description && (
                            <div className="text-sm text-muted-foreground">{service.description}</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{service.duration_minutes} min</TableCell>
                      <TableCell>${service.price}</TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button variant="outline" size="sm" onClick={() => handleEditService(service)}>
                            Editar
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteService(service.id)}
                            className="text-destructive hover:text-destructive"
                          >
                            Eliminar
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="sm:max-w-[500px] bg-card-foreground text-secondary">
          <DialogHeader>
            <DialogTitle>{selectedService ? "Editar Servicio" : "Nuevo Servicio"}</DialogTitle>
            <DialogDescription>
              {selectedService ? "Modifica la información del servicio" : "Crea un nuevo servicio médico"}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre del Servicio *</Label>
              <Input
                id="name"
                required
                value={formData.name}
                onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descripción</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="duration_minutes">Duración (minutos)</Label>
                <Input
                  id="duration_minutes"
                  type="number"
                  min="15"
                  max="240"
                  step="15"
                  required
                  value={formData.duration_minutes}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, duration_minutes: Number.parseInt(e.target.value) }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="price">Precio (Q)</Label>
                <Input
                  id="price"
                  type="number"
                  min="0"
                  step="0.01"
                  required
                  value={formData.price}
                  onChange={(e) => setFormData((prev) => ({ ...prev, price: Number.parseFloat(e.target.value) }))}
                />
              </div>
            </div>

            {error && <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">{error}</div>}

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Guardando..." : selectedService ? "Actualizar" : "Crear Servicio"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
