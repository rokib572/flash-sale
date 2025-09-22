export type OrderRow = {
  id: string;
  userId: string;
  flashSaleId?: string | null;
  productId: string;
  quantity: number;
  createdAt: string;
};

export type OrdersListViewProps = {
  orders: OrderRow[];
  loading?: boolean;
  error?: string | null;
  page: {
    limit: number;
    offset: number;
    setLimit: (v: number) => void;
    nextPage: () => void;
    prevPage: () => void;
    refetch: () => void | Promise<any>;
  };
};

