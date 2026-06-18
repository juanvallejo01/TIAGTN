'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Brain, ArrowLeft, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { getAthleteByCedula, createAthlete } from '@/app/actions/athletes'
import type { Psychologist } from '@/app/actions/users'

interface DeportistaPageClientProps {
  psychologists: Psychologist[]
}

export function DeportistaPageClient({ psychologists }: DeportistaPageClientProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const [loginCedula, setLoginCedula] = useState('')

  const [registerData, setRegisterData] = useState({
    cedula: '',
    nombre: '',
    apellido: '',
    deporte: '',
    categoria: '',
    telefono: '',
    email: '',
    psychologistId: '',
  })

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')
    try {
      const athlete = await getAthleteByCedula(loginCedula)
      if (athlete) {
        if (!athlete.activo) {
          setError('Tu cuenta esta desactivada. Contacta al administrador.')
        } else {
          router.push(`/deportista/dashboard?id=${athlete.id}`)
        }
      } else {
        setError('No se encontro un deportista con esa cedula. Por favor registrate primero.')
      }
    } catch {
      setError('Error al iniciar sesion. Intenta de nuevo.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!registerData.psychologistId) {
      setError('Debes seleccionar un psicologo.')
      return
    }
    setIsLoading(true)
    setError('')
    try {
      const existing = await getAthleteByCedula(registerData.cedula)
      if (existing) {
        setError('Ya existe un deportista con esa cedula. Intenta iniciar sesion.')
        setIsLoading(false)
        return
      }
      const athlete = await createAthlete({
        cedula: registerData.cedula,
        nombre: registerData.nombre,
        apellido: registerData.apellido,
        deporte: registerData.deporte,
        categoria: registerData.categoria,
        telefono: registerData.telefono || null,
        email: registerData.email || null,
        activo: true,
        psychologistId: registerData.psychologistId,
      })
      router.push(`/deportista/dashboard?id=${athlete.id}`)
    } catch {
      setError('Error al registrarse. Intenta de nuevo.')
    } finally {
      setIsLoading(false)
    }
  }

  const set = (field: keyof typeof registerData) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setRegisterData(prev => ({ ...prev, [field]: e.target.value }))

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4 py-8 sm:p-6 bg-gradient-to-b from-background to-muted/30">
      <div className="w-full max-w-md space-y-6">
        <Link href="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver al inicio
        </Link>

        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-2">
            <Brain className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold text-foreground">PsicoDeporte</h1>
          </div>
          <p className="text-muted-foreground">Portal del Deportista</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Acceso Deportistas</CardTitle>
            <CardDescription>
              Inicia sesion con tu cedula o registrate si eres nuevo
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Iniciar Sesion</TabsTrigger>
                <TabsTrigger value="register">Registrarse</TabsTrigger>
              </TabsList>

              {/* Login */}
              <TabsContent value="login">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-cedula">Numero de Cedula</Label>
                    <Input
                      id="login-cedula"
                      placeholder="Ej: 12345678"
                      value={loginCedula}
                      onChange={(e) => setLoginCedula(e.target.value)}
                      required
                    />
                  </div>
                  {error && <p className="text-sm text-destructive">{error}</p>}
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Ingresar
                  </Button>
                </form>
              </TabsContent>

              {/* Register */}
              <TabsContent value="register">
                <form onSubmit={handleRegister} className="space-y-4">
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="nombre">Nombre</Label>
                      <Input id="nombre" placeholder="Juan" value={registerData.nombre} onChange={set('nombre')} required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="apellido">Apellido</Label>
                      <Input id="apellido" placeholder="Perez" value={registerData.apellido} onChange={set('apellido')} required />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="register-cedula">Numero de Cedula</Label>
                    <Input id="register-cedula" placeholder="Ej: 12345678" value={registerData.cedula} onChange={set('cedula')} required />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="deporte">Deporte</Label>
                    <Input id="deporte" placeholder="Ej: Futbol, Natacion, etc." value={registerData.deporte} onChange={set('deporte')} required />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="categoria">Categoria</Label>
                    <Input id="categoria" placeholder="Ej: Sub-17, Senior, Mayores, etc." value={registerData.categoria} onChange={set('categoria')} required />
                  </div>

                  <div className="space-y-2">
                    <Label>Psicologo asignado</Label>
                    <Select
                      value={registerData.psychologistId}
                      onValueChange={(v) => setRegisterData(prev => ({ ...prev, psychologistId: v }))}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona tu psicologo..." />
                      </SelectTrigger>
                      <SelectContent>
                        {psychologists.map(p => (
                          <SelectItem key={p.id} value={p.id}>
                            {p.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="telefono">Telefono (opcional)</Label>
                    <Input id="telefono" type="tel" placeholder="Ej: 0412-1234567" value={registerData.telefono} onChange={set('telefono')} />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Correo Electronico (opcional)</Label>
                    <Input id="email" type="email" placeholder="correo@ejemplo.com" value={registerData.email} onChange={set('email')} />
                  </div>

                  {error && <p className="text-sm text-destructive">{error}</p>}

                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Registrarse
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
