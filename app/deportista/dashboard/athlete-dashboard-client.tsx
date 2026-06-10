'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Brain, LogOut, Calendar, Bell, Plus, Clock,
  ChevronLeft, ChevronRight, X, CheckCircle, XCircle, AlertCircle, User, Ban,
} from 'lucide-react'
import { format, addDays, startOfWeek, isSameDay, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { createAppointment } from '@/app/actions/appointments'
import { markNotificationAsRead, markAllNotificationsAsRead } from '@/app/actions/notifications'
import { DAYS_OF_WEEK } from '@/lib/constants'
import type { Athlete, Appointment, Notification, Schedule } from '@/lib/db/schema'

interface AthleteDashboardClientProps {
  athlete: Athlete
  initialAppointments: Appointment[]
  initialNotifications: Notification[]
  schedules: Schedule[]
  blockedSlots: { fecha: string; horaInicio: string }[]
}

const statusConfig: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline'; icon: React.ReactNode }> = {
  pendiente:  { label: 'Pendiente',  variant: 'secondary',    icon: <Clock className="h-3 w-3" /> },
  confirmada: { label: 'Confirmada', variant: 'default',      icon: <CheckCircle className="h-3 w-3" /> },
  rechazada:  { label: 'Rechazada',  variant: 'destructive',  icon: <XCircle className="h-3 w-3" /> },
  cancelada:  { label: 'Cancelada',  variant: 'outline',      icon: <AlertCircle className="h-3 w-3" /> },
  completada: { label: 'Completada', variant: 'default',      icon: <CheckCircle className="h-3 w-3" /> },
}

function AppointmentList({ items }: { items: Appointment[] }) {
  if (items.length === 0) {
    return (
      <p className="text-center text-muted-foreground py-8">
        No hay citas en esta categoria.
      </p>
    )
  }
  return (
    <div className="space-y-3">
      {items.map(appointment => {
        const config = statusConfig[appointment.estado] ?? statusConfig.pendiente
        return (
          <div key={appointment.id} className="flex items-center justify-between p-3 border rounded-lg">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Calendar className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-medium">
                  {format(parseISO(appointment.fecha), "EEEE d 'de' MMMM", { locale: es })}
                </p>
                <p className="text-sm text-muted-foreground">
                  {appointment.horaInicio.slice(0, 5)} – {appointment.horaFin.slice(0, 5)}
                </p>
                {appointment.motivo && (
                  <p className="text-xs text-muted-foreground mt-0.5">Motivo: {appointment.motivo}</p>
                )}
                {appointment.notas && appointment.estado === 'rechazada' && (
                  <p className="text-xs text-destructive mt-0.5">Razon: {appointment.notas}</p>
                )}
              </div>
            </div>
            <Badge variant={config.variant} className="flex items-center gap-1 shrink-0">
              {config.icon}
              {config.label}
            </Badge>
          </div>
        )
      })}
    </div>
  )
}

export function AthleteDashboardClient({
  athlete,
  initialAppointments,
  initialNotifications,
  schedules,
  blockedSlots,
}: AthleteDashboardClientProps) {
  const router = useRouter()
  const [appointments, setAppointments] = useState(initialAppointments)
  const [notifications, setNotifications] = useState(initialNotifications)
  const [currentWeekStart, setCurrentWeekStart] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }))
  const [selectedSlot, setSelectedSlot] = useState<{ date: Date; schedule: Schedule } | null>(null)
  const [motivo, setMotivo] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(currentWeekStart, i))
  const unreadCount = notifications.filter(n => !n.leida).length

  const pendingCount   = appointments.filter(a => a.estado === 'pendiente').length
  const confirmedCount = appointments.filter(a => a.estado === 'confirmada').length
  const rejectedCount  = appointments.filter(a => a.estado === 'rechazada').length

  const getSchedulesForDay = (dayIndex: number) =>
    schedules.filter(s => s.diaSemana === dayIndex)

  // Devuelve la cita ACTIVA del deportista actual en ese slot (solo pendiente o confirmada)
  const getMyActiveAppointment = (date: Date, schedule: Schedule) => {
    const dateStr = format(date, 'yyyy-MM-dd')
    return appointments.find(
      a =>
        a.fecha === dateStr &&
        a.horaInicio === schedule.horaInicio &&
        (a.estado === 'pendiente' || a.estado === 'confirmada')
    )
  }

  // Slot ocupado por OTRO deportista (pendiente o confirmada, sin contar la propia)
  const isBlockedByOther = (date: Date, schedule: Schedule) => {
    const dateStr = format(date, 'yyyy-MM-dd')
    return blockedSlots.some(s => s.fecha === dateStr && s.horaInicio === schedule.horaInicio)
  }

  const handlePrevWeek    = () => setCurrentWeekStart(addDays(currentWeekStart, -7))
  const handleNextWeek    = () => setCurrentWeekStart(addDays(currentWeekStart, 7))
  const handleCurrentWeek = () => setCurrentWeekStart(startOfWeek(new Date(), { weekStartsOn: 1 }))

  const handleSlotClick = (date: Date, schedule: Schedule) => {
    const myActive = getMyActiveAppointment(date, schedule)
    const blocked  = isBlockedByOther(date, schedule)
    if (!myActive && !blocked && date >= new Date()) {
      setSelectedSlot({ date, schedule })
      setMotivo('')
    }
  }

  const handleRequestAppointment = async () => {
    if (!selectedSlot) return
    setIsSubmitting(true)
    try {
      const created = await createAppointment({
        athleteId: athlete.id,
        fecha: format(selectedSlot.date, 'yyyy-MM-dd'),
        horaInicio: selectedSlot.schedule.horaInicio,
        horaFin: selectedSlot.schedule.horaFin,
        motivo: motivo || null,
        estado: 'pendiente',
        notas: null,
      })
      setAppointments(prev => [created, ...prev])
      setSelectedSlot(null)
      router.refresh()
    } catch (error) {
      console.error('Error creating appointment:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleMarkAsRead = async (id: number) => {
    await markNotificationAsRead(id)
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, leida: true } : n))
  }

  const handleMarkAllAsRead = async () => {
    await markAllNotificationsAsRead(athlete.id)
    setNotifications(prev => prev.map(n => ({ ...n, leida: true })))
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card sticky top-0 z-10">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Brain className="h-6 w-6 text-primary" />
            <div>
              <h1 className="font-semibold text-foreground">PsicoDeporte</h1>
              <p className="text-xs text-muted-foreground">
                {athlete.nombre} {athlete.apellido} · {athlete.deporte}
                {athlete.categoria ? ` · ${athlete.categoria}` : ''}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* Notifications */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                  <Bell className="h-5 w-5" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-destructive text-destructive-foreground text-xs flex items-center justify-center">
                      {unreadCount}
                    </span>
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle className="flex items-center justify-between">
                    Notificaciones
                    {unreadCount > 0 && (
                      <Button variant="ghost" size="sm" onClick={handleMarkAllAsRead}>
                        Marcar todas como leidas
                      </Button>
                    )}
                  </SheetTitle>
                  <SheetDescription>Tus notificaciones recientes</SheetDescription>
                </SheetHeader>
                <div className="mt-4 space-y-3">
                  {notifications.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-8">No tienes notificaciones</p>
                  ) : (
                    notifications.map(notification => (
                      <div
                        key={notification.id}
                        className={`p-3 rounded-lg border cursor-pointer ${notification.leida ? 'bg-muted/50' : 'bg-primary/5 border-primary/20'}`}
                        onClick={() => !notification.leida && handleMarkAsRead(notification.id)}
                      >
                        <p className="text-sm">{notification.mensaje}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {format(new Date(notification.createdAt), "d 'de' MMMM, HH:mm", { locale: es })}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </SheetContent>
            </Sheet>

            {/* Logout */}
            <Link href="/deportista">
              <Button variant="ghost" size="icon" title="Cerrar sesion">
                <LogOut className="h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* Profile Card */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row sm:items-start gap-4">
              <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <User className="h-7 w-7 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-xl font-semibold">{athlete.nombre} {athlete.apellido}</h2>
                <div className="flex flex-wrap gap-2 mt-1">
                  <Badge variant="secondary">{athlete.deporte}</Badge>
                  {athlete.categoria && <Badge variant="outline">{athlete.categoria}</Badge>}
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-3 text-sm">
                  <div>
                    <p className="text-muted-foreground text-xs">Cedula</p>
                    <p className="font-mono">{athlete.cedula}</p>
                  </div>
                  {athlete.telefono && (
                    <div>
                      <p className="text-muted-foreground text-xs">Telefono</p>
                      <p>{athlete.telefono}</p>
                    </div>
                  )}
                  {athlete.email && (
                    <div>
                      <p className="text-muted-foreground text-xs">Email</p>
                      <p className="truncate">{athlete.email}</p>
                    </div>
                  )}
                </div>
              </div>
              {/* Stats */}
              <div className="flex gap-6 sm:gap-4 shrink-0">
                <div className="text-center">
                  <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{pendingCount}</p>
                  <p className="text-xs text-muted-foreground">Pendientes</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400">{confirmedCount}</p>
                  <p className="text-xs text-muted-foreground">Confirmadas</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-destructive">{rejectedCount}</p>
                  <p className="text-xs text-muted-foreground">Rechazadas</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Week Navigation */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                Agenda Semanal
              </CardTitle>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="icon" onClick={handlePrevWeek}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={handleCurrentWeek}>Hoy</Button>
                <Button variant="outline" size="icon" onClick={handleNextWeek}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <CardDescription>
              {format(currentWeekStart, "d 'de' MMMM", { locale: es })} – {format(addDays(currentWeekStart, 6), "d 'de' MMMM, yyyy", { locale: es })}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
            <div className="min-w-[420px] grid grid-cols-7 gap-1.5">
              {weekDays.map((day, index) => {
                const daySchedules = getSchedulesForDay(day.getDay())
                const isToday = isSameDay(day, new Date())
                const isPast = day < new Date() && !isToday

                return (
                  <div key={index} className="space-y-2">
                    <div className={`text-center p-2 rounded-lg ${isToday ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                      <p className="text-xs font-medium">{DAYS_OF_WEEK[day.getDay()].slice(0, 3)}</p>
                      <p className="text-lg font-bold">{format(day, 'd')}</p>
                    </div>
                    <div className="space-y-1">
                      {daySchedules.length === 0 ? (
                        <p className="text-xs text-muted-foreground text-center py-2">—</p>
                      ) : (
                        daySchedules.map(schedule => {
                          const myApt      = getMyActiveAppointment(day, schedule)
                          const blocked    = !myApt && isBlockedByOther(day, schedule)
                          const canBook    = !isPast && !myApt && !blocked

                          let slotClass = ''
                          if (myApt?.estado === 'confirmada')
                            slotClass = 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 cursor-not-allowed'
                          else if (myApt?.estado === 'pendiente')
                            slotClass = 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 cursor-not-allowed'
                          else if (blocked)
                            slotClass = 'bg-muted/60 text-muted-foreground cursor-not-allowed'
                          else if (isPast)
                            slotClass = 'bg-muted/40 text-muted-foreground cursor-not-allowed'
                          else
                            slotClass = 'bg-primary/10 hover:bg-primary/20 text-primary cursor-pointer'

                          return (
                            <button
                              key={schedule.id}
                              onClick={() => canBook && handleSlotClick(day, schedule)}
                              disabled={!canBook}
                              className={`w-full p-2 rounded text-xs transition-colors ${slotClass}`}
                            >
                              {blocked ? (
                                <>
                                  <Ban className="h-3 w-3 mx-auto mb-1 opacity-50" />
                                  <span className="block opacity-60">Ocupado</span>
                                </>
                              ) : (
                                <>
                                  <Clock className="h-3 w-3 mx-auto mb-1" />
                                  <span className="block">{schedule.horaInicio.slice(0, 5)}</span>
                                  {myApt && (
                                    <Badge
                                      variant={statusConfig[myApt.estado]?.variant ?? 'secondary'}
                                      className="mt-1 text-[10px] px-1"
                                    >
                                      {statusConfig[myApt.estado]?.label ?? myApt.estado}
                                    </Badge>
                                  )}
                                </>
                              )}
                            </button>
                          )
                        })
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
            </div>
          </CardContent>
        </Card>

        {/* My Appointments with tabs */}
        <Card>
          <CardHeader>
            <CardTitle>Mis Citas</CardTitle>
            <CardDescription>Historial de tus citas y solicitudes</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="todas">
              <TabsList className="mb-4 grid w-full grid-cols-2 sm:grid-cols-4 h-auto">
                <TabsTrigger value="todas" className="text-xs sm:text-sm py-1.5">
                  Todas ({appointments.length})
                </TabsTrigger>
                <TabsTrigger value="pendiente" className="text-xs sm:text-sm py-1.5">
                  Pendientes ({pendingCount})
                </TabsTrigger>
                <TabsTrigger value="confirmada" className="text-xs sm:text-sm py-1.5">
                  Confirmadas ({confirmedCount})
                </TabsTrigger>
                <TabsTrigger value="rechazada" className="text-xs sm:text-sm py-1.5">
                  Rechazadas ({rejectedCount})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="todas">
                <AppointmentList items={appointments} />
              </TabsContent>
              <TabsContent value="pendiente">
                <AppointmentList items={appointments.filter(a => a.estado === 'pendiente')} />
              </TabsContent>
              <TabsContent value="confirmada">
                <AppointmentList items={appointments.filter(a => a.estado === 'confirmada')} />
              </TabsContent>
              <TabsContent value="rechazada">
                <AppointmentList items={appointments.filter(a => a.estado === 'rechazada')} />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </main>

      {/* Request Appointment Dialog */}
      <Dialog open={!!selectedSlot} onOpenChange={() => setSelectedSlot(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Solicitar Cita</DialogTitle>
            <DialogDescription>
              {selectedSlot && (
                <>
                  {format(selectedSlot.date, "EEEE d 'de' MMMM, yyyy", { locale: es })} a las{' '}
                  {selectedSlot.schedule.horaInicio.slice(0, 5)}
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="motivo">Motivo de la consulta (opcional)</Label>
              <Textarea
                id="motivo"
                placeholder="Describe brevemente el motivo de tu consulta..."
                value={motivo}
                onChange={(e) => setMotivo(e.target.value)}
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedSlot(null)}>
              <X className="h-4 w-4 mr-2" />
              Cancelar
            </Button>
            <Button onClick={handleRequestAppointment} disabled={isSubmitting}>
              <Plus className="h-4 w-4 mr-2" />
              {isSubmitting ? 'Enviando...' : 'Solicitar Cita'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
