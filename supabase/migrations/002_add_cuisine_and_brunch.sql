-- Add cuisine column to dishes table
ALTER TABLE dishes
ADD COLUMN IF NOT EXISTS cuisine TEXT CHECK (cuisine IN ('asian', 'european', 'slavic', NULL));

-- Update category constraint to include brunch
ALTER TABLE dishes
DROP CONSTRAINT IF EXISTS dishes_category_check;

ALTER TABLE dishes
ADD CONSTRAINT dishes_category_check
CHECK (category IN ('breakfast', 'lunch', 'dinner', 'brunch'));

-- Create index on cuisine for faster queries
CREATE INDEX IF NOT EXISTS idx_dishes_cuisine ON dishes(cuisine);

-- Migrate existing breakfast and lunch to brunch (optional, can be done manually)
-- UPDATE dishes SET category = 'brunch' WHERE category IN ('breakfast', 'lunch');
