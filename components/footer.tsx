import Link from "next/link"

export function Footer() {
  return (
    <footer className="border-t border-border bg-background py-6 px-6 transition-colors">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
        <div>© 2025 Wearly. Todos los derechos reservados.</div>
        <div className="flex gap-6">
          <Link href="/about" className="hover:text-foreground transition-colors">
            Acerca de Wearly
          </Link>
          <Link href="/contact" className="hover:text-foreground transition-colors">
            Contacto
          </Link>
          <Link href="/terms" className="hover:text-foreground transition-colors">
            Términos y Condiciones
          </Link>
        </div>
      </div>
    </footer>
  )
}
