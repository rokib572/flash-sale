-- Migrate flash_sales start_date and end_date to timestamptz (UTC)
-- Assumes server timezone is UTC so values are treated as UTC.
ALTER TABLE "core_data"."flash_sales"
  ALTER COLUMN "start_date" TYPE timestamptz USING "start_date" AT TIME ZONE 'UTC';
ALTER TABLE "core_data"."flash_sales"
  ALTER COLUMN "end_date" TYPE timestamptz USING "end_date" AT TIME ZONE 'UTC';

