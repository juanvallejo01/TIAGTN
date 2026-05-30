'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Search, Check, X, Clock, Eye, Loader2 } from 'lucide-react'
import { format, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { SidebarTrigger } from '@/components/ui/sidebar'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { getAppointments, updateAppointmentStatus, type AppointmentWithAthlete } from '@/app/actions/appointments'

interface SolicitudesClientProps {
  initialAppointments: AppointmentWithAthlete[]
}

const statusConfig: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  pendiente: { label: 'Pendiente', variant: 'secondary' },
  confirmada: { label: 'Confirmada', variant: 'default' },
  rechazada: { label: 'Rechazada', variant: 'destructive' },
  cancelada: { label: 'Cancelada', variant: 'outline' },
  completada: { label: 'Completada', variant: 'default' },
}

export function SolicitudesClient({ initialAppointments }: SolicitudesClientProps) {
  const router = useRouter()
  const [appointments, setAppointments] = useState(initialAppointments)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [isLoading, setIsLoading] = useState(false)
  const [selectedAppointment, setSelectedAppointment] = useState<AppointmentWithAthlete | null>(null)
  const [actionType, setActionType] = useState<'confirm' | 'reject' | 'view' | null>(null)
  const [rejectReason, setRejectReason] = useState('')

  const filteredAppointments = appointments.filter(a => {
    const matchesSearch = 
      a.athlete.nombre.toLowerCase().includes(search.toLowerCase()) ||
      a.athlete.apellido.toLowerCase().includes(search.toLowerCase()) ||
      a.athlete.cedula.includes(search) ||
      a.athlete.deporte.toLowerCase().includes(search.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || a.estado === statusFilter
    
    return matchesSearch && matchesStatus
  })

  const handleConfirm = async () => {
    if (!selectedAppointment) return
    setIsLoading(true)
    try {
      await updateAppointmentStatus(selectedAppointment.id, 'confirmada')
      const updated = await getAppointments()
      setAppointments(updated)
      setSelectedAppointment(null)
      setActionType(null)
    } catch (error) {
      console.error('Error confirming appointment:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleReject = async () => {
    if (!selectedAppointment) return
    setIsLoading(true)
    try {
      await updateAppointmentStatus(selectedAppointment.id, 'rechazada', rejectReason || undefined)
      const updated = await getAppointments()
      setAppointments(updated)
      setSelectedAppointment(null)
      setActionType(null)
      setRejectReason('')
    } catch (error) {
      console.error('Error rejecting appointment:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleComplete = async (appointment: AppointmentWithAthlete) => {
    try {
      await updateAppointmentStatus(appointment.id, 'completada')
      const updated = await getAppointments()
      setAppointments(updated)
    } catch (error) {
      console.error('Error completing appointment:', error)
    }
  }

  const openAction = (appointment: AppointmentWithAthlete, type: 'confirm' | 'reject' | 'view') => {
    setSelectedAppointment(appointment)
    setActionType(type)
    setRejectReason('')
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="border-b bg-card px-4 py-3 flex items-center gap-4">
        <SidebarTrigger />
        <div className="flex-1">
          <h1 className="font-semibold text-lg">Solicitudes de Citas</h1>
          <p className="text-sm text-muted-foreground">
            Gestiona las solicitudes de citas de los deportistas
          </p>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 p-6 space-y-6">
        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nombre, cedula o deporte..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="pendiente">Pendientes</SelectItem>
                  <SelectItem value="confirmada">Confirmadas</SelectItem>
                  <SelectItem value="rechazada">Rechazadas</SelectItem>
                  <SelectItem value="completada">Completadas</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Table */}
        <Card>
          <CardHeader>
            <CardTitle>Lista de Solicitudes ({filteredAppointments.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Deportista</TableHead>
                  <TableHead>Fecha y Hora</TableHead>
                  <TableHead>Motivo</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAppointments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      No se encontraron solicitudes
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredAppointments.map((appointment) => (
                    <TableRow key={appointment.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{appointment.athlete.nombre} {appointment.athlete.apellido}</p>
                          <p className="text-sm text-muted-foreground">{appointment.athlete.deporte}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">
                            {format(parseISO(appointment.fecha), "EEEE d 'de' MMMM", { locale: es })}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {appointment.horaInicio.slice(0, 5)} - {appointment.horaFin.slice(0, 5)}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <p className="text-sm max-w-[200px] truncate">
                          {appointment.motivo || <span className="text-muted-foreground">Sin motivo especificado</span>}
                        </p>
                      </TableCell>
                      <TableCell>
                        <Badge variant={statusConfig[appointment.estado]?.variant || 'secondary'}>
                          {statusConfig[appointment.estado]?.label || appointment.estado}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openAction(appointment, 'view')}
                            title="Ver detalles"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          {appointment.estado === 'pendiente' && (
                            <>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => openAction(appointment, 'confirm')}
                                title="Confirmar"
                                className="text-green-600 hover:text-green-700"
                              >
                                <Check className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => openAction(appointment, 'reject')}
                                title="Rechazar"
                                className="text-destructive hover:text-destructive"
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                          {appointment.estado === 'confirmada' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleComplete(appointment)}
                              title="Marcar como completada"
                            >
                              <Clock className="h-4 w-4 mr-1" />
                              Completar
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </main>

      {/* View Details Dialog */}
      <Dialog open={actionType === 'view'} onOpenChange={() => setActionType(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Detalles de la Cita</DialogTitle>
          </DialogHeader>
          {selectedAppointment && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Deportista</Label>
                  <p className="font-medium">{selectedAppointment.athlete.nombre} {selectedAppointment.athlete.apellido}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Cedula</Label>
                  <p className="font-mono">{selectedAppointment.athlete.cedula}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Deporte</Label>
                  <p>{selectedAppointment.athlete.deporte}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Estado</Label>
                  <Badge variant={statusConfig[selectedAppointment.estado]?.variant || 'secondary'}>
                    {statusConfig[selectedAppointment.estado]?.label || selectedAppointment.estado}
                  </Badge>
                </div>
                <div>
                  <Label className="text-muted-foreground">Fecha</Label>
                  <p>{format(parseISO(selectedAppointment.fecha), "EEEE d 'de' MMMM, yyyy", { locale: es })}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Hora</Label>
                  <p>{selectedAppointment.horaInicio.slice(0, 5)} - {selectedAppointment.horaFin.slice(0, 5)}</p>
                </div>
              </div>
              {selectedAppointment.motivo && (
                <div>
                  <Label className="text-muted-foreground">Motivo</Label>
                  <p>{selectedAppointment.motivo}</p>
                </div>
              )}
              {selectedAppointment.notas && (
                <div>
                  <Label className="text-muted-foreground">Notas</Label>
                  <p>{selectedAppointment.notas}</p>
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                {selectedAppointment.athlete.telefono && (
                  <div>
                    <Label className="text-muted-foreground">Telefono</Label>
                    <p>{selectedAppointment.athlete.telefono}</p>
                  </div>
                )}
                {selectedAppointment.athlete.email && (
                  <div>
                    <Label className="text-muted-foreground">Email</Label>
                    <p>{selectedAppointment.athlete.email}</p>
                  </div>
                )}
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setActionType(null)}>
              Cerrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirm Dialog */}
      <Dialog open={actionType === 'confirm'} onOpenChange={() => setActionType(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Cita</DialogTitle>
            <DialogDescription>
              Confirmar la cita de {selectedAppointment?.athlete.nombre} {selectedAppointment?.athlete.apellido} para el{' '}
              {selectedAppointment && format(parseISO(selectedAppointment.fecha), "d 'de' MMMM", { locale: es })} a las{' '}
              {selectedAppointment?.horaInicio.slice(0, 5)}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setActionType(null)}>
              Cancelar
            </Button>
            <Button onClick={handleConfirm} disabled={isLoading}>
              {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Confirmar Cita
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={actionType === 'reject'} onOpenChange={() => setActionType(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rechazar Cita</DialogTitle>
            <DialogDescription>
              Rechazar la cita de {selectedAppointment?.athlete.nombre} {selectedAppointment?.athlete.apellido}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="reason">Motivo del rechazo (opcional)</Label>
            <Textarea
              id="reason"
              placeholder="Explica brevemente el motivo del rechazo..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              rows={3}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setActionType(null)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleReject} disabled={isLoading}>
              {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Rechazar Cita
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
