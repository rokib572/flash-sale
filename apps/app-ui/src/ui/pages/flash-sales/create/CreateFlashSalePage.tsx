import { useMutation, useQuery } from '@tanstack/react-query';
import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../../../api/client';
import type { RootState } from '../../../store';
import { CreateFlashSaleView, type Product } from './CreateFlashSaleView';
import { Button } from '../../../components/ui/button';

type ProductsResponse = { products: Product[] } | Product[];
type CreateRequest = {
  name: string;
  description: string;
  productId: string;
  startDate: string;
  endDate: string;
};

export const CreateFlashSalePage: React.FC = () => {
  const token = useSelector((s: RootState) => s.auth.token);
  const navigate = useNavigate();

  const {
    data: productsData,
    isLoading: loadingProducts,
    error: productsError,
  } = useQuery<ProductsResponse>({
    queryKey: ['products:list'],
    queryFn: () =>
      api.get<ProductsResponse>('/products/list', {
        headers: token ? { 'x-auth-token': token } : undefined,
      }),
    refetchOnWindowFocus: false,
  });

  const products: Product[] = useMemo(() => {
    if (!productsData) return [];
    return Array.isArray(productsData) ? productsData : productsData.products;
  }, [productsData]);

  const [values, setValues] = React.useState<CreateRequest>(() => {
    const now = new Date();
    const start = new Date(now.getTime() + 5 * 60 * 1000); // 5min from now
    const end = new Date(now.getTime() + 65 * 60 * 1000); // +65min
    const toLocal = (d: Date) =>
      new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
    return {
      name: '',
      description: '',
      productId: '',
      startDate: toLocal(start),
      endDate: toLocal(end),
    };
  });

  const mutation = useMutation({
    mutationFn: async (payload: CreateRequest) =>
      api.post('/flash-sales', payload, { headers: token ? { 'x-auth-token': token } : undefined }),
    onSuccess: () => navigate('/'),
  });

  return (
    <>
      <div className="flex justify-end max-w-xl mx-auto mt-4 px-2">
        <Button asChild>
          <Link to="/products/create">Create Product</Link>
        </Button>
      </div>
      <CreateFlashSaleView
        products={products}
        values={values}
        loading={mutation.isPending || loadingProducts}
        error={(productsError as any)?.message || (mutation.error as any)?.message || null}
        onChange={(patch) => setValues((v) => ({ ...v, ...patch }))}
        onSubmit={() => mutation.mutate(values)}
        onCancel={() => navigate('/')}
      />
    </>
  );
};
