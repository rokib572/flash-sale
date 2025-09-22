import React from 'react';

type State = { hasError: boolean };

export class AppErrorBoundary extends React.Component<React.PropsWithChildren, State> {
  state: State = { hasError: false };
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(error: any, info: any) {
    // eslint-disable-next-line no-console
    console.error('AppErrorBoundary', error, info);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="p-6">
          <h1 className="text-xl font-semibold">Something went wrong.</h1>
          <p className="text-sm text-neutral-600">Please refresh the page.</p>
        </div>
      );
    }
    return this.props.children as any;
  }
}

