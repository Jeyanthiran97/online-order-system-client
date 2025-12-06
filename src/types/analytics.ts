export interface Analytics {
  totalOrders: number;
  completedOrders: number;
  totalSales: number;
  salesBySeller: Array<{
    sellerId: string;
    shopName: string;
    totalSales: number;
  }>;
}

