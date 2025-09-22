import React from 'react';
import { describe, it, expect } from 'vitest';
import { renderToString } from 'react-dom/server';
import { LoginView } from './LoginView';

describe('LoginView', () => {
  it('renders title and form fields', () => {
    const html = renderToString(
      <LoginView
        email=""
        password=""
        onEmailChange={() => {}}
        onPasswordChange={() => {}}
        onSubmit={() => {}}
      />,
    );
    expect(html).toContain('Login');
    expect(html).toContain('Email');
    expect(html).toContain('Password');
  });
});
