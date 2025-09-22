import React from 'react';
import { Router } from '../../../router';

export const useRedirectOn401 = (...errors: Array<unknown>) => {
  React.useEffect(() => {
    for (const err of errors) {
      if (err && typeof err === 'object' && 'status' in (err as any)) {
        const status = (err as any).status;
        if (typeof status === 'number' && status === 401) {
          Router.replace('Login');
          break;
        }
      }
    }
  }, [...errors]);
};
