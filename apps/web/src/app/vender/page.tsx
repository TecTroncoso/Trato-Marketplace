"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Info, Plus, Store, Trash2 } from "lucide-react";
import { toast } from "sonner";
import type { Category, ProductDetail } from "@trato/shared";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { apiFetch } from "@/lib/api";
import { useAuthStore } from "@/store/auth-store";
import { useMounted } from "@/hooks/use-client";

interface AttributeRow {
  key: string;
  value: string;
}

export default function SellPage() {
  const mounted = useMounted();
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const token = useAuthStore((state) => state.token);

  const [categories, setCategories] = useState<Category[]>([]);
  const [categorySlug, setCategorySlug] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [originalPrice, setOriginalPrice] = useState("");
  const [stock, setStock] = useState("1");
  const [condition, setCondition] = useState("nuevo");
  const [brand, setBrand] = useState("");
  const [freeShipping, setFreeShipping] = useState(true);
  const [attributes, setAttributes] = useState<AttributeRow[]>([
    { key: "Color", value: "" },
    { key: "Material", value: "" },
  ]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    apiFetch<Category[]>("/categories").then(setCategories).catch(() => setCategories([]));
  }, []);

  const leaves = useMemo(() => {
    const list: { slug: string; label: string; parent: string }[] = [];
    for (const root of categories) {
      for (const child of root.children ?? []) {
        list.push({ slug: child.slug, label: child.name, parent: root.name });
      }
    }
    return list;
  }, [categories]);

  if (!mounted) {
    return (
      <div className="mx-auto max-w-[900px] px-3 py-6 sm:px-4">
        <Skeleton className="h-96 w-full rounded-xl" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="mx-auto max-w-[900px] px-3 py-10 sm:px-4">
        <div className="rounded-xl bg-white shadow-[var(--shadow-card)]">
          <EmptyState
            icon={Store}
            title="Ingresá para publicar un producto"
            description="Necesitás una cuenta de Trato para crear publicaciones y empezar a vender."
            action={
              <Button asChild variant="primary">
                <Link href="/ingresar">Ingresar</Link>
              </Button>
            }
          />
        </div>
      </div>
    );
  }

  function buildAttributes(): Record<string, string> {
    const result: Record<string, string> = {};
    for (const row of attributes) {
      if (row.key.trim() && row.value.trim()) {
        result[row.key.trim()] = row.value.trim();
      }
    }
    return result;
  }

  async function submit() {
    const priceNumber = Number(price);
    const originalNumber = originalPrice ? Number(originalPrice) : undefined;
    const stockNumber = Number(stock);

    if (title.trim().length < 10) {
      toast.error("El título debe tener al menos 10 caracteres");
      return;
    }
    if (description.trim().length < 20) {
      toast.error("La descripción debe tener al menos 20 caracteres");
      return;
    }
    if (!categorySlug) {
      toast.error("Elegí una categoría");
      return;
    }
    if (!Number.isFinite(priceNumber) || priceNumber < 100) {
      toast.error("Ingresá un precio válido (mayor a $100)");
      return;
    }
    if (!Number.isInteger(stockNumber) || stockNumber < 0) {
      toast.error("Ingresá un stock válido");
      return;
    }
    if (originalNumber && originalNumber <= priceNumber) {
      toast.error("El precio original debe ser mayor al precio de venta");
      return;
    }

    setSubmitting(true);
    try {
      const created = await apiFetch<ProductDetail>("/products", {
        method: "POST",
        token,
        body: {
          title: title.trim(),
          description: description.trim(),
          price: Math.round(priceNumber),
          originalPrice: originalNumber ? Math.round(originalNumber) : undefined,
          stock: stockNumber,
          condition,
          categorySlug,
          brand: brand.trim() || undefined,
          freeShipping,
          attributes: buildAttributes(),
        },
      });
      toast.success("¡Publicación creada con éxito!", { description: created.title });
      router.push(`/productos/${created.slug}`);
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-[900px] px-3 py-6 sm:px-4">
      <div className="mb-5">
        <h1 className="text-xl font-bold text-trato-ink sm:text-2xl">Publicá tu producto</h1>
        <p className="text-sm text-trato-muted">
          Completá los datos y tu publicación queda lista al instante. Generamos imágenes de muestra automáticamente.
        </p>
      </div>

      <div className="flex flex-col gap-4">
        <section className="rounded-xl bg-white p-5 shadow-[var(--shadow-card)]">
          <h2 className="mb-4 text-base font-semibold text-trato-ink">Datos del producto</h2>
          <div className="flex flex-col gap-4">
            <div>
              <Label htmlFor="title">Título</Label>
              <Input
                id="title"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="Ej: Samsung Galaxy S24 Ultra 256gb 12ram Negro"
                maxLength={120}
              />
              <p className="mt-1 text-xs text-trato-muted">{title.length}/120 · Incluí marca, modelo y características clave.</p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <Label htmlFor="category">Categoría</Label>
                <select
                  id="category"
                  value={categorySlug}
                  onChange={(event) => setCategorySlug(event.target.value)}
                  className="h-11 w-full rounded-md border border-trato-line bg-white px-3 text-sm outline-none focus:border-trato-blue"
                >
                  <option value="">Elegí una categoría…</option>
                  {categories.map((root) => (
                    <optgroup key={root.id} label={root.name}>
                      {(root.children ?? []).map((child) => (
                        <option key={child.id} value={child.slug}>
                          {child.name}
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </div>
              <div>
                <Label htmlFor="condition">Condición</Label>
                <select
                  id="condition"
                  value={condition}
                  onChange={(event) => setCondition(event.target.value)}
                  className="h-11 w-full rounded-md border border-trato-line bg-white px-3 text-sm outline-none focus:border-trato-blue"
                >
                  <option value="nuevo">Nuevo</option>
                  <option value="usado">Usado</option>
                </select>
              </div>
              <div>
                <Label htmlFor="brand">Marca</Label>
                <Input id="brand" value={brand} onChange={(event) => setBrand(event.target.value)} placeholder="Ej: Samsung" />
              </div>
              <div>
                <Label>{leaves.length ? `${leaves.length} subcategorías disponibles` : "Seleccioná categoría"}</Label>
                <label className="mt-2 flex cursor-pointer items-center gap-2 text-sm">
                  <input type="checkbox" checked={freeShipping} onChange={(event) => setFreeShipping(event.target.checked)} className="accent-trato-blue" />
                  Ofrecer envío gratis
                </label>
              </div>
            </div>

            <div>
              <Label htmlFor="description">Descripción</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="Contá las características, el estado y lo que incluye el producto…"
                className="min-h-32"
                maxLength={4000}
              />
              <p className="mt-1 text-xs text-trato-muted">{description.length}/4000</p>
            </div>
          </div>
        </section>

        <section className="rounded-xl bg-white p-5 shadow-[var(--shadow-card)]">
          <h2 className="mb-4 text-base font-semibold text-trato-ink">Precio y stock</h2>
          <div className="grid gap-3 sm:grid-cols-3">
            <div>
              <Label htmlFor="price">Precio de venta ($)</Label>
              <Input id="price" type="number" min={100} value={price} onChange={(event) => setPrice(event.target.value)} placeholder="450000" />
            </div>
            <div>
              <Label htmlFor="originalPrice">Precio original (opcional)</Label>
              <Input id="originalPrice" type="number" min={100} value={originalPrice} onChange={(event) => setOriginalPrice(event.target.value)} placeholder="520000" />
            </div>
            <div>
              <Label htmlFor="stock">Stock disponible</Label>
              <Input id="stock" type="number" min={0} value={stock} onChange={(event) => setStock(event.target.value)} placeholder="10" />
            </div>
          </div>
          <p className="mt-3 flex items-start gap-2 rounded-lg bg-trato-blue-soft p-3 text-xs text-trato-blue">
            <Info className="mt-0.5 size-3.5 shrink-0" />
            Si cargás un precio original mayor, mostramos el porcentaje de descuento y calculamos las cuotas sin interés
            automáticamente.
          </p>
        </section>

        <section className="rounded-xl bg-white p-5 shadow-[var(--shadow-card)]">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-base font-semibold text-trato-ink">Características (opcional)</h2>
            <Button size="sm" variant="outline" onClick={() => setAttributes((current) => [...current, { key: "", value: "" }])}>
              <Plus /> Agregar campo
            </Button>
          </div>
          <div className="flex flex-col gap-3">
            {attributes.map((row, index) => (
              <div key={index} className="flex items-center gap-2">
                <Input
                  placeholder="Característica (ej: Memoria RAM)"
                  value={row.key}
                  onChange={(event) =>
                    setAttributes((current) => current.map((item, itemIndex) => (itemIndex === index ? { ...item, key: event.target.value } : item)))
                  }
                />
                <Input
                  placeholder="Valor (ej: 12 GB)"
                  value={row.value}
                  onChange={(event) =>
                    setAttributes((current) => current.map((item, itemIndex) => (itemIndex === index ? { ...item, value: event.target.value } : item)))
                  }
                />
                <Button
                  size="icon"
                  variant="ghost"
                  className="shrink-0 text-trato-muted hover:text-red-600"
                  onClick={() => setAttributes((current) => current.filter((_, itemIndex) => itemIndex !== index))}
                  aria-label="Quitar campo"
                >
                  <Trash2 />
                </Button>
              </div>
            ))}
          </div>
        </section>

        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-white p-5 shadow-[var(--shadow-card)]">
          <p className="text-xs text-trato-muted">
            Al publicar aceptás las políticas de venta de Trato. Podés pausar la publicación cuando quieras.
          </p>
          <Button size="lg" variant="yellow" onClick={submit} disabled={submitting}>
            {submitting ? "Publicando…" : "Publicar producto"}
          </Button>
        </div>
      </div>
    </div>
  );
}
