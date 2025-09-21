CREATE SCHEMA "core_data";
--> statement-breakpoint
CREATE SCHEMA "migration_data";
--> statement-breakpoint
CREATE TABLE "core_data"."flash_sales" (
	"id" char(26) PRIMARY KEY NOT NULL,
	"name" varchar(256) NOT NULL,
	"description" varchar(512) NOT NULL,
	"product_id" varchar(256) NOT NULL,
	"start_date" timestamp NOT NULL,
	"end_date" timestamp NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "flash_sales_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "core_data"."orders" (
	"id" char(26) PRIMARY KEY NOT NULL,
	"user_id" char(26) NOT NULL,
	"flash_sale_id" char(26),
	"quantity" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "core_data"."products" (
	"id" char(26) PRIMARY KEY NOT NULL,
	"name" varchar(256) NOT NULL,
	"quantity" integer NOT NULL,
	"disabled" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "products_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "core_data"."users" (
	"id" char(26) PRIMARY KEY NOT NULL,
	"email" varchar(512) NOT NULL,
	"given_name" varchar(512) NOT NULL,
	"family_name" varchar(512) NOT NULL,
	"password_hash" varchar(255) NOT NULL,
	"disabled" boolean DEFAULT false NOT NULL,
	"deleted" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "core_data"."orders" ADD CONSTRAINT "orders_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "core_data"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "core_data"."orders" ADD CONSTRAINT "orders_flash_sale_id_flash_sales_id_fk" FOREIGN KEY ("flash_sale_id") REFERENCES "core_data"."flash_sales"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "flash_sales_product_id_index" ON "core_data"."flash_sales" USING btree ("product_id");--> statement-breakpoint
CREATE INDEX "flash_sales_product_id_start_date_end_date_index" ON "core_data"."flash_sales" USING btree ("product_id","start_date","end_date");--> statement-breakpoint
CREATE UNIQUE INDEX "orders_user_id_flash_sale_id_index" ON "core_data"."orders" USING btree ("user_id","flash_sale_id");--> statement-breakpoint
CREATE INDEX "orders_user_id_index" ON "core_data"."orders" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "orders_flash_sale_id_index" ON "core_data"."orders" USING btree ("flash_sale_id");--> statement-breakpoint
CREATE UNIQUE INDEX "users_unique_email_idx" ON "core_data"."users" USING btree (lower("email"));