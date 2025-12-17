-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "billingJson" JSONB,
ADD COLUMN     "currency" TEXT NOT NULL DEFAULT 'usd',
ADD COLUMN     "shippingJson" JSONB,
ADD COLUMN     "totalCents" INTEGER NOT NULL DEFAULT 0;
