import { useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Container, Flex, Heading, Separator, Strong, Text } from '@radix-ui/themes';
import { Button } from './components/ui/button';
import { Input } from './components/ui/input';
import { Label } from './components/ui/label';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from './store';
import { setMessage } from './store';

type SaleStatus = 'upcoming' | 'active' | 'ended' | 'sold_out';

type StatusResponse = {
  status: SaleStatus | 'not_found';
  responseDateTime: string;
  sale?: {
    startDate: string;
    endDate: string;
    totalStock: number;
    soldCount: number;
  };
};

type PurchaseResponse = {
  ok: boolean;
  reason?: 'already_purchased' | 'outside_window' | 'sold_out';
};

export const App: React.FC = () => {
  const API: string = (import.meta as any).env?.VITE_API_URL || '';
  const PRODUCT_ID: string = (import.meta as any).env?.VITE_PRODUCT_ID || 'product-1';
  const dispatch = useDispatch();
  const message = useSelector((s: RootState) => s.ui.message);
  const token = useSelector((s: RootState) => s.auth.token);

  const queryClient = useQueryClient();

  const { data, isLoading, isError } = useQuery<StatusResponse>({
    queryKey: ['status', PRODUCT_ID, token],
    queryFn: async () => {
      const res = await fetch(`${API}/flash-sales/${PRODUCT_ID}/status`, {
        headers: token ? { 'x-auth-token': token } : undefined,
      });
      if (!res.ok) throw new Error('Failed to fetch');
      return res.json();
    },
    refetchInterval: 2000,
  });

  const { register, handleSubmit, watch } = useForm<{ userId: string}>({
    defaultValues: { userId: `user-${Math.floor(Math.random() * 1e6)}` },
  });

  const userId = watch('userId');

  const purchase = useMutation<PurchaseResponse, Error, { userId: string}>({
    mutationFn: async ({ userId }) => {
      const res = await fetch(`${API}/flash-sales/${PRODUCT_ID}/order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(token ? { 'x-auth-token': token } : {}) },
        body: JSON.stringify({ userId }),
      });
      return res.json();
    },
    onSuccess: (data) => {
      if (data.ok) dispatch(setMessage('Success! You secured the item.'));
      else if (data.reason === 'already_purchased') dispatch(setMessage('You already purchased.'));
      else if (data.reason === 'outside_window') dispatch(setMessage('Sale not active.'));
      else if (data.reason === 'sold_out') dispatch(setMessage('Sold out.'));
      else dispatch(setMessage('Failed.'));
      queryClient.invalidateQueries({ queryKey: ['status', PRODUCT_ID, token] });
    },
    onError: () => dispatch(setMessage('Request failed')),
  });

  const statusLabel = useMemo(() => {
    if (isLoading) return 'loading';
    if (isError || !data) return 'error';
    return data.status as SaleStatus;
  }, [isLoading, isError, data]);

  return (
    <Container size="1" style={{ marginTop: '2rem' }}>
      <Heading>Flash Sale</Heading>
      <Text as="p" mt="2">
        Status: <Strong>{statusLabel}</Strong>
        {' '}| Remaining: <Strong>{
          data?.sale ? Math.max(0, (data.sale.totalStock ?? 0) - (data.sale.soldCount ?? 0)) : '-'
        }</Strong>
      </Text>
      <Text as="p">
        Starts: {data?.sale?.startDate ?? '-'} <br /> Ends: {data?.sale?.endDate ?? '-'}
      </Text>

      <Separator my="3" size="4" />

      <form onSubmit={handleSubmit(() => purchase.mutate({ userId }))}>
        <Flex direction="column" gap="2" maxWidth="360px">
          <Label htmlFor="userId">User ID</Label>
          <Input id="userId" {...register('userId')} />
          <Button type="submit" disabled={purchase.isPending || data?.status !== 'active'} className="w-fit">
            {purchase.isPending ? 'Processing…' : 'Buy Now'}
          </Button>
        </Flex>
      </form>

      {message && (
        <Text as="p" mt="3">
          {message}
        </Text>
      )}
    </Container>
  );
};
