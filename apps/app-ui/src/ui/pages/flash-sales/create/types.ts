export type Product = { id: string; name: string };

export type CreateRequest = {
  name: string;
  description: string;
  productId: string;
  startDate: string;
  endDate: string;
};

export type ProductsResponse = { products: Product[] } | Product[];

export type CreateFlashSaleViewProps = {
  products: Product[];
  values: CreateRequest;
  loading?: boolean;
  error?: string | null;
  onChange: (patch: Partial<CreateRequest>) => void;
  onSubmit: () => void;
  onCancel: () => void;
};
