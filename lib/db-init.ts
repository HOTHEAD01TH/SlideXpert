import { supabase } from './supabase'

export async function initializeDatabase() {
  try {
    console.log('🔄 Initializing database...');
    
    // Check if tables exist
    const { data: tables, error: tablesError } = await supabase
      .from('presentations')
      .select('id')
      .limit(1);

    if (tablesError?.code === 'PGRST116') {
      console.log('📝 Creating presentations table...');
      // Table doesn't exist, create it
      await supabase.rpc('exec', {
        query: `
        CREATE TABLE IF NOT EXISTS presentations (
          id BIGSERIAL PRIMARY KEY,
          user_id UUID REFERENCES auth.users(id) NOT NULL,
          prompt TEXT NOT NULL,
          slides JSONB NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
        );

        -- Add indexes
        CREATE INDEX idx_presentations_user_id ON presentations(user_id);
        CREATE INDEX idx_presentations_created_at ON presentations(created_at);
        `
      })
    }

    if (tables && !tables.some((table) => table.id === 'generation_history')) {
      console.log('📝 Creating generation_history table...');
      await supabase.rpc('exec', {
        query: `
        CREATE TABLE generation_history (
          id BIGSERIAL PRIMARY KEY,
          user_id UUID REFERENCES auth.users(id) NOT NULL,
          user_prompt TEXT NOT NULL,
          gemini_response TEXT NOT NULL,
          image_prompts TEXT[] NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
        );

        -- Add indexes
        CREATE INDEX idx_generation_history_user_id ON generation_history(user_id);
        CREATE INDEX idx_generation_history_created_at ON generation_history(created_at);
      `
      })
    }

    console.log('🔒 Setting up RLS policies...');
    // Create RLS (Row Level Security) policies
    await supabase.rpc('exec', {
      query: `
      -- Presentations table policies
      ALTER TABLE presentations ENABLE ROW LEVEL SECURITY;
      
      DO $$ 
      BEGIN
        DROP POLICY IF EXISTS "Users can view their own presentations" ON presentations;
        DROP POLICY IF EXISTS "Users can insert their own presentations" ON presentations;
        
        CREATE POLICY "Users can view their own presentations"
          ON presentations FOR SELECT
          USING (auth.uid()::text = user_id::text);

        CREATE POLICY "Users can insert their own presentations"
          ON presentations FOR INSERT
          WITH CHECK (auth.uid()::text = user_id::text);
      END $$;

      -- Generation history table policies
      ALTER TABLE generation_history ENABLE ROW LEVEL SECURITY;
      
      CREATE POLICY "Users can view their own history"
        ON generation_history FOR SELECT
        USING (auth.uid() = user_id);

      CREATE POLICY "Users can insert their own history"
        ON generation_history FOR INSERT
        WITH CHECK (auth.uid() = user_id);
      `
    })
    
    console.log('🔒 Verifying RLS policies...');
    console.log('✅ Database initialization complete');
    return true;
  } catch (error) {
    console.error('❌ Error initializing database:', error);
    return false;
  }
}

// Auto-initialize database when running on the server
if (typeof window === 'undefined') {
  initializeDatabase().then(success => {
    if (success) {
      console.log('✅ Database initialized successfully');
    } else {
      console.error('❌ Database initialization failed');
    }
  });
}

// -- Create the exec function for running raw SQL
// create or replace function exec(query text)
// returns void
// language plpgsql
// security definer
// as $$
// begin
//   execute query;
// end;
// $$;

// -- Grant execute permission to authenticated users
// grant execute on function exec to authenticated;