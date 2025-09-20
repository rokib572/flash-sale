import type { DbClient } from '@flash-sale/domain-core';
import { getFlashSaleByProductId } from '@flash-sale/domain-core';
import type { RequestHandler } from 'express';
import { asyncHandler } from '../utils/async-handler';

export const createFlashSaleCheckStatusHandler = (db: DbClient): RequestHandler =>
  asyncHandler(async (req, res) => {
    const { productId } = req.params;
    if (!productId) return res.status(400).json({ error: 'product_id_required' });

    const flashSaleData = await getFlashSaleByProductId(db, { productId });
    if (!flashSaleData) return res.status(404).json({ status: 'not_found' });
    const { startDate, endDate } = flashSaleData;
    return res.json({
      status: getStatus({ startDate, endDate }),
      responseDateTime: new Date().toISOString(),
      sale: {
        ...flashSaleData,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      },
    });
  });

const getStatus = ({ startDate, endDate }: { startDate: Date; endDate: Date }) => {
  const now = new Date();
  if (now < startDate) return 'upcoming';
  if (now > endDate) return 'ended';

  return 'active';
};
