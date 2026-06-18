'use client'

import { useState } from 'react'
import { Plus, Search, Edit, Trash2, ToggleLeft, ToggleRight, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
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
  createAthlete,
  updateAthlete,
  deleteAthlete,
  toggleAthleteStatus,
  getAthletes,
} from '@/app/actions/athletes'
import type { Athlete } from '@/lib/db/schema'

interface AthletesClientProps {
  initialAthletes: Athlete[]
  psychologistId: string
}

const emptyForm = {
  cedula: '',
  nombre: '',
  apellido: '',
  deporte: '',
  categoria: '',
  telefono: '',
  email: '',
}

export function AthletesClient({ initialAthletes, psychologistId }: AthletesClientProps) {
  const [athletes, setAthletes] = useState(initialAthletes)
  const [search, setSearch] = useState('')
  const [deporteFilter, setDeporteFilter] = useState('all')
  const [categoriaFilter, setCategoriaFilter] = useState('all')
  const [isLoading, setIsLoading] = useState(false)
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [editingAthlete, setEditingAthlete] = useState<Athlete | null>(null)
  const [deletingAthlete, setDeletingAthlete] = useState<Athlete | null>(null)
  const [formData, setFormData] = useState(emptyForm)

  // Unique filter options from current data
  const uniqueDeportes  = [...new Set(athletes.map(a => a.deporte).filter(Boolean))].sort()
  const uniqueCategorias = [...new Set(athletes.map(a => a.categoria).filter(Boolean))].sort()

  const filteredAthletes = athletes.filter(a => {
    const q = search.toLowerCase()
    const matchesSearch =
      a.nombre.toLowerCase().includes(q) ||
      a.apellido.toLowerCase().includes(q) ||
      a.cedula.includes(search) ||
      a.deporte.toLowerCase().includes(q) ||
      a.categoria.toLowerCase().includes(q)
    const matchesDeporte   = deporteFilter   === 'all' || a.deporte   === deporteFilter
    const matchesCategoria = categoriaFilter === 'all' || a.categoria === categoriaFilter
    return matchesSearch && matchesDeporte && matchesCategoria
  })

  const resetForm = () => setFormData(emptyForm)

  const reload = async () => {
    const updated = await getAthletes(psychologistId)
    setAthletes(updated)
  }

  const handleAdd = async () => {
    setIsLoading(true)
    try {
      await createAthlete({
        cedula: formData.cedula,
        nombre: formData.nombre,
        apellido: formData.apellido,
        deporte: formData.deporte,
        categoria: formData.categoria,
        telefono: formData.telefono || null,
        email: formData.email || null,
        activo: true,
        psychologistId,
      })
      await reload()
      setShowAddDialog(false)
      resetForm()
    } catch (error) {
      console.error('Error adding athlete:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleEdit = async () => {
    if (!editingAthlete) return
    setIsLoading(true)
    try {
      await updateAthlete(editingAthlete.id, {
        cedula: formData.cedula,
        nombre: formData.nombre,
        apellido: formData.apellido,
        deporte: formData.deporte,
        categoria: formData.categoria,
        telefono: formData.telefono || null,
        email: formData.email || null,
      })
      await reload()
      setEditingAthlete(null)
      resetForm()
    } catch (error) {
      console.error('Error updating athlete:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!deletingAthlete) return
    setIsLoading(true)
    try {
      await deleteAthlete(deletingAthlete.id)
      await reload()
      setDeletingAthlete(null)
    } catch (error) {
      console.error('Error deleting athlete:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleToggleStatus = async (athlete: Athlete) => {
    try {
      await toggleAthleteStatus(athlete.id)
      await reload()
    } catch (error) {
      console.error('Error toggling status:', error)
    }
  }

  const openEditDialog = (athlete: Athlete) => {
    setFormData({
      cedula:    athlete.cedula,
      nombre:    athlete.nombre,
      apellido:  athlete.apellido,
      deporte:   athlete.deporte,
      categoria: athlete.categoria,
      telefono:  athlete.telefono || '',
      email:     athlete.email || '',
    })
    setEditingAthlete(athlete)
  }

  const AthleteForm = () => (
    <div className="space-y-4 py-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Nombre</Label>
          <Input value={formData.nombre} onChange={e => setFormData({ ...formData, nombre: e.target.value })} placeholder="Juan" />
        </div>
        <div className="space-y-2">
          <Label>Apellido</Label>
          <Input value={formData.apellido} onChange={e => setFormData({ ...formData, apellido: e.target.value })} placeholder="Perez" />
        </div>
      </div>
      <div className="space-y-2">
        <Label>Cedula</Label>
        <Input value={formData.cedula} onChange={e => setFormData({ ...formData, cedula: e.target.value })} placeholder="12345678" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Deporte</Label>
          <Input value={formData.deporte} onChange={e => setFormData({ ...formData, deporte: e.target.value })} placeholder="Futbol" />
        </div>
        <div className="space-y-2">
          <Label>Categoria</Label>
          <Input value={formData.categoria} onChange={e => setFormData({ ...formData, categoria: e.target.value })} placeholder="Sub-17, Senior..." />
        </div>
      </div>
      <div className="space-y-2">
        <Label>Telefono (opcional)</Label>
        <Input value={formData.telefono} onChange={e => setFormData({ ...formData, telefono: e.target.value })} placeholder="0412-1234567" />
      </div>
      <div className="space-y-2">
        <Label>Email (opcional)</Label>
        <Input type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} placeholder="correo@ejemplo.com" />
      </div>
    </div>
  )

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="border-b bg-card px-4 py-3 flex items-center gap-4">
        <SidebarTrigger />
        <div className="flex-1">
          <h1 className="font-semibold text-lg">Deportistas</h1>
          <p className="text-sm text-muted-foreground">Gestiona los deportistas registrados</p>
        </div>
        <Button onClick={() => { resetForm(); setShowAddDialog(true) }}>
          <Plus className="h-4 w-4 mr-2" />
          Agregar Deportista
        </Button>
      </header>

      {/* Content */}
      <main className="flex-1 p-6 space-y-6">
        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nombre, cedula, deporte o categoria..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={deporteFilter} onValueChange={setDeporteFilter}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Deporte" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los deportes</SelectItem>
                  {uniqueDeportes.map(d => (
                    <SelectItem key={d} value={d}>{d}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={categoriaFilter} onValueChange={setCategoriaFilter}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Categoria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las categorias</SelectItem>
                  {uniqueCategorias.map(c => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Table */}
        <Card>
          <CardHeader>
            <CardTitle>Lista de Deportistas ({filteredAthletes.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Cedula</TableHead>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Deporte</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead>Contacto</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAthletes.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      No se encontraron deportistas
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredAthletes.map(athlete => (
                    <TableRow key={athlete.id}>
                      <TableCell className="font-mono">{athlete.cedula}</TableCell>
                      <TableCell>
                        <p className="font-medium">{athlete.nombre} {athlete.apellido}</p>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{athlete.deporte}</Badge>
                      </TableCell>
                      <TableCell>
                        {athlete.categoria
                          ? <Badge variant="secondary">{athlete.categoria}</Badge>
                          : <span className="text-muted-foreground text-sm">—</span>
                        }
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {athlete.telefono && <p>{athlete.telefono}</p>}
                          {athlete.email && <p className="text-muted-foreground">{athlete.email}</p>}
                          {!athlete.telefono && !athlete.email && <span className="text-muted-foreground">—</span>}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={athlete.activo ? 'default' : 'secondary'}>
                          {athlete.activo ? 'Activo' : 'Inactivo'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button variant="ghost" size="icon" onClick={() => handleToggleStatus(athlete)} title={athlete.activo ? 'Desactivar' : 'Activar'}>
                            {athlete.activo
                              ? <ToggleRight className="h-4 w-4 text-green-600" />
                              : <ToggleLeft className="h-4 w-4 text-muted-foreground" />}
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => openEditDialog(athlete)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => setDeletingAthlete(athlete)}>
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
            <DialogTitle>Agregar Deportista</DialogTitle>
            <DialogDescription>Ingresa los datos del nuevo deportista</DialogDescription>
          </DialogHeader>
          <AthleteForm />
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>Cancelar</Button>
            <Button onClick={handleAdd} disabled={isLoading}>
              {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Agregar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={!!editingAthlete} onOpenChange={() => setEditingAthlete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Deportista</DialogTitle>
            <DialogDescription>Modifica los datos del deportista</DialogDescription>
          </DialogHeader>
          <AthleteForm />
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingAthlete(null)}>Cancelar</Button>
            <Button onClick={handleEdit} disabled={isLoading}>
              {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Guardar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deletingAthlete} onOpenChange={() => setDeletingAthlete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar Deportista</AlertDialogTitle>
            <AlertDialogDescription>
              Esta accion no se puede deshacer. Se eliminara permanentemente a{' '}
              <strong>{deletingAthlete?.nombre} {deletingAthlete?.apellido}</strong> del sistema.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
