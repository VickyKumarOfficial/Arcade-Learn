-- =====================================================
-- ArcadeLearn Survey Database Schema for Supabase
-- Purpose: Store user survey responses for AI-driven roadmap recommendations
-- =====================================================

-- 1. Survey Responses Table (Main table storing user survey responses)
CREATE TABLE user_survey_responses (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    survey_version VARCHAR(10) DEFAULT 'v1.0' NOT NULL, -- For tracking survey changes over time
    
    -- Response data (JSONB for flexibility and fast queries)
    responses JSONB NOT NULL,
    
    -- Processed data for AI recommendations (computed from responses)
    user_profile JSONB, -- Normalized profile data for AI
    preference_tags TEXT[], -- Array of preference tags for matching
    skill_level_numeric INTEGER CHECK (skill_level_numeric BETWEEN 1 AND 3), -- 1=Beginner, 2=Intermediate, 3=Advanced
    time_commitment_hours INTEGER, -- Weekly hours converted to number
    
    -- Metadata
    completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_latest BOOLEAN DEFAULT TRUE, -- Only one latest response per user
    
    -- Constraints
    CONSTRAINT unique_latest_per_user UNIQUE (user_id, is_latest),
    CONSTRAINT valid_responses CHECK (jsonb_typeof(responses) = 'object')
);

-- 2. Survey Questions Reference Table (For maintaining question consistency)
CREATE TABLE survey_questions (
    id VARCHAR(50) PRIMARY KEY,
    survey_version VARCHAR(10) NOT NULL,
    question_text TEXT NOT NULL,
    question_type VARCHAR(20) CHECK (question_type IN ('single', 'multiple')) NOT NULL,
    options JSONB NOT NULL, -- Array of options
    max_selections INTEGER,
    display_order INTEGER NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. User Recommendation History (Track AI recommendations over time)
CREATE TABLE user_recommendations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    survey_response_id UUID REFERENCES user_survey_responses(id) ON DELETE CASCADE,
    
    -- Recommendation data
    recommended_roadmaps JSONB NOT NULL, -- Array of roadmap IDs with scores
    recommendation_reason JSONB, -- AI explanation for recommendations
    ai_confidence_score DECIMAL(3,2) CHECK (ai_confidence_score BETWEEN 0 AND 1),
    
    -- Tracking
    generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    was_accepted BOOLEAN, -- Did user follow the recommendations?
    feedback_rating INTEGER CHECK (feedback_rating BETWEEN 1 AND 5),
    
    -- Metadata for A/B testing and model versioning
    ai_model_version VARCHAR(20) DEFAULT 'v1.0',
    generation_method VARCHAR(50) DEFAULT 'rule_based' -- rule_based, ml_model, hybrid
);

-- 4. Indexes for Performance
CREATE INDEX idx_user_survey_responses_user_id ON user_survey_responses(user_id);
CREATE INDEX idx_user_survey_responses_latest ON user_survey_responses(user_id, is_latest) WHERE is_latest = TRUE;
CREATE INDEX idx_user_survey_responses_tags ON user_survey_responses USING GIN(preference_tags);
CREATE INDEX idx_user_survey_responses_skill_time ON user_survey_responses(skill_level_numeric, time_commitment_hours);
CREATE INDEX idx_user_survey_responses_profile ON user_survey_responses USING GIN(user_profile);
CREATE INDEX idx_user_recommendations_user_id ON user_recommendations(user_id);
CREATE INDEX idx_user_recommendations_survey_id ON user_recommendations(survey_response_id);

-- 5. Row Level Security (RLS) Policies
ALTER TABLE user_survey_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_recommendations ENABLE ROW LEVEL SECURITY;

-- Users can only access their own survey responses
CREATE POLICY "Users can view own survey responses" ON user_survey_responses
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own survey responses" ON user_survey_responses
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own survey responses" ON user_survey_responses
    FOR UPDATE USING (auth.uid() = user_id);

-- Users can only access their own recommendations
CREATE POLICY "Users can view own recommendations" ON user_recommendations
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Service can insert recommendations" ON user_recommendations
    FOR INSERT WITH CHECK (true); -- Backend service will insert

-- 6. Triggers for automatic data processing
CREATE OR REPLACE FUNCTION update_survey_response_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_survey_timestamp
    BEFORE UPDATE ON user_survey_responses
    FOR EACH ROW EXECUTE FUNCTION update_survey_response_timestamp();

-- Function to ensure only one latest response per user
CREATE OR REPLACE FUNCTION enforce_single_latest_response()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.is_latest = TRUE THEN
        -- Set all other responses for this user to not latest
        UPDATE user_survey_responses 
        SET is_latest = FALSE 
        WHERE user_id = NEW.user_id AND id != NEW.id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_enforce_single_latest
    AFTER INSERT OR UPDATE ON user_survey_responses
    FOR EACH ROW EXECUTE FUNCTION enforce_single_latest_response();

-- 7. Helper Views for AI Analysis
CREATE VIEW v_user_profiles_for_ai AS
SELECT 
    usr.id,
    usr.user_id,
    usr.responses,
    usr.user_profile,
    usr.preference_tags,
    usr.skill_level_numeric,
    usr.time_commitment_hours,
    usr.completed_at,
    -- Extract specific preferences for easy querying
    (usr.responses->>'userType') as user_type,
    (usr.responses->>'skillLevel') as skill_level,
    (usr.responses->>'timeCommitment') as time_commitment,
    (usr.responses->>'wantsRecommendations') as wants_recommendations
FROM user_survey_responses usr
WHERE usr.is_latest = TRUE;

-- Additional helper view for tech interests (separate due to array expansion)
CREATE VIEW v_user_tech_interests AS
SELECT 
    usr.user_id,
    jsonb_array_elements_text(usr.responses->'techInterest') as tech_interest
FROM user_survey_responses usr
WHERE usr.is_latest = TRUE 
AND usr.responses->'techInterest' IS NOT NULL;

-- Additional helper view for goals
CREATE VIEW v_user_goals AS
SELECT 
    usr.user_id,
    jsonb_array_elements_text(usr.responses->'goal') as goal
FROM user_survey_responses usr
WHERE usr.is_latest = TRUE 
AND usr.responses->'goal' IS NOT NULL;

-- Additional helper view for learning styles
CREATE VIEW v_user_learning_styles AS
SELECT 
    usr.user_id,
    jsonb_array_elements_text(usr.responses->'learningStyle') as learning_style
FROM user_survey_responses usr
WHERE usr.is_latest = TRUE 
AND usr.responses->'learningStyle' IS NOT NULL;

-- 8. Insert initial survey questions
INSERT INTO survey_questions (id, survey_version, question_text, question_type, options, max_selections, display_order) VALUES
('userType', 'v1.0', 'What best describes you?', 'single', '["Student", "Teacher", "Working Professional", "Other"]', 1, 1),
('skillLevel', 'v1.0', 'What is your current skill level?', 'single', '["Beginner", "Intermediate", "Advanced"]', 1, 2),
('techInterest', 'v1.0', 'Which tech areas interest you? (Select all that apply)', 'multiple', '["Web Development", "Data Science", "Mobile Apps", "DevOps", "AI/ML", "Cybersecurity", "Game Development", "Not sure yet"]', 4, 3),
('goal', 'v1.0', 'What are your main goals for joining ArcadeLearn? (Select all that apply)', 'multiple', '["Get a job", "Switch careers", "Upskill for current job", "Build a project/startup", "Just exploring", "Learn new technologies"]', 3, 4),
('timeCommitment', 'v1.0', 'How much time can you dedicate weekly?', 'single', '["<5 hours", "5–10 hours", "10+ hours"]', 1, 5),
('learningStyle', 'v1.0', 'What are your preferred learning styles? (Select all that apply)', 'multiple', '["Videos", "Reading", "Projects", "Group learning", "Interactive tutorials", "Practice exercises"]', 3, 6),
('wantsRecommendations', 'v1.0', 'Would you like to receive roadmap recommendations?', 'single', '["Yes", "No"]', 1, 7);

-- 9. Sample data processing function (for AI recommendations)
CREATE OR REPLACE FUNCTION process_survey_response(response_data JSONB)
RETURNS JSONB AS $$
DECLARE
    processed_profile JSONB;
    tags TEXT[];
    skill_numeric INTEGER;
    time_hours INTEGER;
BEGIN
    -- Convert skill level to numeric
    skill_numeric := CASE response_data->>'skillLevel'
        WHEN 'Beginner' THEN 1
        WHEN 'Intermediate' THEN 2
        WHEN 'Advanced' THEN 3
        ELSE 1
    END;
    
    -- Convert time commitment to hours
    time_hours := CASE response_data->>'timeCommitment'
        WHEN '<5 hours' THEN 3
        WHEN '5–10 hours' THEN 7
        WHEN '10+ hours' THEN 15
        ELSE 5
    END;
    
    -- Extract preference tags
    tags := ARRAY[]::TEXT[];
    
    -- Add tech interests as tags
    IF response_data->'techInterest' IS NOT NULL THEN
        SELECT array_agg(value::text) INTO tags
        FROM jsonb_array_elements_text(response_data->'techInterest');
    END IF;
    
    -- Add goals as tags
    IF response_data->'goal' IS NOT NULL THEN
        SELECT tags || array_agg(value::text) INTO tags
        FROM jsonb_array_elements_text(response_data->'goal');
    END IF;
    
    -- Create processed profile
    processed_profile := jsonb_build_object(
        'user_type', response_data->>'userType',
        'skill_level_numeric', skill_numeric,
        'time_commitment_hours', time_hours,
        'wants_recommendations', response_data->>'wantsRecommendations' = 'Yes',
        'tech_interests', response_data->'techInterest',
        'goals', response_data->'goal',
        'learning_styles', response_data->'learningStyle',
        'preference_score', skill_numeric * time_hours -- Simple scoring for AI
    );
    
    RETURN jsonb_build_object(
        'user_profile', processed_profile,
        'preference_tags', tags,
        'skill_level_numeric', skill_numeric,
        'time_commitment_hours', time_hours
    );
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- Schema Summary:
-- =====================================================
-- 1. user_survey_responses: Main table storing survey data
-- 2. survey_questions: Reference table for question definitions
-- 3. user_recommendations: AI-generated recommendations history
-- 4. Indexes: Optimized for AI queries and user lookups
-- 5. RLS: Secure access control
-- 6. Triggers: Automatic data processing
-- 7. Views: AI-friendly data access
-- 8. Functions: Data processing helpers
-- =====================================================