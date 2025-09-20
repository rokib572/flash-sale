import type { DbClient } from '@flash-sale/domain-core';
import { getFlashSaleByProductId } from '@flash-sale/domain-core';
import { Router } from 'express';
import { jwtOptional } from '../middleware/jwt';

export const createFlashSaleRouter = (db: DbClient) => {
  const router = Router();

  // Parse JWT if present, attach identity (non-blocking)
  router.use(jwtOptional());

  // GET /flash-sales/:productId/status
  router.get('/:productId/status', async (req, res, next) => {
    try {
      const { productId } = req.params as { productId: string };
      if (!productId) return res.status(400).json({ error: 'product_id_required' });

      const sale = await getFlashSaleByProductId(db, { productId });
      if (!sale) {
        // Short cache for negative lookups to absorb bursts
        res.setHeader('Cache-Control', 'public, max-age=5, stale-while-revalidate=30');
        return res.status(404).json({ status: 'not_found' });
      }

      const now = new Date();
      let status: 'upcoming' | 'active' | 'ended';
      if (now < sale.startDate) status = 'upcoming';
      else if (now > sale.endDate) status = 'ended';
      else status = 'active';

      // Cache briefly to handle spikes without stale data
      const ttl = Number(process.env.STATUS_TTL_SECONDS || 1);
      res.setHeader('Cache-Control', `public, max-age=${ttl}, stale-while-revalidate=30`);

      return res.json({
        status,
        now: now.toISOString(),
        sale: {
          id: sale.id,
          name: sale.name,
          description: sale.description,
          productId: sale.productId,
          startDate: sale.startDate.toISOString(),
          endDate: sale.endDate.toISOString(),
        },
      });
    } catch (err) {
      next(err);
    }
  });

  return router;
};
