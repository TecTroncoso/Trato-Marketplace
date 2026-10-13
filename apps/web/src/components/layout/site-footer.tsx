import Link from "next/link";

const COLUMNS = [
  {
    title: "Trato",
    links: [
      { label: "Acerca de Trato", href: "/" },
      { label: "Trabajá con nosotros", href: "/" },
      { label: "Sustentabilidad", href: "/" },
      { label: "Prensa", href: "/" },
    ],
  },
  {
    title: "Comprar",
    links: [
      { label: "Explorar productos", href: "/buscar" },
      { label: "Ofertas del día", href: "/buscar?sort=sold_desc" },
      { label: "Más vendidos", href: "/buscar?sort=sold_desc" },
      { label: "Mis compras", href: "/mis-compras" },
    ],
  },
  {
    title: "Vender",
    links: [
      { label: "Publicar un producto", href: "/vender" },
      { label: "Mis publicaciones", href: "/mi-cuenta?tab=publicaciones" },
      { label: "Mis ventas", href: "/mi-cuenta?tab=ventas" },
      { label: "Costos y tarifas", href: "/vender" },
    ],
  },
  {
    title: "Ayuda",
    links: [
      { label: "Centro de ayuda", href: "/" },
      { label: "Cómo comprar", href: "/" },
      { label: "Envíos y devoluciones", href: "/" },
      { label: "Compra protegida", href: "/" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="mt-10 bg-white">
      <div className="mx-auto grid max-w-[1220px] gap-8 px-4 py-10 sm:grid-cols-2 lg:grid-cols-4">
        {COLUMNS.map((column) => (
          <div key={column.title}>
            <h3 className="mb-3 text-sm font-bold text-trato-ink">{column.title}</h3>
            <ul className="flex flex-col gap-2">
              {column.links.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-sm text-trato-muted transition hover:text-trato-blue">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-trato-line">
        <div className="mx-auto flex max-w-[1220px] flex-col gap-2 px-4 py-6 text-xs text-trato-muted sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Trato MarketPlace. Todos los derechos reservados.</p>
          <p>
            Demo técnica con Next.js 15, NestJS, Prisma y Meilisearch. No es un sitio de comercio real.
          </p>
        </div>
      </div>
    </footer>
  );
}
