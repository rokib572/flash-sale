import React from 'react';
import { Provider as ReduxProvider } from 'react-redux';
import { store } from './store';
import { Theme } from '@radix-ui/themes';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();

export const Providers: React.FC<React.PropsWithChildren> = ({ children }) => {
  return (
    <ReduxProvider store={store}>
      <QueryClientProvider client={queryClient}>
        <Theme accentColor="violet" radius="large" scaling="95%">
          {children}
        </Theme>
      </QueryClientProvider>
    </ReduxProvider>
  );
};

