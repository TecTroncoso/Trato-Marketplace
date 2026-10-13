"use client";

import { useEffect } from "react";
import type { ProductDetail } from "@trato/shared";
import { useRecentStore } from "@/store/recent-store";

export function TrackView({ product }: { product: ProductDetail }) {
  const push = useRecentStore((state) => state.push);

  useEffect(() => {
    push({
      id: product.id,
      slug: product.slug,
      title: product.title,
      price: product.price,
      originalPrice: product.originalPrice,
      discount: product.discount,
      condition: product.condition,
      freeShipping: product.freeShipping,
      stock: product.stock,
      soldQuantity: product.soldQuantity,
      rating: product.rating,
      reviewsCount: product.reviewsCount,
      images: product.images,
      brand: product.brand,
      location: product.location,
      categoryId: product.categoryId,
      categorySlug: product.categorySlug,
      categoryPath: product.categoryPath,
      installments: product.installments,
      seller: product.seller,
    });
  }, [product, push]);

  return null;
}
