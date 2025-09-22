import { useMutation } from '@tanstack/react-query';
import React from 'react';
import { useSelector } from 'react-redux';
import { Router } from '../../../../router';
import { toast } from 'react-toastify';
import { api } from '../../../api/client';
import type { RootState } from '../../../store';
import { CreateProductView, type CreateProductValues } from './CreateProductView';

export const CreateProductPage: React.FC = () => {
  const token = useSelector((s: RootState) => s.auth.token);
  const navigate = (name: 'ProductsList') => Router.replace(name);
  const [values, setValues] = React.useState<CreateProductValues>({
    name: '',
    quantity: 0,
    disabled: false,
  });

  const mutation = useMutation({
    mutationFn: async (payload: CreateProductValues) =>
      api.post(
        '/products/create',
        { ...payload, quantity: payload.quantity },
        {
          headers: token ? { 'x-auth-token': token } : undefined,
        },
      ),
    onSuccess: () => {
      toast.success('Product created');
      navigate('ProductsList');
    },
    onError: (e: any) => {
      const msg = e?.message || 'Failed to create product';
      toast.error(msg);
    },
  });

  return (
    <CreateProductView
      values={values}
      loading={mutation.isPending}
      error={(mutation.error as any)?.message ?? null}
      onChange={(patch) => setValues((v) => ({ ...v, ...patch }))}
      onSubmit={() => mutation.mutate(values)}
      onCancel={() => navigate('ProductsList')}
    />
  );
};
