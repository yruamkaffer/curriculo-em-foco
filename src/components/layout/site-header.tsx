import Link from "next/link";
import { Focus } from "lucide-react";

export function SiteHeader() {
  return (
    <header className="border-b bg-background">
      <div className="mx-auto flex min-h-16 max-w-6xl items-center justify-between gap-4 px-5">
        <Link href="/" className="flex items-center gap-2 font-bold" aria-label="Currículo em Foco — início">
          <span className="grid size-9 place-items-center rounded-lg bg-primary text-primary-foreground"><Focus className="size-5" aria-hidden="true" /></span>
          <span>Currículo em Foco</span>
        </Link>
        <nav aria-label="Navegação principal" className="hidden gap-5 text-sm font-medium sm:flex">
          <Link className="hover:text-primary" href="/como-funciona">Como funciona</Link>
          <Link className="hover:text-primary" href="/privacidade">Privacidade</Link>
          <Link className="hover:text-primary" href="/acessibilidade">Acessibilidade</Link>
        </nav>
      </div>
    </header>
  );
}
