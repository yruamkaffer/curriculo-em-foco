import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-t bg-muted/50">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-5 py-8 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
        <p>Currículo em Foco — compatibilidade estimada, nunca promessa de contratação.</p>
        <nav aria-label="Navegação do rodapé" className="flex flex-wrap gap-4">
          <Link href="/como-funciona">Como funciona</Link><Link href="/privacidade">Privacidade</Link><Link href="/acessibilidade">Acessibilidade</Link>
        </nav>
      </div>
    </footer>
  );
}
