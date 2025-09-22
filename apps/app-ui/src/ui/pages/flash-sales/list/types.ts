export type FlashSale = {
  id: string;
  name: string;
  description: string;
  productId: string;
  startDate: string;
  endDate: string;
  createdAt: string;
};

export type FlashSalesListViewProps = {
  sales: FlashSale[];
  isLoading?: boolean;
  error?: string | null;
  onOrder?: (productId: string) => void;
  orderingProductId?: string | null;
};

export type ListResponse = { flashSales: FlashSale[] };

