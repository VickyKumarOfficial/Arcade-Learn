-- =====================================================
-- ArcadeLearn Resume Database Schema for Supabase
-- Purpose: Store parsed resume data for users
-- =====================================================

-- 1. Parsed Resumes Table (Main table storing user resume data)
CREATE TABLE parsed_resumes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Resume metadata
    file_name TEXT NOT NULL,
    file_size INTEGER NOT NULL, -- in bytes
    file_url TEXT, -- Storage URL if we store the original PDF
    
    -- Parsed resume data (JSONB for flexibility)
    resume_data JSONB NOT NULL,
    
    -- Parsing metadata
    parser_version VARCHAR(10) DEFAULT 'v1.0',
    parsing_accuracy_score INTEGER CHECK (parsing_accuracy_score BETWEEN 0 AND 100),
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Only one active resume per user (can be changed to allow multiple)
    is_active BOOLEAN DEFAULT TRUE,
    
    -- Constraints
    CONSTRAINT valid_resume_data CHECK (jsonb_typeof(resume_data) = 'object')
);

-- 2. Resume Edit History (Track changes to resume data)
CREATE TABLE resume_edit_history (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    resume_id UUID NOT NULL REFERENCES parsed_resumes(id) ON DELETE CASCADE,
    
    -- What changed
    field_path TEXT NOT NULL, -- e.g., 'profile.name', 'workExperiences[0].company'
    old_value TEXT,
    new_value TEXT,
    
    -- When and why
    edited_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    edit_reason VARCHAR(50) DEFAULT 'manual_edit', -- manual_edit, ai_suggestion, auto_correction
    
    -- Track who made the edit (for future admin features)
    edited_by UUID REFERENCES auth.users(id)
);

-- 3. Indexes for Performance
CREATE INDEX idx_parsed_resumes_user_id ON parsed_resumes(user_id);
CREATE INDEX idx_parsed_resumes_active ON parsed_resumes(user_id, is_active) WHERE is_active = TRUE;
CREATE INDEX idx_parsed_resumes_created_at ON parsed_resumes(created_at DESC);
CREATE INDEX idx_resume_edit_history_resume_id ON resume_edit_history(resume_id);

-- 4. Row Level Security (RLS) Policies
ALTER TABLE parsed_resumes ENABLE ROW LEVEL SECURITY;
ALTER TABLE resume_edit_history ENABLE ROW LEVEL SECURITY;

-- Users can only view their own resumes
CREATE POLICY "Users can view own resumes" ON parsed_resumes
    FOR SELECT
    USING (auth.uid() = user_id);

-- Users can insert their own resumes
CREATE POLICY "Users can insert own resumes" ON parsed_resumes
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Users can update their own resumes
CREATE POLICY "Users can update own resumes" ON parsed_resumes
    FOR UPDATE
    USING (auth.uid() = user_id);

-- Users can delete their own resumes
CREATE POLICY "Users can delete own resumes" ON parsed_resumes
    FOR DELETE
    USING (auth.uid() = user_id);

-- Users can only view their own edit history
CREATE POLICY "Users can view own edit history" ON resume_edit_history
    FOR SELECT
    USING (edited_by = auth.uid() OR EXISTS (
        SELECT 1 FROM parsed_resumes 
        WHERE id = resume_edit_history.resume_id 
        AND user_id = auth.uid()
    ));

-- Users can insert edit history for their own resumes
CREATE POLICY "Users can insert edit history" ON resume_edit_history
    FOR INSERT
    WITH CHECK (EXISTS (
        SELECT 1 FROM parsed_resumes 
        WHERE id = resume_edit_history.resume_id 
        AND user_id = auth.uid()
    ));

-- 5. Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_resume_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_resume_timestamp
    BEFORE UPDATE ON parsed_resumes
    FOR EACH ROW
    EXECUTE FUNCTION update_resume_updated_at();

-- 6. Useful Views for Analytics (Optional)
CREATE VIEW v_user_resume_stats AS
SELECT 
    user_id,
    COUNT(*) as total_resumes,
    COUNT(CASE WHEN is_active THEN 1 END) as active_resumes,
    MAX(created_at) as latest_resume_date,
    AVG(parsing_accuracy_score) as avg_parsing_accuracy
FROM parsed_resumes
GROUP BY user_id;

-- 7. Function to get user's active resume
CREATE OR REPLACE FUNCTION get_active_resume(p_user_id UUID)
RETURNS TABLE (
    id UUID,
    file_name TEXT,
    resume_data JSONB,
    created_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        pr.id,
        pr.file_name,
        pr.resume_data,
        pr.created_at,
        pr.updated_at
    FROM parsed_resumes pr
    WHERE pr.user_id = p_user_id 
    AND pr.is_active = TRUE
    ORDER BY pr.updated_at DESC
    LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
