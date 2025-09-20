import React from 'react';
import { useForm } from 'react-hook-form';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { loginSuccess } from '../../store';
import { makeDummyJwt } from '../../auth/token';
import { LoginView } from './LoginView';

type LoginForm = { email: string; password: string };

export const LoginPage: React.FC = () => {
  const { watch, setValue, handleSubmit } = useForm<LoginForm>({
    defaultValues: { email: '', password: '' },
  });
  const email = watch('email');
  const password = watch('password');
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const mutation = useMutation({
    mutationFn: async ({ email, password }: LoginForm) => {
      await new Promise((r) => setTimeout(r, 400));
      if (!email || !password) throw new Error('Email and password required');
      // fabricate a userId from email
      const userId = email.toLowerCase();
      const token = makeDummyJwt({ sub: userId });
      return { email, token };
    },
    onSuccess: ({ email, token }) => {
      dispatch(loginSuccess({ email, token }));
      navigate('/');
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
