import type { RequestHandler } from 'express';
import { z } from 'zod';
import type { DbClient } from '@flash-sale/domain-core';
import { authenticateUser } from '@flash-sale/domain-core';
import { asyncHandler } from '../utils/async-handler';
import { makeUnsignedJwt } from '../../middleware/jwt/jwt.authenticate';

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const createUserAuthenticateHandler = (db: DbClient): RequestHandler =>
  asyncHandler(async (req, res) => {
    const parse = LoginSchema.safeParse(req.body);
    if (!parse.success) return res.status(400).json({ error: 'invalid_body' });
    const { email, password } = parse.data;

    const user = await authenticateUser(db, { email, password });
    const iat = Math.floor(Date.now() / 1000);
    const ttl = Number(process.env.AUTH_TOKEN_TTL_SECONDS || '3600');
    const exp = iat + ttl;
    const token = makeUnsignedJwt({ sub: user.id, email: user.email, iat, exp });

    return res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        givenName: user.givenName,
        familyName: user.familyName,
      },
    });
  });
