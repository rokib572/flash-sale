import type { DbClient } from '@flash-sale/domain-core';
import { getProductById } from '@flash-sale/domain-core';
import type { RequestHandler } from 'express';
import { asyncHandler } from '../utils/async-handler';

export const createProductByIdHandler = (db: DbClient): RequestHandler =>
  asyncHandler(async (req, res) => {
    const { productId } = req.params as { productId: string };
    if (!productId) return res.status(400).json({ error: 'product_id_required' });
    const product = await getProductById(db, { productId });
    if (!product) return res.status(404).json({ error: 'not_found' });
    return res.json({ product });
  });
