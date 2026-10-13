import type { Metadata } from "next";
import type { HomePayload } from "@trato/shared";
import { serverFetch } from "@/lib/api";
import { ApiOffline } from "@/components/layout/api-offline";
import { HeroBanner } from "@/components/home/hero-banner";
import { CategoryRail } from "@/components/home/category-rail";
import { TrustBadges } from "@/components/home/trust-badges";
import { DealsSection } from "@/components/home/deals-section";
import { FeaturedTabs } from "@/components/home/featured-tabs";
import { RecentlyViewed } from "@/components/home/recently-viewed";
import { SellCta } from "@/components/home/sell-cta";
import { PaymentCard } from "@/components/home/widgets/payment-card";
import { MiniCart } from "@/components/home/widgets/mini-cart";
import { ShippingPromo } from "@/components/home/widgets/shipping-promo";
import { AppPromo } from "@/components/home/widgets/app-promo";

export const metadata: Metadata = {
  title: "Trato | Comprá y vendé en el marketplace",
};

export default async function HomePage() {
  let home: HomePayload;
  try {
    home = await serverFetch<HomePayload>("/home");
  } catch (error) {
    return (
      <div className="px-3 py-10">
        <ApiOffline detail={(error as Error).message} />
      </div>
    );
  }

  const collage = home.bestSellers
    .slice(0, 4)
    .map((product) => product.images[0])
    .filter((image): image is string => Boolean(image));

  return (
    <div className="mx-auto max-w-[1360px] px-3 py-4 sm:px-4">
      <div className="grid gap-4 lg:grid-cols-[232px_minmax(0,1fr)] xl:grid-cols-[232px_minmax(0,1fr)_300px]">
        <aside className="order-2 hidden lg:order-1 lg:block">
          <div className="lg:sticky lg:top-32">
            <CategoryRail categories={home.categories} />
          </div>
        </aside>

        <div className="order-1 flex min-w-0 flex-col gap-4 lg:order-2">
          <HeroBanner banners={home.banners} collage={collage} />
          <TrustBadges stats={home.stats} />
          <DealsSection products={home.deals} />
          <FeaturedTabs bestSellers={home.bestSellers} topRated={home.topRated} newest={home.newest} />
          <RecentlyViewed />
          <SellCta />
        </div>

        <aside className="order-3 grid gap-4 sm:grid-cols-2 lg:col-span-2 lg:grid-cols-4 xl:col-span-1 xl:col-start-3 xl:row-start-1 xl:flex xl:flex-col xl:self-start xl:sticky xl:top-32">
          <PaymentCard />
          <MiniCart />
          <ShippingPromo />
          <AppPromo />
        </aside>
      </div>
    </div>
  );
}
