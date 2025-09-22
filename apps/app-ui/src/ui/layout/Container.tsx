import React from 'react';

type Props = React.PropsWithChildren<{
  className?: string;
  padded?: boolean;
}>;

export const Container: React.FC<Props> = ({ children, className = '', padded = true }) => {
  return (
    <div className={`mx-auto w-full max-w-screen-xl ${padded ? 'px-4 md:px-6' : ''} ${className}`}>
      {children}
    </div>
  );
};

