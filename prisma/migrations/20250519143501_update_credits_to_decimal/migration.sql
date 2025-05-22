-- Update User.credits to use Decimal type with 2 decimal places
ALTER TABLE "User" ALTER COLUMN "credits" TYPE DECIMAL(10,2) USING (credits::DECIMAL(10,2));
-- Default value for all existing users is set to 3.00 if it was 3
UPDATE "User" SET "credits" = 3.00 WHERE "credits" = 3;