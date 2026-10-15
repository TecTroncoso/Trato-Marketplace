import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Tag } from "lucide-react";
import type { ProductDetail, ProductSummary, Question, Review, ReviewSummary } from "@trato/shared";
import { ApiError, serverFetch } from "@/lib/api";
import { ApiOffline } from "@/components/layout/api-offline";
import { Gallery } from "@/components/product/gallery";
import { BuyBox } from "@/components/product/buy-box";
import { SellerCard } from "@/components/product/seller-card";
import { SpecsTable } from "@/components/product/specs-table";
import { QuestionsSection } from "@/components/product/questions-section";
import { ReviewsSection } from "@/components/product/reviews-section";
import { TrackView } from "@/components/product/track-view";
import { ProductRail } from "@/components/product/product-rail";
import { PageContainer } from "@/components/ui/page-container";
import { Breadcrumbs } from "@/components/ui/breadcrumb";

interface ReviewsPayload {
  summary: ReviewSummary;
  reviews: Review[];
}

interface CategoryNode {
  name: string;
  slug: string;
  parent?: { name: string; slug: string } | null;
}

const EMPTY_REVIEWS: ReviewsPayload = {
  summary: { average: 0, total: 0, histogram: { "1": 0, "2": 0, "3": 0, "4": 0, "5": 0 } },
  reviews: [],
};

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  try {
    const product = await serverFetch<ProductDetail>(`/products/${encodeURIComponent(slug)}`, { revalidate: 60 });
    return {
      title: product.title,
      description: product.description.slice(0, 155),
      openGraph: {
        title: product.title,
        description: `Comprá ${product.title} en Trato con envío gratis y cuotas sin interés.`,
        images: product.images.slice(0, 1),
      },
    };
  } catch {
    return { title: "Producto" };
  }
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  let product: ProductDetail;
  try {
    product = await serverFetch<ProductDetail>(`/products/${encodeURIComponent(slug)}`, { revalidate: 60 });
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      notFound();
    }
    return (
      <div className="px-3 py-10">
        <ApiOffline detail={(error as Error).message} />
      </div>
    );
  }

  const [reviews, questions, related, sellerProducts, category] = await Promise.all([
    serverFetch<ReviewsPayload>(`/products/${product.id}/reviews`, { revalidate: 30 }).catch(() => EMPTY_REVIEWS),
    serverFetch<Question[]>(`/products/${product.id}/questions`, { revalidate: 30 }).catch(() => [] as Question[]),
    serverFetch<ProductSummary[]>(`/products/${product.id}/related`, { revalidate: 120 }).catch(() => [] as ProductSummary[]),
    serverFetch<ProductSummary[]>(`/sellers/${product.seller.id}/products`, { revalidate: 120 }).catch(() => [] as ProductSummary[]),
    serverFetch<CategoryNode>(`/categories/${product.categorySlug}`, { revalidate: 300 }).catch(() => null),
  ]);

  const crumbs = [
    { label: "Inicio", href: "/" },
    ...(category?.parent ? [{ label: category.parent.name, href: `/categorias/${category.parent.slug}` }] : []),
    { label: category?.name ?? "Categoría", href: `/categorias/${product.categorySlug}` },
    { label: product.title.length > 40 ? `${product.title.slice(0, 40)}…` : product.title },
  ];

  const relatedFiltered = related.filter((item) => item.id !== product.id);

  return (
    <PageContainer width="wide" padding="sm">
      <TrackView product={product} />
      <Breadcrumbs items={crumbs} className="mb-3" />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="min-w-0 lg:col-start-1 lg:row-start-1">
          <div className="rounded-xl bg-white p-4 shadow-[var(--shadow-card)] sm:p-5">
            <Gallery images={product.images} title={product.title} />
            <p className="mt-4 flex items-center gap-1 text-xs text-trato-muted">
              <Tag className="size-3" /> Publicado hace poco · {product.views} visitas
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-4 lg:col-start-2 lg:row-start-1 lg:sticky lg:top-28 lg:self-start">
          <BuyBox product={product} />
          <SellerCard seller={product.seller} />
        </div>

        <div className="flex min-w-0 flex-col gap-4 lg:col-start-1 lg:row-start-2">
          {Object.keys(product.attributes).length > 0 && <SpecsTable attributes={product.attributes} />}

          <section id="descripcion" className="rounded-xl bg-white p-5 shadow-[var(--shadow-card)]">
            <h2 className="mb-3 text-lg font-semibold text-trato-ink">Descripción</h2>
            <p className="whitespace-pre-line text-sm leading-relaxed text-trato-ink">{product.description}</p>
          </section>

          <QuestionsSection productId={product.id} sellerId={product.seller.id} initialQuestions={questions} />

          <ReviewsSection productId={product.id} initial={reviews} productTitle={product.title} />
        </div>
      </div>

      <div id="vendedor" className="mt-6 flex flex-col gap-6">
        {sellerProducts.length > 1 && (
          <ProductRail
            products={sellerProducts.filter((item) => item.id !== product.id)}
            title={`Más publicaciones de ${product.seller.name}`}
            subtitle="Del mismo vendedor"
          />
        )}
        {relatedFiltered.length > 0 && (
          <ProductRail
            products={relatedFiltered}
            title="Quienes vieron este producto también vieron"
            subtitle="Productos similares"
            href={`/categorias/${product.categorySlug}`}
            hrefLabel="Ver categoría"
          />
        )}
        <p className="text-center text-xs text-trato-muted">
          ¿Buscás algo parecido?{" "}
          <Link href={`/categorias/${product.categorySlug}`} className="font-semibold text-trato-blue hover:underline">
            Explorá más en {category?.name ?? "esta categoría"}
          </Link>
        </p>
      </div>
    </PageContainer>
  );
}
