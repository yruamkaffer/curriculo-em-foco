import type { Metadata } from "next";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "Currículo em Foco", template: "%s | Currículo em Foco" },
  description: "Compare vaga e currículo com evidências, ajuste seu conteúdo com verdade e exporte um PDF simples para ATS.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className="h-full">
      <body className="flex min-h-full flex-col antialiased">
        <a className="skip-link" href="#conteudo">Pular para o conteúdo</a>
        <SiteHeader />
        {children}
        <SiteFooter />
      </body>
    </html>
  );
}
