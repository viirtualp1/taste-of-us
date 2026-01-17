-- Create dishes table
CREATE TABLE IF NOT EXISTS dishes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('breakfast', 'lunch', 'dinner')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create schedules table
CREATE TABLE IF NOT EXISTS schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  week_start DATE NOT NULL,
  menu_data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(week_start)
);

-- Create unique constraint on dishes (name, category) to prevent duplicates
CREATE UNIQUE INDEX IF NOT EXISTS idx_dishes_name_category ON dishes(name, category);

-- Create index on dishes category for faster queries
CREATE INDEX IF NOT EXISTS idx_dishes_category ON dishes(category);

-- Create index on schedules week_start for faster queries
CREATE INDEX IF NOT EXISTS idx_schedules_week_start ON schedules(week_start);

-- Enable Row Level Security (RLS)
ALTER TABLE dishes ENABLE ROW LEVEL SECURITY;
ALTER TABLE schedules ENABLE ROW LEVEL SECURITY;

-- Create policies for dishes (allow all operations for now, can be restricted later)
CREATE POLICY "Allow all operations on dishes" ON dishes
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Create policies for schedules (allow all operations for now, can be restricted later)
CREATE POLICY "Allow all operations on schedules" ON schedules
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers to automatically update updated_at
CREATE TRIGGER update_dishes_updated_at
  BEFORE UPDATE ON dishes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_schedules_updated_at
  BEFORE UPDATE ON schedules
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
