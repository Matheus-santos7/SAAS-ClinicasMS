// ARQUIVO TEMPORARIAMENTE DESABILITADO - DEPENDÊNCIAS EXTERNAS NÃO INSTALADAS
// TODO: Instalar dependências @schedule-x/* e corrigir tipos

/*
// src/app/(protected)/appointments/_components/calendar/schedule-x-view.tsx
'use client'

import '@schedule-x/theme-default/dist/index.css'

import {
  createCalendar, // eslint-disable-line @typescript-eslint/no-unused-vars
  viewDay,
  viewMonthGrid,
  viewWeek,
} from '@schedule-x/calendar'
import { createDragAndDropPlugin } from '@schedule-x/drag-and-drop'
import { createEventModalPlugin } from '@schedule-x/event-modal'
import { ScheduleXCalendar, useCalendarApp } from '@schedule-x/react'
import { updateAppointmentDate } from "actions/appointment/update-appointment-date"
import dayjs from 'dayjs'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

import { AppointmentWithRelations } from './agenda-view' // Reutilizamos o mesmo tipo
import { useAppointmentStore } from './appointment-store'

interface ScheduleXViewProps {
  appointments: AppointmentWithRelations[]
}

// 1. Função para mapear seus dados para o formato do Schedule-X
const mapAppointmentsToEvents = (appointments: AppointmentWithRelations[]) => {
  return appointments.map((appt) => ({
    id: appt.id,
    title: appt.patient.name,
    start: dayjs(appt.date).format('YYYY-MM-DD HH:mm'),
    end: dayjs(appt.endDate).format('YYYY-MM-DD HH:mm'),
    people: [`Dr(a). ${appt.doctor.name}`],
    calendarId: appt.doctor.specialty.toLowerCase(),
    // Vamos usar a cor do doutor para o evento!
    color: appt.doctor.color,
    // Adicionamos o appointment inteiro aqui para ter acesso no clique
    resource: appt,
  }))
}

export function ScheduleXView({ appointments }: ScheduleXViewProps) {
  const router = useRouter()
  const { onOpen } = useAppointmentStore()

  const calendarApp = useCalendarApp({
    // 2. Configurações básicas da agenda
    views: [viewWeek, viewMonthGrid, viewDay],
    defaultView: viewWeek.name,
    events: mapAppointmentsToEvents(appointments),
    plugins: [createDragAndDropPlugin(), createEventModalPlugin()],
    
    // 3. Conectando as ações com seu backend e estado
    callbacks: {
      onEventUpdate: async (updatedEvent) => {
        try {
          const result = await updateAppointmentDate({
            id: updatedEvent.id as string,
            date: dayjs(updatedEvent.start).toDate(),
            endDate: dayjs(updatedEvent.end).toDate(),
          })

          if (result.success) {
            toast.success('Agendamento atualizado com sucesso!')
            router.refresh() // Atualiza os dados da página
          } else {
            toast.error(result.error)
          }
        } catch {
          toast.error('Ocorreu um erro ao atualizar o agendamento.')
        }
      },
      onEventClick: (event) => {
        // Usamos o 'resource' que guardamos para abrir o modal com todos os dados
        onOpen(event.resource)
      },
    },
  })

  return <ScheduleXCalendar app={calendarApp} />
}
*/

// Componente temporário de placeholder
export default function ScheduleXView() {
  return (
    <div className="p-4 text-center">
      <p>Schedule-X Calendar Component - Em desenvolvimento</p>
      <p className="text-muted-foreground text-sm">
        Dependências externas necessárias: @schedule-x/*
      </p>
    </div>
  );
}
