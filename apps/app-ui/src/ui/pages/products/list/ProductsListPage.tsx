import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { useQuery } from '@tanstack/react-query';
import type { RootState } from '../../../store';
import { api } from '../../../api/client';
import { qk } from '../../../api/query-keys';
import { useRedirectOn401 } from '../../../../modules/shared/hooks/use-redirect-on-401';
import { ProductsListView, type Product } from './ProductsListView';

type ProductsResponse = { products: Product[] } | Product[];

export const ProductsListPage: React.FC = () => {
  const token = useSelector((s: RootState) => s.auth.token);
  const { data, isLoading, error } = useQuery<ProductsResponse>({
    queryKey: qk.products.list(),
    queryFn: () => api.get<ProductsResponse>('/products/list', { headers: token ? { 'x-auth-token': token } : undefined }),
    staleTime: Infinity,
    gcTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  useRedirectOn401(error);

  const products = useMemo(() => {
    if (!data) return [] as Product[];
    return Array.isArray(data) ? data : data.products;
  }, [data]);

  return <ProductsListView products={products} isLoading={isLoading} error={(error as any)?.message ?? null} />;
};
