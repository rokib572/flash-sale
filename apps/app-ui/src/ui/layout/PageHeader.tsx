import React from 'react';
import { Container } from './Container';

type Props = {
  title: string;
  actions?: React.ReactNode;
};

export const PageHeader: React.FC<Props> = ({ title, actions }) => {
  return (
    <div className="border-b bg-transparent">
      <Container className="py-4">
        <div className="flex items-center justify-between gap-3">
          <h1 className="text-xl font-semibold tracking-tight">{title}</h1>
          {actions ? <div className="shrink-0">{actions}</div> : null}
        </div>
      </Container>
    </div>
  );
};

