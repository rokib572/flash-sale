import type { DbClient } from '@flash-sale/domain-core';
import { createProduct } from '@flash-sale/domain-core';
import type { RequestHandler } from 'express';
import { z } from 'zod';
import { asyncHandler } from '../utils/async-handler';

// Align with domain constraints: name is a non-empty string (max 256), quantity >= 0
const ProductSchema = z.object({
  name: z.string().min(1).max(256),
  quantity: z.number().int().min(0),
  disabled: z.boolean().optional().default(false),
});

export const createProductHandler = (db: DbClient): RequestHandler =>
  asyncHandler(async (req, res) => {
    const parsed = ProductSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: 'invalid_body', issues: parsed.error.issues });
    }

    const product = await createProduct(db, { productData: parsed.data });
    return res.status(201).json({ product });
  });
