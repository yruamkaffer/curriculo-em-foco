import type { ReactNode } from "react";

export function InfoPage({ eyebrow, title, children }: { eyebrow: string; title: string; children: ReactNode }) {
  return (
    <main id="conteudo" className="mx-auto w-full max-w-3xl flex-1 px-5 py-14">
      <p className="font-semibold text-primary">{eyebrow}</p>
      <h1 className="mt-2 text-4xl font-bold tracking-tight">{title}</h1>
      <div className="mt-8 space-y-6 text-base leading-8 text-muted-foreground [&_h2]:pt-3 [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:text-foreground [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-6">{children}</div>
    </main>
  );
}
