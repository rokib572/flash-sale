import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { Router } from '../../router';
import type { RootState } from '../store';
import { logout } from '../store';
import { getTokenExpiry } from './jwt';

export const SessionManager: React.FC = () => {
  const dispatch = useDispatch();
  const token = useSelector((s: RootState) => s.auth.token);

  React.useEffect(() => {
    let warnTimer: ReturnType<typeof setTimeout> | undefined;
    let expireTimer: ReturnType<typeof setTimeout> | undefined;
    const exp = getTokenExpiry(token);
    if (!token || !exp) return;
    const nowMs = Date.now();
    const expMs = exp * 1000;
    const warnAtMs = expMs - 60_000; // warn 60s before expiry
    if (warnAtMs > nowMs) {
      warnTimer = setTimeout(() => {
        toast.warn('Session will expire in 1 minute.');
      }, warnAtMs - nowMs);
    }

    if (expMs > nowMs) {
      expireTimer = setTimeout(() => {
        toast.info('Session expired. Please sign in again.');
        dispatch(logout());
        Router.replace('Login');
      }, expMs - nowMs);
    } else {
      // already expired
      dispatch(logout());
      Router.replace('Login');
    }

    return () => {
      if (warnTimer) clearTimeout(warnTimer);
      if (expireTimer) clearTimeout(expireTimer);
    };
  }, [token, dispatch]);

  return null;
};
