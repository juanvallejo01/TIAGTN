'use client'

import { useState } from 'react'
import { Plus, Edit, Trash2, ToggleLeft, ToggleRight, Loader2, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  createSchedule,
  updateSchedule,
  deleteSchedule,
  toggleScheduleStatus,
  getSchedules,
} from '@/app/actions/schedules'
import { DAYS_OF_WEEK } from '@/lib/constants'
import type { Schedule } from '@/lib/db/schema'

interface HorariosClientProps {
  initialSchedules: Schedule[]
}

export function HorariosClient({ initialSchedules }: HorariosClientProps) {
  const [schedules, setSchedules] = useState(initialSchedules)
  const [isLoading, setIsLoading] = useState(false)
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [editingSchedule, setEditingSchedule] = useState<Schedule | null>(null)
  const [deletingSchedule, setDeletingSchedule] = useState<Schedule | null>(null)
  const [formData, setFormData] = useState({
    diaSemana: '1',
    horaInicio: '08:00',
    horaFin: '09:00',
  })

  const resetForm = () => {
    setFormData({
      diaSemana: '1',
      horaInicio: '08:00',
      horaFin: '09:00',
    })
  }

  const handleAdd = async () => {
    setIsLoading(true)
    try {
      await createSchedule({
        diaSemana: parseInt(formData.diaSemana),
        horaInicio: formData.horaInicio,
        horaFin: formData.horaFin,
        activo: true,
      })
      const updated = await getSchedules()
      setSchedules(updated)
      setShowAddDialog(false)
      resetForm()
    } catch (error) {
      console.error('Error adding schedule:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleEdit = async () => {
    if (!editingSchedule) return
    setIsLoading(true)
    try {
      await updateSchedule(editingSchedule.id, {
        diaSemana: parseInt(formData.diaSemana),
        horaInicio: formData.horaInicio,
        horaFin: formData.horaFin,
      })
      const updated = await getSchedules()
      setSchedules(updated)
      setEditingSchedule(null)
      resetForm()
    } catch (error) {
      console.error('Error updating schedule:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!deletingSchedule) return
    setIsLoading(true)
    try {
      await deleteSchedule(deletingSchedule.id)
      const updated = await getSchedules()
      setSchedules(updated)
      setDeletingSchedule(null)
    } catch (error) {
      console.error('Error deleting schedule:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleToggleStatus = async (schedule: Schedule) => {
    try {
      await toggleScheduleStatus(schedule.id)
      const updated = await getSchedules()
      setSchedules(updated)
    } catch (error) {
      console.error('Error toggling status:', error)
    }
  }

  const openEditDialog = (schedule: Schedule) => {
    setFormData({
      diaSemana: schedule.diaSemana.toString(),
      horaInicio: schedule.horaInicio,
      horaFin: schedule.horaFin,
    })
    setEditingSchedule(schedule)
  }

  // Group schedules by day
  const schedulesByDay = schedules.reduce((acc, schedule) => {
    const day = schedule.diaSemana
    if (!acc[day]) acc[day] = []
    acc[day].push(schedule)
    return acc
  }, {} as Record<number, Schedule[]>)

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="border-b bg-card px-4 py-3 flex items-center gap-4">
        <SidebarTrigger />
        <div className="flex-1">
          <h1 className="font-semibold text-lg">Horarios de Atencion</h1>
          <p className="text-sm text-muted-foreground">
            Configura los horarios disponibles para citas
          </p>
        </div>
        <Button onClick={() => { resetForm(); setShowAddDialog(true) }}>
          <Plus className="h-4 w-4 mr-2" />
          Agregar Horario
        </Button>
      </header>

      {/* Content */}
      <main className="flex-1 p-6 space-y-6">
        {/* Weekly Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {DAYS_OF_WEEK.map((dayName, dayIndex) => {
            const daySchedules = schedulesByDay[dayIndex] || []
            const activeSchedules = daySchedules.filter(s => s.activo)
            
            return (
              <Card key={dayIndex} className={dayIndex === 0 || dayIndex === 6 ? 'bg-muted/50' : ''}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center justify-between">
                    {dayName}
                    <Badge variant={activeSchedules.length > 0 ? 'default' : 'secondary'}>
                      {activeSchedules.length} activos
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {daySchedules.length === 0 ? (
                    <p className="text-sm text-muted-foreground">Sin horarios</p>
                  ) : (
                    <div className="space-y-2">
                      {daySchedules.map(schedule => (
                        <div
                          key={schedule.id}
                          className={`flex items-center justify-between p-2 rounded text-sm ${
                            schedule.activo ? 'bg-primary/10' : 'bg-muted'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <Clock className="h-3 w-3 text-muted-foreground" />
                            <span className={!schedule.activo ? 'text-muted-foreground line-through' : ''}>
                              {schedule.horaInicio.slice(0, 5)} - {schedule.horaFin.slice(0, 5)}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={() => handleToggleStatus(schedule)}
                            >
                              {schedule.activo ? (
                                <ToggleRight className="h-3 w-3 text-green-600" />
                              ) : (
                                <ToggleLeft className="h-3 w-3 text-muted-foreground" />
                              )}
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={() => openEditDialog(schedule)}
                            >
                              <Edit className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={() => setDeletingSchedule(schedule)}
                            >
                              <Trash2 className="h-3 w-3 text-destructive" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Full Table */}
        <Card>
          <CardHeader>
            <CardTitle>Lista de Horarios</CardTitle>
            <CardDescription>Todos los horarios configurados</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Dia</TableHead>
                  <TableHead>Hora Inicio</TableHead>
                  <TableHead>Hora Fin</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {schedules.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      No hay horarios configurados
                    </TableCell>
                  </TableRow>
                ) : (
                  schedules.map((schedule) => (
                    <TableRow key={schedule.id}>
                      <TableCell className="font-medium">{DAYS_OF_WEEK[schedule.diaSemana]}</TableCell>
                      <TableCell>{schedule.horaInicio.slice(0, 5)}</TableCell>
                      <TableCell>{schedule.horaFin.slice(0, 5)}</TableCell>
                      <TableCell>
                        <Badge variant={schedule.activo ? 'default' : 'secondary'}>
                          {schedule.activo ? 'Activo' : 'Inactivo'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleToggleStatus(schedule)}
                          >
                            {schedule.activo ? (
                              <ToggleRight className="h-4 w-4 text-green-600" />
                            ) : (
                              <ToggleLeft className="h-4 w-4 text-muted-foreground" />
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openEditDialog(schedule)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setDeletingSchedule(schedule)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
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

      {/* Add Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Agregar Horario</DialogTitle>
            <DialogDescription>
              Configura un nuevo horario de atencion
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Dia de la Semana</Label>
              <Select value={formData.diaSemana} onValueChange={(v) => setFormData({ ...formData, diaSemana: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DAYS_OF_WEEK.map((day, index) => (
                    <SelectItem key={index} value={index.toString()}>
                      {day}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Hora de Inicio</Label>
                <Input
                  type="time"
                  value={formData.horaInicio}
                  onChange={(e) => setFormData({ ...formData, horaInicio: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Hora de Fin</Label>
                <Input
                  type="time"
                  value={formData.horaFin}
                  onChange={(e) => setFormData({ ...formData, horaFin: e.target.value })}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handleAdd} disabled={isLoading}>
              {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Agregar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={!!editingSchedule} onOpenChange={() => setEditingSchedule(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Horario</DialogTitle>
            <DialogDescription>
              Modifica el horario de atencion
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Dia de la Semana</Label>
              <Select value={formData.diaSemana} onValueChange={(v) => setFormData({ ...formData, diaSemana: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DAYS_OF_WEEK.map((day, index) => (
                    <SelectItem key={index} value={index.toString()}>
                      {day}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Hora de Inicio</Label>
                <Input
                  type="time"
                  value={formData.horaInicio}
                  onChange={(e) => setFormData({ ...formData, horaInicio: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Hora de Fin</Label>
                <Input
                  type="time"
                  value={formData.horaFin}
                  onChange={(e) => setFormData({ ...formData, horaFin: e.target.value })}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingSchedule(null)}>
              Cancelar
            </Button>
            <Button onClick={handleEdit} disabled={isLoading}>
              {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Guardar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deletingSchedule} onOpenChange={() => setDeletingSchedule(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar Horario</AlertDialogTitle>
            <AlertDialogDescription>
              Esta accion no se puede deshacer. Se eliminara el horario de{' '}
              <strong>{deletingSchedule && DAYS_OF_WEEK[deletingSchedule.diaSemana]}</strong> de{' '}
              <strong>{deletingSchedule?.horaInicio.slice(0, 5)}</strong> a{' '}
              <strong>{deletingSchedule?.horaFin.slice(0, 5)}</strong>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
