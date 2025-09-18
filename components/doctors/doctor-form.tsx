"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { createBrowserClient } from "@supabase/ssr"
import { toast } from "@/hooks/use-toast"

interface DoctorFormProps {
  doctor?: any
  onSuccess?: () => void
  onCancel?: () => void
}

const colorOptions = [
  { value: "#3B82F6", label: "Azul", color: "#3B82F6" },
  { value: "#10B981", label: "Verde", color: "#10B981" },
  { value: "#F59E0B", label: "Amarillo", color: "#F59E0B" },
  { value: "#EF4444", label: "Rojo", color: "#EF4444" },
  { value: "#8B5CF6", label: "Púrpura", color: "#8B5CF6" },
  { value: "#06B6D4", label: "Cian", color: "#06B6D4" },
  { value: "#F97316", label: "Naranja", color: "#F97316" },
  { value: "#84CC16", label: "Lima", color: "#84CC16" },
]

export default function DoctorForm({ doctor, onSuccess, onCancel }: DoctorFormProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    first_name: doctor?.first_name || "",
    last_name: doctor?.last_name || "",
    phone: doctor?.phone || "",
    specialty: doctor?.specialty || "",
    color: doctor?.color || "#3B82F6",
  })

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        throw new Error("Usuario no autenticado")
      }

      if (doctor) {
        // Update existing doctor
        const { error } = await supabase.from("doctors").update(formData).eq("id", doctor.id)

        if (error) throw error
        toast({ title: "Doctor actualizado exitosamente" })
      } else {
        const { error } = await supabase.from("doctors").insert([
          {
            ...formData,
            user_id: user.id,
          },
        ])

        if (error) throw error
        toast({ title: "Doctor creado exitosamente" })
      }

      onSuccess?.()
    } catch (error: any) {
      console.log("[v0] Error creating/updating doctor:", error)
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto bg-card-foreground text-secondary">
      <CardHeader>
        <CardTitle>{doctor ? "Editar Doctor" : "Nuevo Doctor"}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="first_name">Nombre</Label>
              <Input
                id="first_name"
                value={formData.first_name}
                onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="last_name">Apellido</Label>
              <Input
                id="last_name"
                value={formData.last_name}
                onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Teléfono</Label>
            <Input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="555-0000"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="specialty">Especialidad</Label>
            <Input
              id="specialty"
              value={formData.specialty}
              onChange={(e) => setFormData({ ...formData, specialty: e.target.value })}
              required
              placeholder="Ej: Cardiología, Pediatría, etc."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="color">Color de Identificación</Label>
            <Select value={formData.color} onValueChange={(value) => setFormData({ ...formData, color: value })}>
              <SelectTrigger>
                <SelectValue>
                  <div className="flex items-center gap-2">
                    <div
                      className="w-4 h-4 rounded-full border border-gray-300"
                      style={{ backgroundColor: formData.color }}
                    />
                    {colorOptions.find((c) => c.value === formData.color)?.label}
                  </div>
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {colorOptions.map((color) => (
                  <SelectItem key={color.value} value={color.value}>
                    <div className="flex items-center gap-2">
                      <div
                        className="w-4 h-4 rounded-full border border-gray-300"
                        style={{ backgroundColor: color.color }}
                      />
                      {color.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? "Guardando..." : doctor ? "Actualizar" : "Crear"}
            </Button>
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancelar
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
