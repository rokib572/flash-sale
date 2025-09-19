import { z } from 'zod';

const postgresErrorSchema = z.object({
  code: z.string(),
  constraint_name: z.string().optional(),
  detail: z.string(),
  file: z.string().optional(),
  name: z.string(),
  routine: z.string().optional(),
  schema_name: z.string().optional(),
  severity: z.string(),
  severity_local: z.string(),
  table_name: z.string().optional(),
  line: z.string().optional(),
});

const _databaseErrorSchema = z.object({
  query: z.string(),
  params: z.array(z.unknown()),
  cause: postgresErrorSchema,
});

export type DatabaseError = z.infer<typeof _databaseErrorSchema>;
export const parseDatabaseError = (error: unknown) => {
  const result = _databaseErrorSchema.safeParse(error);
  if (result.success) return result.data;
  return undefined;
};
