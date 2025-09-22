import React from 'react';
import { Container, Heading, Separator, Text } from '@radix-ui/themes';
import { Button } from '../../../ui/components/ui/button';
import { Input } from '../../../ui/components/ui/input';
import { Label } from '../../../ui/components/ui/label';
import type { LoginViewProps } from './types';

export const LoginView: React.FC<LoginViewProps> = ({
  email,
  password,
  loading,
  error,
  onEmailChange,
  onPasswordChange,
  onSubmit,
}) => {
  return (
    <Container size="1" style={{ marginTop: '3rem' }}>
      <Heading>Login</Heading>
      <Text as="p" mt="2">Sign in to continue</Text>
      <Separator my="3" size="4" />

      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit();
        }}
        className="space-y-3 max-w-sm"
      >
        <div className="space-y-1.5">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" value={email} onChange={(e) => onEmailChange(e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="password">Password</Label>
          <Input id="password" type="password" value={password} onChange={(e) => onPasswordChange(e.target.value)} />
        </div>
        <Button type="submit" disabled={loading} className="w-full">
          {loading ? 'Signing in…' : 'Sign in'}
        </Button>
        {error ? (
          <Text as="p" mt="2" color="red">
            {error}
          </Text>
        ) : null}
      </form>
    </Container>
  );
};
