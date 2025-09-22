import { DomainError } from './domain-error';
export const classifyDomainError = (err) => {
    if (err instanceof DomainError) {
        const e = err;
        const rawCode = e.code || 'BAD_REQUEST';
        const code = rawCode === 'NOT_FOUND' || rawCode === 'UNAUTHORISED' || rawCode === 'INTERNAL_ERROR'
            ? rawCode
            : 'BAD_REQUEST';
        const message = e.clientSafeMessage || e.message || 'Bad request';
        return { code, message };
    }
    // Unknown error
    return { code: 'INTERNAL_ERROR', message: 'Unexpected error' };
};
export const toResult = async (fn, map) => {
    try {
        const value = await fn();
        return { ok: true, value };
    }
    catch (err) {
        const base = classifyDomainError(err);
        return map ? { ok: false, ...map(base) } : { ok: false, code: base.code, message: base.message };
    }
};
