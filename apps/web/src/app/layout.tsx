import type { Metadata, Viewport } from "next";
import "./globals.css";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { Toaster } from "@/components/ui/toaster";

export const metadata: Metadata = {
  title: {
    default: "Trato | Comprá y vendé con envío gratis y cuotas sin interés",
    template: "%s | Trato",
  },
  description:
    "Trato es el marketplace donde encontrás millones de productos con envío gratis, cuotas sin interés y compra protegida. Publicá y vendé en minutos.",
  keywords: ["marketplace", "comprar online", "envío gratis", "cuotas sin interés", "Trato"],
  openGraph: {
    title: "Trato | Tu marketplace",
    description: "Miles de productos con envío gratis, cuotas sin interés y compra protegida.",
    type: "website",
    locale: "es_AR",
  },
};

export const viewport: Viewport = {
  themeColor: "#fff159",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="flex min-h-screen flex-col">
        <SiteHeader />
        <main className="flex-1">{children}</main>
        <SiteFooter />
        <Toaster />
      </body>
    </html>
  );
}
