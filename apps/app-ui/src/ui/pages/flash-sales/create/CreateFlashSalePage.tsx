import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { Router } from '../../../../router';
import { toast } from 'react-toastify';
import { api } from '../../../api/client';
import type { RootState } from '../../../store';
import { CreateFlashSaleView } from './CreateFlashSaleView';
import type { Product, CreateRequest, ProductsResponse } from './types';
import { Button } from '../../../components/ui/button';
import { useRedirectOn401 } from '../../../../modules/shared/hooks/use-redirect-on-401';
import { qk } from '../../../api/query-keys';


export const CreateFlashSalePage: React.FC = () => {
  const queryClient = useQueryClient();
  const token = useSelector((s: RootState) => s.auth.token);
  const navigate = (name: 'Home' | 'ProductsCreate') => Router.replace(name);

  const {
    data: productsData,
    isLoading: loadingProducts,
    error: productsError,
  } = useQuery<ProductsResponse>({
    queryKey: qk.products.list(),
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
    mutationFn: async (payload: CreateRequest) => {
      const toIso = (s: string) => new Date(s).toISOString();
      const body = { ...payload, startDate: toIso(payload.startDate), endDate: toIso(payload.endDate) };
      return api.post('/flash-sales', body, { headers: token ? { 'x-auth-token': token } : undefined });
    },
    onSuccess: async () => {
      // Ensure flash sales list refreshes after creation
      await queryClient.invalidateQueries({ queryKey: qk.flashSales.list() });
      toast.success('Flash sale created');
      navigate('Home');
    },
    onError: (e: any) => {
      const msg = e?.message || 'Failed to create flash sale';
      toast.error(msg);
    },
  });

  useRedirectOn401(productsError, mutation.error as any);

  return (
    <>
      <div className="mt-4">
        <div className="mx-auto w-full max-w-screen-xl px-4 md:px-6 flex justify-end">
          <Button onClick={() => navigate('ProductsCreate')}>Create Product</Button>
        </div>
      </div>
      <CreateFlashSaleView
        products={products}
        values={values}
        loading={mutation.isPending || loadingProducts}
        error={(productsError as any)?.message || (mutation.error as any)?.message || null}
        onChange={(patch) => setValues((v) => ({ ...v, ...patch }))}
        onSubmit={() => mutation.mutate(values)}
        onCancel={() => navigate('Home')}
      />
    </>
  );
};
