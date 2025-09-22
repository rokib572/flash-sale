export type LoginForm = { email: string; password: string };

export type LoginViewProps = {
  email: string;
  password: string;
  loading?: boolean;
  error?: string | null;
  onEmailChange: (v: string) => void;
  onPasswordChange: (v: string) => void;
  onSubmit: () => void;
};

