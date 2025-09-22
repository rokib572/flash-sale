import { DomainError } from './domain-error';

export type ClassifiedErrorCode = 'BAD_REQUEST' | 'NOT_FOUND' | 'UNAUTHORISED' | 'INTERNAL_ERROR';

export const classifyDomainError = (
  err: unknown,
): { code: ClassifiedErrorCode; message: string } => {
  if (err instanceof DomainError) {
    const e: any = err;
    const rawCode = (e.code as string) || 'BAD_REQUEST';
    const code: ClassifiedErrorCode =
      rawCode === 'NOT_FOUND' || rawCode === 'UNAUTHORISED' || rawCode === 'INTERNAL_ERROR'
        ? (rawCode as ClassifiedErrorCode)
        : 'BAD_REQUEST';
    const message = e.clientSafeMessage || e.message || 'Bad request';
    return { code, message };
  }
  // Unknown error
  return { code: 'INTERNAL_ERROR', message: 'Unexpected error' };
};

export type Result<T, E extends string> = { ok: true; value: T } | { ok: false; code: E; message: string };

export const toResult = async <T, E extends string = ClassifiedErrorCode>(
  fn: () => Promise<T>,
  map?: (e: { code: ClassifiedErrorCode; message: string }) => { code: E; message: string },
): Promise<Result<T, E>> => {
  try {
    const value = await fn();
    return { ok: true, value };
  } catch (err) {
    const base = classifyDomainError(err);
    return map ? { ok: false, ...map(base) } : ({ ok: false, code: base.code as E, message: base.message } as any);
  }
};

