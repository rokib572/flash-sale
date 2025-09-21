import { useQuery } from '@tanstack/react-query';
import React from 'react';
import { useSelector } from 'react-redux';
import { api } from '../../../api/client';
import type { RootState } from '../../../store';
import { FlashSalesListView, type FlashSale } from './FlashSalesListView';

type ListResponse = { flashSales: FlashSale[] };

export const FlashSalesListPage: React.FC = () => {
  const token = useSelector((s: RootState) => s.auth.token);
  const { data, isLoading, error } = useQuery<ListResponse>({
    queryKey: ['flash-sales-list'],
    queryFn: () => api.get<ListResponse>('/flash-sales/list', {}),
    // Fetch once only
    staleTime: Infinity,
    gcTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: false,
  });

  return (
    <FlashSalesListView
      sales={data?.flashSales ?? []}
      isLoading={isLoading}
      error={(error as any)?.message ?? null}
    />
  );
};
