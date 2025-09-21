import type { RequestHandler } from 'express';
import { z } from 'zod';
import type { DbClient } from '@flash-sale/domain-core';
import { createFlashSale } from '@flash-sale/domain-core';
import { asyncHandler } from '../utils/async-handler';
import { DomainError } from '@flash-sale/shared';

const BodySchema = z.object({
  name: z.string().min(1).max(256),
  description: z.string().min(1).max(512),
  productId: z.string().min(1),
  startDate: z.string().datetime().or(z.string().min(1)),
  endDate: z.string().datetime().or(z.string().min(1)),
});

export const createFlashSaleCreateHandler = (db: DbClient): RequestHandler =>
  asyncHandler(async (req, res) => {
    const parsed = BodySchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: 'invalid_body', issues: parsed.error.issues });
    }

    const { name, description, productId } = parsed.data;
    const start = new Date(parsed.data.startDate);
    const end = new Date(parsed.data.endDate);

    try {
      const flashSale = await createFlashSale(db, {
        flashSaleData: { name, description, productId, startDate: start, endDate: end },
      });
      return res.status(201).json({ flashSale });
    } catch (err) {
      const maybe = err as any;
      if (maybe && typeof maybe === 'object' && typeof maybe.code === 'string') {
        const map: Record<string, number> = {
          BAD_REQUEST: 400,
          UNPROCESSABLE_CONTENT: 422,
          NOT_FOUND: 404,
          UNAUTHORISED: 401,
          HTTP_ERROR: 400,
          INTERNAL_ERROR: 500,
        };
        const status = map[maybe.code] ?? 400;
        return res
          .status(status)
          .json({ error: String(maybe.code).toLowerCase(), message: maybe.clientSafeMessage || maybe.message });
      }
      throw err;
    }
  });
