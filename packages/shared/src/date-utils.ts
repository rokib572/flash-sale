export type SaleStatus = 'upcoming' | 'active' | 'ended';

const toDate = (v: string | Date): Date => {
  if (v instanceof Date) return v;
  return new Date(v);
};

export const getSaleStatus = (args: {
  start: string | Date;
  end: string | Date;
  now?: Date;
}): SaleStatus => {
  const now = args.now ?? new Date();
  const start = toDate(args.start);
  const end = toDate(args.end);
  if (now < start) return 'upcoming';
  if (now > end) return 'ended';
  return 'active';
};
