export const qk = {
  products: {
    list: () => ['products:list'] as const,
  },
  flashSales: {
    list: () => ['flash-sales:list'] as const,
  },
  orders: {
    list: (limit: number, offset: number) => ['orders:list', limit, offset] as const,
  },
};

