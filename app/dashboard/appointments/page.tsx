"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AppointmentForm } from "@/components/appointments/appointment-form"
import { AppointmentCalendar } from "@/components/appointments/appointment-calendar"
import { AppointmentList } from "@/components/appointments/appointment-list"

export default function AppointmentsPage() {
  const [showForm, setShowForm] = useState(false)
  const [selectedAppointment, setSelectedAppointment] = useState<any>(undefined)
  const calendarRef = useRef<{ refresh: () => void }>(null)
  const listRef = useRef<{ refresh: () => void }>(null)

  const handleEditAppointment = (appointment: any) => {
    setSelectedAppointment(appointment)
    setShowForm(true)
  }

  const handleNewAppointment = () => {
    setSelectedAppointment(undefined)
    setShowForm(true)
  }

  const handleFormSuccess = () => {
    setShowForm(false)
    calendarRef.current?.refresh()
    listRef.current?.refresh()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-primary">Citas Médicas</h1>
          <p className="text-muted">Gestiona las citas y horarios de la clínica</p>
        </div>
        <Button onClick={handleNewAppointment}>
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Nueva Cita
        </Button>
      </div>

      <Tabs defaultValue="calendar" className="space-y-4">
        <TabsList className="bg-secondary text-secondary ">
          <TabsTrigger value="calendar">Vista Calendario</TabsTrigger>
          <TabsTrigger value="list">Vista Lista</TabsTrigger>
        </TabsList>

        <TabsContent value="calendar" className="space-y-4">
          <AppointmentCalendar ref={calendarRef} onEditAppointment={handleEditAppointment} />
        </TabsContent>

        <TabsContent value="list" className="space-y-4">
          <AppointmentList ref={listRef} onEditAppointment={handleEditAppointment} />
        </TabsContent>
      </Tabs>

      <AppointmentForm
        appointment={selectedAppointment}
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        onSuccess={handleFormSuccess}
      />
    </div>
  )
}
