export const getEnv = (name: string, fallback?: string): string => {
  const val = process.env[name] ?? fallback;
  if (val === undefined) throw new Error(`Missing env var: ${name}`);
  return val;
};
