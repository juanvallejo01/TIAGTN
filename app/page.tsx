import Link from 'next/link'
import { Brain, User, Shield } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-b from-background to-muted/30">
      <div className="w-full max-w-4xl space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3 mb-6">
            <Brain className="h-12 w-12 text-primary" />
            <h1 className="text-4xl font-bold tracking-tight text-foreground">
              PsicoDeporte
            </h1>
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-balance">
            Sistema de gestion de citas para el area de Psicologia Deportiva.
            Selecciona tu tipo de usuario para continuar.
          </p>
        </div>

        {/* Role Selection Cards */}
        <div className="grid md:grid-cols-2 gap-6 pt-4">
          {/* Athlete Card */}
          <Link href="/deportista">
            <Card className="group h-full cursor-pointer transition-all duration-300 hover:shadow-lg hover:border-primary/50 hover:-translate-y-1">
              <CardHeader className="text-center pb-2">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors">
                  <User className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="text-2xl">Soy Deportista</CardTitle>
                <CardDescription className="text-base">
                  Accede a tu panel para solicitar y gestionar tus citas
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <ul className="text-sm text-muted-foreground space-y-2">
                  <li>Ver horarios disponibles</li>
                  <li>Solicitar nuevas citas</li>
                  <li>Consultar el estado de tus solicitudes</li>
                  <li>Recibir notificaciones</li>
                </ul>
              </CardContent>
            </Card>
          </Link>

          {/* Admin Card */}
          <Link href="/admin/login">
            <Card className="group h-full cursor-pointer transition-all duration-300 hover:shadow-lg hover:border-primary/50 hover:-translate-y-1">
              <CardHeader className="text-center pb-2">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-accent/30 group-hover:bg-accent/50 transition-colors">
                  <Shield className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="text-2xl">Soy Psicologa</CardTitle>
                <CardDescription className="text-base">
                  Panel de administracion para gestionar citas y deportistas
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <ul className="text-sm text-muted-foreground space-y-2">
                  <li>Gestionar solicitudes de citas</li>
                  <li>Administrar deportistas</li>
                  <li>Configurar horarios de atencion</li>
                  <li>Ver calendario de citas</li>
                </ul>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-muted-foreground pt-8">
          Area de Psicologia Deportiva - Sistema de Gestion de Citas
        </p>
      </div>
    </main>
  )
}
