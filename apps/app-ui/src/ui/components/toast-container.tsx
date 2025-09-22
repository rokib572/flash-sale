import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { ToastContainer as RTContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import type { RootState } from '../store';
import { clearMessage } from '../store';

export const Toasts: React.FC = () => {
  const msg = useSelector((s: RootState) => s.ui.message);
  const dispatch = useDispatch();

  React.useEffect(() => {
    if (msg) {
      toast(msg);
      dispatch(clearMessage());
    }
  }, [msg, dispatch]);

  return <RTContainer position="bottom-right" />;
};
