"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Package, Star } from "lucide-react";
import { Product } from "@/services/productService";
import { formatCurrency } from "@/lib/utils";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const router = useRouter();

  const handleCardClick = () => {
    router.push(`/products/${product._id}`);
  };

  return (
    <Card 
      className="overflow-hidden transition-shadow hover:shadow-lg cursor-pointer"
      onClick={handleCardClick}
    >
      <CardHeader>
        <div className="aspect-video w-full bg-muted flex items-center justify-center">
          <Package className="h-12 w-12 text-muted-foreground" />
        </div>
        <CardTitle className="line-clamp-2">{product.name}</CardTitle>
        <CardDescription className="line-clamp-2">{product.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <span className="text-2xl font-bold">{formatCurrency(product.price)}</span>
          {product.rating && (
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <span className="text-sm">{product.rating.toFixed(1)}</span>
            </div>
          )}
        </div>
        {product.seller && (
          <p className="text-sm text-muted-foreground mt-2">by {product.seller.shopName}</p>
        )}
      </CardContent>
      <CardFooter>
        <Button 
          className="w-full" 
          onClick={(e) => {
            e.stopPropagation();
            router.push(`/products/${product._id}`);
          }}
        >
          View Details
        </Button>
      </CardFooter>
    </Card>
  );
}

