import { headers } from 'next/headers'
import { CalendarCheck, Clock, Users, CheckCircle } from 'lucide-react'
import { auth } from '@/lib/auth'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { getAppointmentStats, getAppointments, getUpcomingAppointments } from '@/app/actions/appointments'
import { getAthletes } from '@/app/actions/athletes'
import { format, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default async function AdminDashboardPage() {
  const session = await auth.api.getSession({ headers: await headers() })
  const [stats, pendingAppointments, upcomingAppointments, athletes] = await Promise.all([
    getAppointmentStats(),
    getAppointments({ estado: 'pendiente' }),
    getUpcomingAppointments(7),
    getAthletes(),
  ])

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="border-b bg-card px-4 py-3 flex items-center gap-4">
        <SidebarTrigger />
        <div>
          <h1 className="font-semibold text-lg">Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            Bienvenida, {session?.user?.name || 'Administrador'}
          </p>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 p-6 space-y-6">
        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Citas Hoy</CardTitle>
              <CalendarCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.hoy}</div>
              <p className="text-xs text-muted-foreground">programadas para hoy</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Solicitudes Pendientes</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pendientes}</div>
              <p className="text-xs text-muted-foreground">esperando aprobacion</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Citas Confirmadas</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.confirmadas}</div>
              <p className="text-xs text-muted-foreground">total confirmadas</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Deportistas</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{athletes.length}</div>
              <p className="text-xs text-muted-foreground">registrados en el sistema</p>
            </CardContent>
          </Card>
        </div>

        {/* Two-column section */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Pending Requests */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Solicitudes Pendientes</CardTitle>
              <Link href="/admin/dashboard/solicitudes">
                <Button variant="outline" size="sm">Ver todas</Button>
              </Link>
            </CardHeader>
            <CardContent>
              {pendingAppointments.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No hay solicitudes pendientes</p>
              ) : (
                <div className="space-y-3">
                  {pendingAppointments.slice(0, 5).map((appointment) => (
                    <div key={appointment.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                          <Users className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium text-sm">
                            {appointment.athlete.nombre} {appointment.athlete.apellido}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {format(parseISO(appointment.fecha), "EEE d 'de' MMM", { locale: es })} · {appointment.horaInicio.slice(0, 5)}
                          </p>
                        </div>
                      </div>
                      <Badge variant="outline" className="shrink-0">{appointment.athlete.deporte}</Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Upcoming Confirmed Appointments */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Proximas Citas</CardTitle>
              <Link href="/admin/dashboard/calendario">
                <Button variant="outline" size="sm">Ver calendario</Button>
              </Link>
            </CardHeader>
            <CardContent>
              {upcomingAppointments.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No hay citas confirmadas proximas</p>
              ) : (
                <div className="space-y-3">
                  {upcomingAppointments.slice(0, 5).map((appointment) => (
                    <div key={appointment.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center shrink-0">
                          <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                        </div>
                        <div>
                          <p className="font-medium text-sm">
                            {appointment.athlete.nombre} {appointment.athlete.apellido}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {format(parseISO(appointment.fecha), "EEE d 'de' MMM", { locale: es })} · {appointment.horaInicio.slice(0, 5)}
                          </p>
                        </div>
                      </div>
                      <Badge variant="outline" className="shrink-0 text-green-700 border-green-300 dark:text-green-400">
                        Confirmada
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
