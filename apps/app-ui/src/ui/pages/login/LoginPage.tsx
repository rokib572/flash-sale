import { useMutation } from '@tanstack/react-query';
import React from 'react';
import { useForm } from 'react-hook-form';
import { useDispatch } from 'react-redux';
import { Router } from '../../../router';
import { api } from '../../api/client';
import { toast } from 'react-toastify';
import { loginSuccess } from '../../store';
import { LoginView } from './LoginView';
import type { LoginForm } from './types';

export const LoginPage: React.FC = () => {
  const { watch, setValue, handleSubmit } = useForm<LoginForm>({
    defaultValues: { email: '', password: '' },
  });

  const email = watch('email');
  const password = watch('password');
  const dispatch = useDispatch();

  const mutation = useMutation({
    mutationFn: async ({ email, password }: LoginForm) => {
      return api.post<{
        token: string;
        user: { id: string; email: string; givenName: string; familyName: string };
      }>('/users/authenticate', { email, password });
    },
    onSuccess: ({ token, user }) => {
      dispatch(loginSuccess({ token, user }));
      toast.success(`Welcome, ${user.givenName || user.email}!`);
      Router.replace('Home');
    },
    onError: (e: any) => {
      const msg = e?.message || 'Login failed';
      toast.error(msg);
    },
  });

  const onSubmit = handleSubmit((values) => mutation.mutate(values));

  return (
    <LoginView
      email={email}
      password={password}
      loading={mutation.isPending}
      error={mutation.error?.message ?? null}
      onEmailChange={(v) => setValue('email', v, { shouldDirty: true })}
      onPasswordChange={(v) => setValue('password', v, { shouldDirty: true })}
      onSubmit={onSubmit}
    />
  );
};
