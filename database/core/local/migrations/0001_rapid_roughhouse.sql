ALTER TABLE "core_data"."orders" RENAME COLUMN "flash_sale_id" TO "fk_flash_sale_id";--> statement-breakpoint
ALTER TABLE "core_data"."orders" DROP CONSTRAINT "orders_flash_sale_id_flash_sales_id_fk";
--> statement-breakpoint
DROP INDEX "core_data"."orders_user_id_flash_sale_id_index";--> statement-breakpoint
DROP INDEX "core_data"."orders_flash_sale_id_index";--> statement-breakpoint
ALTER TABLE "core_data"."orders" ADD COLUMN "fk_product_id" char(26) NOT NULL;--> statement-breakpoint
ALTER TABLE "core_data"."orders" ADD CONSTRAINT "orders_fk_flash_sale_id_flash_sales_id_fk" FOREIGN KEY ("fk_flash_sale_id") REFERENCES "core_data"."flash_sales"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "core_data"."orders" ADD CONSTRAINT "orders_fk_product_id_products_id_fk" FOREIGN KEY ("fk_product_id") REFERENCES "core_data"."products"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "orders_user_id_fk_flash_sale_id_index" ON "core_data"."orders" USING btree ("user_id","fk_flash_sale_id");--> statement-breakpoint
CREATE INDEX "orders_fk_flash_sale_id_index" ON "core_data"."orders" USING btree ("fk_flash_sale_id");