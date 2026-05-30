'use client'

import { useState } from 'react'
import {
  ChevronLeft, ChevronRight, Clock, User,
} from 'lucide-react'
import {
  format, addDays, addMonths,
  startOfWeek, endOfWeek,
  startOfMonth, endOfMonth,
  eachDayOfInterval,
  isSameDay, isSameMonth, parseISO,
} from 'date-fns'
import { es } from 'date-fns/locale'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { getConfirmedAppointmentsForRange, type AppointmentWithAthlete } from '@/app/actions/appointments'
import { DAYS_OF_WEEK } from '@/lib/constants'
import type { Schedule } from '@/lib/db/schema'

type ViewMode = 'day' | 'week' | 'month'

interface CalendarioClientProps {
  initialAppointments: AppointmentWithAthlete[]
  schedules: Schedule[]
}

const APT_CLASS = 'bg-green-100 border-green-300 text-green-800 dark:bg-green-900/30 dark:border-green-700 dark:text-green-400'

// ─── helpers ────────────────────────────────────────────────────────────────

function getRange(date: Date, mode: ViewMode) {
  if (mode === 'day') {
    const s = format(date, 'yyyy-MM-dd')
    return { start: s, end: s }
  }
  if (mode === 'week') {
    const ws = startOfWeek(date, { weekStartsOn: 1 })
    return { start: format(ws, 'yyyy-MM-dd'), end: format(addDays(ws, 6), 'yyyy-MM-dd') }
  }
  // month — expand to full calendar grid
  const ms = startOfMonth(date)
  const me = endOfMonth(date)
  return {
    start: format(startOfWeek(ms, { weekStartsOn: 1 }), 'yyyy-MM-dd'),
    end:   format(endOfWeek(me,   { weekStartsOn: 1 }), 'yyyy-MM-dd'),
  }
}

function getTitle(date: Date, mode: ViewMode) {
  if (mode === 'day')   return format(date, "EEEE d 'de' MMMM, yyyy", { locale: es })
  if (mode === 'month') return format(date, 'MMMM yyyy', { locale: es })
  const ws = startOfWeek(date, { weekStartsOn: 1 })
  return `${format(ws, "d 'de' MMMM", { locale: es })} – ${format(addDays(ws, 6), "d 'de' MMMM, yyyy", { locale: es })}`
}

// ─── sub-views ───────────────────────────────────────────────────────────────

function DayView({
  date,
  schedules,
  appointments,
  onSelect,
}: {
  date: Date
  schedules: Schedule[]
  appointments: AppointmentWithAthlete[]
  onSelect: (a: AppointmentWithAthlete) => void
}) {
  const dateStr = format(date, 'yyyy-MM-dd')
  const daySlots = schedules
    .filter(s => s.diaSemana === date.getDay() && s.activo)
    .sort((a, b) => a.horaInicio.localeCompare(b.horaInicio))

  if (daySlots.length === 0) {
    return <p className="text-center text-muted-foreground py-16">No hay horarios configurados para este dia.</p>
  }

  return (
    <div className="space-y-2">
      {daySlots.map(slot => {
        const apt = appointments.find(a => a.fecha === dateStr && a.horaInicio === slot.horaInicio)
        return (
          <div key={slot.id} className="flex gap-4 items-stretch min-h-[60px]">
            <div className="w-20 flex items-center shrink-0 text-sm font-medium text-muted-foreground">
              <Clock className="h-3 w-3 mr-1" />
              {slot.horaInicio.slice(0, 5)}
            </div>
            <div className="flex-1">
              {apt ? (
                <button
                  onClick={() => onSelect(apt)}
                  className={`w-full h-full text-left p-3 rounded-lg border transition-shadow hover:shadow-md ${APT_CLASS}`}
                >
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    <span className="font-medium">{apt.athlete.nombre} {apt.athlete.apellido}</span>
                  </div>
                  <p className="text-xs mt-1 opacity-80">
                    {apt.athlete.deporte} · {slot.horaInicio.slice(0, 5)} – {slot.horaFin.slice(0, 5)}
                  </p>
                </button>
              ) : (
                <div className="h-full flex items-center border border-dashed border-muted-foreground/30 rounded-lg px-3">
                  <span className="text-sm text-muted-foreground">Disponible</span>
                </div>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}

function WeekView({
  date,
  schedules,
  appointments,
  onSelect,
}: {
  date: Date
  schedules: Schedule[]
  appointments: AppointmentWithAthlete[]
  onSelect: (a: AppointmentWithAthlete) => void
}) {
  const weekStart = startOfWeek(date, { weekStartsOn: 1 })
  const weekDays  = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))
  const timeSlots = [...new Set(schedules.map(s => s.horaInicio))].sort()

  return (
    <div className="overflow-x-auto">
      <div className="min-w-[700px]">
        {/* Day headers */}
        <div className="grid grid-cols-8 gap-2 mb-3">
          <div className="p-2 text-center text-sm font-medium text-muted-foreground">Hora</div>
          {weekDays.map((day, i) => {
            const isToday = isSameDay(day, new Date())
            return (
              <div key={i} className={`p-2 text-center rounded-lg ${isToday ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                <p className="text-xs font-medium">{DAYS_OF_WEEK[day.getDay()]}</p>
                <p className="text-lg font-bold">{format(day, 'd')}</p>
              </div>
            )
          })}
        </div>

        {timeSlots.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">No hay horarios configurados.</p>
        ) : (
          <div className="space-y-2">
            {timeSlots.map(timeSlot => (
              <div key={timeSlot} className="grid grid-cols-8 gap-2">
                <div className="p-2 text-center text-sm font-medium text-muted-foreground flex items-center justify-center">
                  <Clock className="h-3 w-3 mr-1" />
                  {timeSlot.slice(0, 5)}
                </div>
                {weekDays.map((day, di) => {
                  const hasSlot = schedules.some(
                    s => s.diaSemana === day.getDay() && s.horaInicio === timeSlot && s.activo
                  )
                  const dateStr = format(day, 'yyyy-MM-dd')
                  const slotApts = hasSlot
                    ? appointments.filter(a => a.fecha === dateStr && a.horaInicio === timeSlot)
                    : []

                  return (
                    <div
                      key={di}
                      className={`p-1 min-h-[60px] rounded border ${
                        hasSlot
                          ? 'bg-background'
                          : 'bg-muted/30 border-dashed border-muted-foreground/20'
                      }`}
                    >
                      {hasSlot && slotApts.length === 0 && (
                        <div className="h-full flex items-center justify-center text-xs text-muted-foreground">
                          Disponible
                        </div>
                      )}
                      {slotApts.map(apt => (
                        <button
                          key={apt.id}
                          onClick={() => onSelect(apt)}
                          className={`w-full p-2 rounded text-xs border transition-all hover:shadow-md ${APT_CLASS}`}
                        >
                          <div className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            <span className="truncate font-medium">
                              {apt.athlete.nombre} {apt.athlete.apellido.charAt(0)}.
                            </span>
                          </div>
                          <span className="block text-[10px] opacity-80">Confirmada</span>
                        </button>
                      ))}
                    </div>
                  )
                })}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function MonthView({
  date,
  appointments,
  onSelect,
}: {
  date: Date
  appointments: AppointmentWithAthlete[]
  onSelect: (a: AppointmentWithAthlete) => void
}) {
  const monthStart  = startOfMonth(date)
  const monthEnd    = endOfMonth(date)
  const calendarDays = eachDayOfInterval({
    start: startOfWeek(monthStart, { weekStartsOn: 1 }),
    end:   endOfWeek(monthEnd,     { weekStartsOn: 1 }),
  })

  return (
    <div>
      {/* Column headers */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map(d => (
          <div key={d} className="text-center text-xs font-medium text-muted-foreground py-2">{d}</div>
        ))}
      </div>

      {/* Day cells */}
      <div className="grid grid-cols-7 gap-1">
        {calendarDays.map((day, i) => {
          const dateStr  = format(day, 'yyyy-MM-dd')
          const dayApts  = appointments.filter(a => a.fecha === dateStr)
          const inMonth  = isSameMonth(day, date)
          const isToday  = isSameDay(day, new Date())

          return (
            <div
              key={i}
              className={`min-h-[84px] p-1 rounded-lg border transition-colors ${
                !inMonth   ? 'opacity-40 bg-muted/20' :
                isToday    ? 'bg-primary/5 border-primary/40' :
                'bg-background'
              }`}
            >
              <p className={`text-sm font-medium mb-1 w-6 h-6 flex items-center justify-center rounded-full ${isToday ? 'bg-primary text-primary-foreground' : ''}`}>
                {format(day, 'd')}
              </p>
              <div className="space-y-0.5">
                {dayApts.slice(0, 2).map(apt => (
                  <button
                    key={apt.id}
                    onClick={() => onSelect(apt)}
                    className="w-full text-left text-[10px] bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 rounded px-1 py-0.5 truncate block"
                  >
                    {apt.horaInicio.slice(0, 5)} {apt.athlete.nombre.split(' ')[0]}
                  </button>
                ))}
                {dayApts.length > 2 && (
                  <p className="text-[10px] text-muted-foreground pl-1">+{dayApts.length - 2} más</p>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── main component ──────────────────────────────────────────────────────────

export function CalendarioClient({ initialAppointments, schedules }: CalendarioClientProps) {
  const [appointments, setAppointments] = useState(initialAppointments)
  const [viewMode, setViewMode]         = useState<ViewMode>('week')
  const [currentDate, setCurrentDate]   = useState(new Date())
  const [selected, setSelected]         = useState<AppointmentWithAthlete | null>(null)
  const [isLoading, setIsLoading]       = useState(false)

  const loadData = async (date: Date, mode: ViewMode) => {
    setIsLoading(true)
    try {
      const { start, end } = getRange(date, mode)
      const data = await getConfirmedAppointmentsForRange(start, end)
      setAppointments(data)
    } catch (e) {
      console.error(e)
    } finally {
      setIsLoading(false)
    }
  }

  const handleViewChange = async (mode: string) => {
    const m = mode as ViewMode
    setViewMode(m)
    await loadData(currentDate, m)
  }

  const handleNavigate = async (direction: -1 | 0 | 1) => {
    let newDate: Date
    if (direction === 0) {
      newDate = new Date()
    } else if (viewMode === 'day') {
      newDate = addDays(currentDate, direction)
    } else if (viewMode === 'week') {
      newDate = addDays(currentDate, direction * 7)
    } else {
      newDate = addMonths(currentDate, direction)
    }
    setCurrentDate(newDate)
    await loadData(newDate, viewMode)
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* Page header */}
      <header className="border-b bg-card px-4 py-3 flex items-center gap-4">
        <SidebarTrigger />
        <div className="flex-1">
          <h1 className="font-semibold text-lg">Calendario</h1>
          <p className="text-sm text-muted-foreground">Citas confirmadas</p>
        </div>
      </header>

      <main className="flex-1 p-6">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              {/* View tabs */}
              <Tabs value={viewMode} onValueChange={handleViewChange}>
                <TabsList>
                  <TabsTrigger value="day">Dia</TabsTrigger>
                  <TabsTrigger value="week">Semana</TabsTrigger>
                  <TabsTrigger value="month">Mes</TabsTrigger>
                </TabsList>
              </Tabs>

              {/* Navigation */}
              <div className="flex items-center gap-2">
                <Button variant="outline" size="icon" onClick={() => handleNavigate(-1)} disabled={isLoading}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleNavigate(0)} disabled={isLoading}>
                  Hoy
                </Button>
                <Button variant="outline" size="icon" onClick={() => handleNavigate(1)} disabled={isLoading}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <CardTitle className="capitalize mt-1">{getTitle(currentDate, viewMode)}</CardTitle>
            {viewMode === 'week' && (
              <CardDescription>
                {format(startOfWeek(currentDate, { weekStartsOn: 1 }), "d 'de' MMMM", { locale: es })} –{' '}
                {format(addDays(startOfWeek(currentDate, { weekStartsOn: 1 }), 6), "d 'de' MMMM, yyyy", { locale: es })}
              </CardDescription>
            )}
          </CardHeader>

          <CardContent>
            {viewMode === 'day' && (
              <DayView
                date={currentDate}
                schedules={schedules}
                appointments={appointments}
                onSelect={setSelected}
              />
            )}
            {viewMode === 'week' && (
              <WeekView
                date={currentDate}
                schedules={schedules}
                appointments={appointments}
                onSelect={setSelected}
              />
            )}
            {viewMode === 'month' && (
              <MonthView
                date={currentDate}
                appointments={appointments}
                onSelect={setSelected}
              />
            )}
          </CardContent>
        </Card>
      </main>

      {/* Appointment Detail Dialog */}
      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Detalles de la Cita</DialogTitle>
            <DialogDescription>
              {selected && format(parseISO(selected.fecha), "EEEE d 'de' MMMM, yyyy", { locale: es })}
            </DialogDescription>
          </DialogHeader>
          {selected && (
            <div className="space-y-4 py-4">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-lg">
                    {selected.athlete.nombre} {selected.athlete.apellido}
                  </p>
                  <p className="text-sm text-muted-foreground">{selected.athlete.deporte}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Cedula</p>
                  <p className="font-mono">{selected.athlete.cedula}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Hora</p>
                  <p>{selected.horaInicio.slice(0, 5)} – {selected.horaFin.slice(0, 5)}</p>
                </div>
                {selected.athlete.telefono && (
                  <div>
                    <p className="text-sm text-muted-foreground">Telefono</p>
                    <p>{selected.athlete.telefono}</p>
                  </div>
                )}
                {selected.athlete.email && (
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p>{selected.athlete.email}</p>
                  </div>
                )}
              </div>
              {selected.motivo && (
                <div>
                  <p className="text-sm text-muted-foreground">Motivo</p>
                  <p>{selected.motivo}</p>
                </div>
              )}
              {selected.notas && (
                <div>
                  <p className="text-sm text-muted-foreground">Notas</p>
                  <p>{selected.notas}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
