import React from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '../store';
import { Navigate, useLocation } from 'react-router-dom';

export const RequireAuth: React.FC<React.PropsWithChildren> = ({ children }) => {
  const token = useSelector((s: RootState) => s.auth.token);
  const location = useLocation();
  if (!token) return <Navigate to="/login" replace state={{ from: location }} />;
  return <>{children}</>;
};

