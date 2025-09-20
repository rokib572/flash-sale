import { scrypt as _scrypt, randomBytes, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';

const scrypt = promisify(_scrypt) as (
  password: string | Buffer,
  salt: string | Buffer,
  keylen: number,
) => Promise<Buffer>;

export const hashPasswordScrypt = async (password: string) => {
  const salt = randomBytes(16);
  const derived = await scrypt(password, salt, 32);
  return `scrypt:${salt.toString('hex')}:${derived.toString('hex')}`;
};

export const verifyPasswordScrypt = async (password: string, hash: string) => {
  const parts = hash.split(':');
  if (parts.length !== 3 || parts[0] !== 'scrypt') return false;
  const [, saltHex, derivedHex] = parts;
  const salt = Buffer.from(saltHex, 'hex');
  const derived = Buffer.from(derivedHex, 'hex');
  const calc = await scrypt(password, salt, derived.length);
  return timingSafeEqual(calc, derived);
};

