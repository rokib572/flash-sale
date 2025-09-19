// Seed data for database bootstrapping
// Exactly one user and one product entry

import { scrypt as _scrypt, randomBytes } from 'node:crypto';
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

export type SeedUser = {
  email: string;
  givenName: string;
  familyName: string;
  password: string;
};

// Plain user seed (password will be hashed via helper)
export const userSeeds: SeedUser[] = [
  {
    email: 'demo@example.com',
    givenName: 'Demo',
    familyName: 'User',
    password: 'demo1234',
  },
];

// Helper to transform plain seeds into DB-ready payloads with passwordHash
export const buildUserSeedsHashed = async () =>
  Promise.all(
    userSeeds.map(async (u) => ({
      email: u.email,
      givenName: u.givenName,
      familyName: u.familyName,
      passwordHash: await hashPasswordScrypt(u.password),
      disabled: false,
      deleted: false,
    })),
  );

export const productSeeds = [
  {
    name: 'Demo Product',
    // Initial available quantity for the flash sale
    quantity: 100,
    disabled: false,
  },
];
