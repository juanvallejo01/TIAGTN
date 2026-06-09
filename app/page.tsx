import Link from 'next/link'
import Image from 'next/image'
import { Shield, User } from 'lucide-react'
import { HeroSlideshow } from '@/components/hero-slideshow'

export default function HomePage() {
  return (
    <main className="min-h-screen bg-white flex flex-col">
      {/* Acceso Psicóloga — botón discreto arriba a la derecha */}
      <header className="w-full px-6 pt-4 flex justify-end">
        <Link
          href="/admin/login"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors px-3 py-2 rounded-lg hover:bg-primary/5"
        >
          <Shield className="h-3.5 w-3.5" />
          Soy Psicóloga
        </Link>
      </header>

      {/* Hero — grid 1 columna mobile / 2 columnas desktop */}
      <section className="flex-1 w-full max-w-6xl mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">

        {/* Logo + Título */}
        <div className="flex flex-col items-center lg:items-start gap-4">
          <Image
            src="/imagenpsicologia.png"
            alt="PsicoDeporte"
            width={140}
            height={140}
            className="rounded-2xl shadow-md ring-4 ring-primary/25"
            priority
          />
          <div className="text-center lg:text-left">
            <h1 className="text-4xl sm:text-5xl font-extrabold text-primary tracking-tight">
              PsicoDeporte
            </h1>
            <div className="h-1.5 w-20 bg-accent rounded-full mt-3 mx-auto lg:mx-0" />
          </div>
        </div>

        {/* Slideshow — col derecha desktop, fila 2 mobile */}
        <div className="lg:row-span-3 w-full shadow-xl rounded-2xl overflow-hidden">
          <HeroSlideshow />
        </div>

        {/* Descripción profesional */}
        <p className="text-[15px] text-foreground/70 leading-relaxed text-center lg:text-left">
          Psicóloga del Deporte en Indervalle, comprometida con el desarrollo integral de los
          atletas a través del fortalecimiento de habilidades psicológicas que potencian el
          rendimiento deportivo y el bienestar personal. Mi trabajo se centra en procesos como
          la autorregulación emocional, la concentración, la atención selectiva, el control de
          la ansiedad competitiva, la autoconfianza y la toma de decisiones bajo presión. Me
          caracterizo por un enfoque aplicado, ético y basado en la evidencia, promoviendo
          entornos deportivos seguros y contribuyendo al crecimiento humano y competitivo de
          los deportistas.
        </p>

        {/* CTA principal — amarillo */}
        <Link
          href="/deportista"
          className="inline-flex items-center justify-center gap-3 bg-accent hover:bg-accent/85 text-accent-foreground px-10 py-5 rounded-2xl text-xl font-bold shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0 w-full sm:w-fit"
        >
          <User className="h-6 w-6" />
          Soy Deportista
        </Link>
      </section>

      {/* Footer */}
      <footer className="py-4 text-center text-xs text-muted-foreground border-t border-border">
        Área de Psicología Deportiva · Indervalle
      </footer>
    </main>
  )
}
