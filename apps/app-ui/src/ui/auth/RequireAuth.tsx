import React from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '../store';
import { Router } from '../../router';

export const RequireAuth: React.FC<React.PropsWithChildren> = ({ children }) => {
  const token = useSelector((s: RootState) => s.auth.token);
  React.useEffect(() => {
    if (!token) Router.replace('Login');
  }, [token]);
  return <>{children}</>;
};
