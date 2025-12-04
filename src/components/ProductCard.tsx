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
      className={`group ${designSystem.card.base} ${designSystem.card.hover} ${designSystem.card.interactive} overflow-hidden border-2 hover:border-primary/50 h-full flex flex-col`}
      style={{ animationDelay: `${index * 50}ms` }}
      onClick={handleCardClick}
    >
      {/* Image Section */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-gradient-to-br from-muted/80 via-muted/60 to-muted/80">
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
                <Package className="h-12 w-12 text-muted-foreground/50 group-hover:text-primary/70 transition-all duration-300 group-hover:scale-110" />
                <Sparkles className="absolute -top-2 -right-2 h-4 w-4 text-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>
            </div>
          </>
        ) : (
          /* Placeholder Icon */
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative">
              <Package className="h-12 w-12 text-muted-foreground/50 group-hover:text-primary/70 transition-all duration-300 group-hover:scale-110" />
              <Sparkles className="absolute -top-2 -right-2 h-4 w-4 text-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>
          </div>
        )}

        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Badge Overlay */}
        {product.rating && product.rating >= 4 && (
          <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm px-1.5 py-0.5 rounded-full flex items-center gap-0.5 shadow-md">
            <Star className="h-2.5 w-2.5 fill-yellow-400 text-yellow-400" />
            <span className="text-[10px] font-semibold text-gray-900">
              {product.rating.toFixed(1)}
            </span>
          </div>
        )}
      </div>

      {/* Content Section */}
      <CardContent className="p-3 space-y-2 flex-1 flex flex-col">
        {/* Product Name */}
        <div className="flex-1 flex flex-col">
          <h3
            className={`text-sm font-semibold line-clamp-2 group-hover:text-primary transition-colors duration-200`}
          >
            {product.name}
          </h3>
          <p
            className={`text-xs text-muted-foreground mt-0.5 line-clamp-2`}
          >
            {product.description || 'No description available'}
          </p>
        </div>

        {/* Price & Seller Info */}
        <div className="space-y-1.5">
          <div className="flex items-baseline justify-between">
            <span className={`text-base font-bold text-primary`}>
              {formatCurrency(product.price)}
            </span>
            {product.rating && product.rating < 4 && (
              <div className="flex items-center gap-0.5 bg-yellow-50 dark:bg-yellow-900/20 px-1.5 py-0.5 rounded-md">
                <Star className="h-2.5 w-2.5 fill-yellow-400 text-yellow-400" />
                <span
                  className={`text-[10px] font-medium`}
                >
                  {product.rating.toFixed(1)}
                </span>
              </div>
            )}
          </div>

          {typeof product.sellerId === "object" &&
            product.sellerId?.shopName && (
              <div className="flex items-center gap-1 text-muted-foreground">
                <Store className="h-3 w-3" />
                <span className={`text-xs truncate`}>
                  {product.sellerId.shopName}
                </span>
              </div>
            )}
        </div>
      </CardContent>

      {/* Footer Button */}
      <CardFooter className="p-3 pt-0 mt-auto">
        <Button
          size="sm"
          className={`w-full ${designSystem.button.base} ${designSystem.button.hover} group/btn text-xs h-8`}
          onClick={(e) => {
            e.stopPropagation();
            router.push(`/products/${product._id}`);
          }}
        >
          <span>View Details</span>
          <ArrowRight className="ml-1.5 h-3 w-3 transition-transform duration-200 group-hover/btn:translate-x-1" />
        </Button>
      </CardFooter>
    </Card>
  );
}
