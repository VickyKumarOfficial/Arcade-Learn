import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Supabase Admin Client (for backend operations)
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

// Routes
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'ArcadeLearn Backend is running!' });
});

// User progress routes
app.get('/api/user/:userId/progress', async (req, res) => {
  try {
    const { userId } = req.params;
    
    const { data, error } = await supabaseAdmin
      .from('user_game_data')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      throw error;
    }

    if (!data) {
      // Create default user game data if doesn't exist
      const defaultData = {
        user_id: userId,
        total_xp: 0,
        level: 1,
        current_streak: 0,
        longest_streak: 0,
        last_active_date: new Date().toISOString(),
        total_components_completed: 0,
        completed_roadmaps: [],
        completed_components: []
      };

      const { data: newData, error: createError } = await supabaseAdmin
        .from('user_game_data')
        .insert(defaultData)
        .select()
        .single();

      if (createError) {
        throw createError;
      }

      return res.json(newData);
    }

    res.json(data);
  } catch (error) {
    console.error('Error fetching user progress:', error);
    res.status(500).json({ error: 'Failed to fetch user progress' });
  }
});

// Update user progress
app.put('/api/user/:userId/progress', async (req, res) => {
  try {
    const { userId } = req.params;
    const progressData = req.body;

    const { data, error } = await supabaseAdmin
      .from('user_game_data')
      .update({
        ...progressData,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      throw error;
    }

    res.json(data);
  } catch (error) {
    console.error('Error updating user progress:', error);
    res.status(500).json({ error: 'Failed to update user progress' });
  }
});

// Get user achievements
app.get('/api/user/:userId/achievements', async (req, res) => {
  try {
    const { userId } = req.params;
    
    const { data, error } = await supabaseAdmin
      .from('user_achievements')
      .select('*')
      .eq('user_id', userId);

    if (error) {
      throw error;
    }

    res.json(data || []);
  } catch (error) {
    console.error('Error fetching user achievements:', error);
    res.status(500).json({ error: 'Failed to fetch user achievements' });
  }
});

// Unlock achievement for user
app.post('/api/user/:userId/achievements', async (req, res) => {
  try {
    const { userId } = req.params;
    const { achievementId } = req.body;

    const { data, error } = await supabaseAdmin
      .from('user_achievements')
      .insert({
        user_id: userId,
        achievement_id: achievementId,
        unlocked_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    res.json(data);
  } catch (error) {
    console.error('Error unlocking achievement:', error);
    res.status(500).json({ error: 'Failed to unlock achievement' });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.listen(PORT, () => {
  console.log(`🚀 ArcadeLearn Backend running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
});
