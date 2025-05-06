-- Create a function to create the interviews table
CREATE OR REPLACE FUNCTION create_interviews_table()
RETURNS boolean AS $$
BEGIN
  -- Create interviews table if it doesn't exist
  CREATE TABLE IF NOT EXISTS interviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    transcript TEXT,
    feedback JSONB,
    duration INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );

  -- Create index on user_id for faster queries
  CREATE INDEX IF NOT EXISTS idx_interviews_user_id ON interviews(user_id);

  -- Create trigger to update updated_at timestamp
  CREATE OR REPLACE FUNCTION update_updated_at_column()
  RETURNS TRIGGER AS $$
  BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
  END;
  $$ LANGUAGE plpgsql;

  -- Drop the trigger if it exists
  DROP TRIGGER IF EXISTS update_interviews_updated_at ON interviews;
  
  -- Create the trigger
  CREATE TRIGGER update_interviews_updated_at
  BEFORE UPDATE ON interviews
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

  -- Enable RLS on the interviews table
  ALTER TABLE interviews ENABLE ROW LEVEL SECURITY;

  -- Drop existing policies if they exist
  DROP POLICY IF EXISTS select_own_interviews ON interviews;
  DROP POLICY IF EXISTS insert_own_interviews ON interviews;
  DROP POLICY IF EXISTS update_own_interviews ON interviews;
  DROP POLICY IF EXISTS delete_own_interviews ON interviews;

  -- Create RLS policies
  CREATE POLICY select_own_interviews ON interviews
    FOR SELECT
    USING (auth.uid() = user_id);

  CREATE POLICY insert_own_interviews ON interviews
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

  CREATE POLICY update_own_interviews ON interviews
    FOR UPDATE
    USING (auth.uid() = user_id);

  CREATE POLICY delete_own_interviews ON interviews
    FOR DELETE
    USING (auth.uid() = user_id);

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION create_interviews_table() TO authenticated;
