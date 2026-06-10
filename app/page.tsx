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
      <section className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 py-6 lg:py-10 grid grid-cols-1 lg:grid-cols-2 gap-5 lg:gap-12 items-center">

        {/* Logo + Título — 1.º en mobile */}
        <div className="flex flex-col items-center lg:items-start gap-3 lg:col-start-1 lg:row-start-1">
          <Image
            src="/imagenpsicologia.png"
            alt="PsicoDeporte"
            width={140}
            height={140}
            className="w-[100px] h-[100px] sm:w-[120px] sm:h-[120px] lg:w-[140px] lg:h-[140px] rounded-2xl shadow-md ring-4 ring-primary/25"
            priority
          />
          <div className="text-center lg:text-left">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-primary tracking-tight">
              PsicoDeporte
            </h1>
            <div className="h-1.5 w-16 lg:w-20 bg-accent rounded-full mt-2 lg:mt-3 mx-auto lg:mx-0" />
          </div>
        </div>

        {/* Descripción profesional — 2.º en mobile */}
        <p className="text-sm sm:text-[15px] text-foreground/70 leading-relaxed text-center lg:text-left lg:col-start-1 lg:row-start-2">
          Psicóloga del Deporte en Indervalle, comprometida con el desarrollo integral de los
          atletas a través del fortalecimiento de habilidades psicológicas que potencian el
          rendimiento deportivo y el bienestar personal. Mi trabajo se centra en procesos como
          la autorregulación emocional, la concentración, la atención selectiva, el control de
          la ansiedad competitiva, la autoconfianza y la toma de decisiones bajo presión. Me
          caracterizo por un enfoque aplicado, ético y basado en la evidencia, promoviendo
          entornos deportivos seguros y contribuyendo al crecimiento humano y competitivo de
          los deportistas.
        </p>

        {/* CTA principal — 3.º en mobile */}
        <Link
          href="/deportista"
          className="inline-flex items-center justify-center gap-2 bg-accent hover:bg-accent/85 text-accent-foreground px-7 py-4 lg:px-10 lg:py-5 rounded-2xl text-base sm:text-lg lg:text-xl font-bold shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0 w-full sm:w-fit lg:col-start-1 lg:row-start-3"
        >
          <User className="h-5 w-5 lg:h-6 lg:w-6" />
          Soy Deportista
        </Link>

        {/* Slideshow — último en mobile, col derecha rows 1-3 en desktop */}
        <div className="lg:col-start-2 lg:row-start-1 lg:row-span-3 w-full shadow-xl rounded-2xl overflow-hidden">
          <HeroSlideshow />
        </div>
      </section>

      {/* Footer */}
      <footer className="py-4 text-center text-xs text-muted-foreground border-t border-border">
        Área de Psicología Deportiva · Indervalle
      </footer>
    </main>
  )
}
