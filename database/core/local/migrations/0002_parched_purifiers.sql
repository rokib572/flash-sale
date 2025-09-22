ALTER TABLE "core_data"."orders" RENAME COLUMN "fk_flash_sale_id" TO "flash_sale_id";--> statement-breakpoint
ALTER TABLE "core_data"."orders" RENAME COLUMN "fk_product_id" TO "product_id";--> statement-breakpoint
ALTER TABLE "core_data"."orders" DROP CONSTRAINT "orders_fk_flash_sale_id_flash_sales_id_fk";
--> statement-breakpoint
ALTER TABLE "core_data"."orders" DROP CONSTRAINT "orders_fk_product_id_products_id_fk";
--> statement-breakpoint
DROP INDEX "core_data"."orders_user_id_fk_flash_sale_id_index";--> statement-breakpoint
DROP INDEX "core_data"."orders_fk_flash_sale_id_index";--> statement-breakpoint
ALTER TABLE "core_data"."orders" ADD CONSTRAINT "orders_flash_sale_id_flash_sales_id_fk" FOREIGN KEY ("flash_sale_id") REFERENCES "core_data"."flash_sales"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "core_data"."orders" ADD CONSTRAINT "orders_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "core_data"."products"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "orders_user_id_flash_sale_id_index" ON "core_data"."orders" USING btree ("user_id","flash_sale_id");--> statement-breakpoint
CREATE INDEX "orders_flash_sale_id_index" ON "core_data"."orders" USING btree ("flash_sale_id");