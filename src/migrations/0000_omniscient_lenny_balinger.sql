CREATE TABLE "orders" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"type" varchar(20) NOT NULL,
	"side" varchar(10) NOT NULL,
	"token" varchar(20) NOT NULL,
	"amount" numeric NOT NULL,
	"status" varchar(20) DEFAULT 'pending',
	"tx_hash" varchar(100),
	"execution_price" numeric,
	"logs" jsonb DEFAULT '[]'::jsonb,
	"created_at" timestamp DEFAULT now()
);
