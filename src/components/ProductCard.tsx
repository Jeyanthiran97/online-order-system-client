"use client";

import { useRouter } from "next/navigation";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Package, Star, ArrowRight, Store, Sparkles } from "lucide-react";
import { Product } from "@/services/productService";
import { formatCurrency } from "@/lib/utils";
import { designSystem } from "@/lib/design-system";

interface ProductCardProps {
  product: Product;
  index?: number;
}

export function ProductCard({ product, index = 0 }: ProductCardProps) {
  const router = useRouter();

  const handleCardClick = () => {
    router.push(`/products/${product._id}`);
  };

  // Get main image URL
  const getMainImageUrl = () => {
    if (!product.images || product.images.length === 0) return null;

    const mainIndex = product.mainImageIndex ?? 0;
    const imageUrl = product.images[mainIndex] || product.images[0];

    if (!imageUrl) return null;

    // If it's already a full URL, return it
    if (imageUrl.startsWith("http")) return imageUrl;

    // Otherwise, construct the full URL
    const API_URL =
      process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
    return `${API_URL.replace("/api", "")}${imageUrl}`;
  };

  const mainImageUrl = getMainImageUrl();

  return (
    <Card
      className={`group ${designSystem.card.base} ${designSystem.card.hover} ${designSystem.card.interactive} overflow-hidden border-2 hover:border-primary/50`}
      style={{ animationDelay: `${index * 50}ms` }}
      onClick={handleCardClick}
    >
      {/* Image Section */}
      <div className="relative aspect-square w-full overflow-hidden bg-gradient-to-br from-muted/80 via-muted/60 to-muted/80">
        {mainImageUrl ? (
          <>
            <img
              src={mainImageUrl}
              alt={product.name}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
              onError={(e) => {
                // Fallback to placeholder on error
                const target = e.target as HTMLImageElement;
                target.style.display = "none";
                const placeholder = target.nextElementSibling as HTMLElement;
                if (placeholder) placeholder.style.display = "flex";
              }}
            />
            {/* Fallback placeholder (hidden by default) */}
            <div
              className="absolute inset-0 flex items-center justify-center"
              style={{ display: "none" }}
            >
              <div className="relative">
                <Package className="h-16 w-16 text-muted-foreground/50 group-hover:text-primary/70 transition-all duration-300 group-hover:scale-110" />
                <Sparkles className="absolute -top-2 -right-2 h-5 w-5 text-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>
            </div>
          </>
        ) : (
          /* Placeholder Icon */
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative">
              <Package className="h-16 w-16 text-muted-foreground/50 group-hover:text-primary/70 transition-all duration-300 group-hover:scale-110" />
              <Sparkles className="absolute -top-2 -right-2 h-5 w-5 text-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>
          </div>
        )}

        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Badge Overlay */}
        {product.rating && product.rating >= 4 && (
          <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full flex items-center gap-1 shadow-md">
            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
            <span className="text-xs font-semibold text-gray-900">
              {product.rating.toFixed(1)}
            </span>
          </div>
        )}
      </div>

      {/* Content Section */}
      <CardContent className="p-4 space-y-3">
        {/* Product Name */}
        <div>
          <h3
            className={`${designSystem.typography.h4} line-clamp-2 group-hover:text-primary transition-colors duration-200`}
          >
            {product.name}
          </h3>
          <p
            className={`${designSystem.typography.small} ${designSystem.typography.muted} line-clamp-2 mt-1`}
          >
            {product.description}
          </p>
        </div>

        {/* Price & Seller Info */}
        <div className="space-y-2">
          <div className="flex items-baseline justify-between">
            <span className={`text-xl font-bold text-primary`}>
              {formatCurrency(product.price)}
            </span>
            {product.rating && product.rating < 4 && (
              <div className="flex items-center gap-1 bg-yellow-50 dark:bg-yellow-900/20 px-2 py-0.5 rounded-md">
                <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                <span
                  className={`${designSystem.typography.small} font-medium`}
                >
                  {product.rating.toFixed(1)}
                </span>
              </div>
            )}
          </div>

          {typeof product.sellerId === "object" &&
            product.sellerId?.shopName && (
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <Store className="h-3.5 w-3.5" />
                <span className={`${designSystem.typography.small} truncate`}>
                  {product.sellerId.shopName}
                </span>
              </div>
            )}
        </div>
      </CardContent>

      {/* Footer Button */}
      <CardFooter className="p-4 pt-0">
        <Button
          className={`w-full ${designSystem.button.base} ${designSystem.button.hover} group/btn`}
          onClick={(e) => {
            e.stopPropagation();
            router.push(`/products/${product._id}`);
          }}
        >
          <span>View Details</span>
          <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-200 group-hover/btn:translate-x-1" />
        </Button>
      </CardFooter>
    </Card>
  );
}
