export type Product = { id: string; name: string } & Partial<{ quantity: number; disabled: boolean }>;

export type ProductsListViewProps = {
  products: Product[];
  isLoading?: boolean;
  error?: string | null;
};

export type ProductsResponse = { products: Product[] } | Product[];

