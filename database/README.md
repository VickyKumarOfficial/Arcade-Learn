# 📊 Database Setup Guide - ArcadeLearn Resume Feature

## 🎯 Overview

This directory contains SQL schema files for the ArcadeLearn resume parser and management system. The database stores parsed resume data, tracks editing history, and provides analytics.

## 📁 Files

### `resume_schema.sql`
Complete database schema for resume management including:
- **parsed_resumes**: Main table storing parsed resume data
- **resume_edit_history**: Track all changes made to resumes
- **Indexes**: Optimized for fast queries
- **RLS Policies**: Row-level security for data protection
- **Views**: Analytics and statistics
- **Functions**: Utility functions for common operations

## 🚀 Quick Setup

### Step 1: Access Supabase SQL Editor

1. Go to your [Supabase Dashboard](https://app.supabase.com)
2. Select your project: **ArcadeLearn**
3. Navigate to **SQL Editor** from the left sidebar

### Step 2: Run the Schema

1. Click **New Query**
2. Copy the entire content of `resume_schema.sql`
3. Paste it into the SQL editor
4. Click **Run** or press `Ctrl/Cmd + Enter`

### Step 3: Verify Installation

Run this query to verify tables were created:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('parsed_resumes', 'resume_edit_history');
```

You should see both tables listed.

## 📋 Database Schema

### 1. `parsed_resumes` Table

**Purpose**: Store parsed resume data for each user

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `user_id` | UUID | Foreign key to auth.users |
| `file_name` | TEXT | Original PDF filename |
| `file_size` | INTEGER | File size in bytes |
| `file_url` | TEXT | Storage URL (optional) |
| `resume_data` | JSONB | Complete parsed resume object |
| `parser_version` | VARCHAR(10) | Parser version used (default: 'v1.0') |
| `parsing_accuracy_score` | INTEGER | Accuracy score 0-100 |
| `created_at` | TIMESTAMPTZ | Creation timestamp |
| `updated_at` | TIMESTAMPTZ | Last update timestamp |
| `is_active` | BOOLEAN | Active resume flag |

**Example `resume_data` structure**:
```json
{
  "profile": {
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+91-98765-43210",
    "location": "Mumbai, Maharashtra",
    "url": "linkedin.com/in/johndoe",
    "summary": "Software Engineer with 5 years experience..."
  },
  "educations": [
    {
      "school": "IIT Bombay",
      "degree": "B.Tech in Computer Science",
      "gpa": "8.5",
      "date": "2015 - 2019",
      "descriptions": ["Dean's list 2018", "President of Coding Club"]
    }
  ],
  "workExperiences": [
    {
      "company": "Tech Corp",
      "jobTitle": "Senior Software Engineer",
      "date": "2019 - Present",
      "descriptions": ["Led team of 5 developers", "Built microservices architecture"]
    }
  ],
  "projects": [...],
  "skills": {
    "featuredSkills": ["React", "Node.js", "Python"],
    "descriptions": ["Full-stack development", "Cloud technologies"]
  }
}
```

### 2. `resume_edit_history` Table

**Purpose**: Track all changes made to resume fields

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `resume_id` | UUID | Foreign key to parsed_resumes |
| `field_path` | TEXT | JSON path to edited field |
| `old_value` | TEXT | Previous value |
| `new_value` | TEXT | New value |
| `edited_at` | TIMESTAMPTZ | Edit timestamp |
| `edit_reason` | VARCHAR(50) | Reason for edit |
| `edited_by` | UUID | User who made the edit |

**Example field paths**:
- `profile.name`
- `profile.email`
- `workExperiences[0].company`
- `educations[1].degree`

## 🔒 Security (RLS Policies)

All tables have Row-Level Security (RLS) enabled with the following policies:

### For `parsed_resumes`:
- ✅ Users can **view** only their own resumes
- ✅ Users can **insert** their own resumes
- ✅ Users can **update** their own resumes
- ✅ Users can **delete** their own resumes

### For `resume_edit_history`:
- ✅ Users can **view** edit history of their own resumes
- ✅ Users can **insert** edit history for their own resumes

## 📊 Useful Queries

### Get user's active resume
```sql
SELECT * FROM parsed_resumes 
WHERE user_id = 'YOUR_USER_ID' 
AND is_active = TRUE 
ORDER BY updated_at DESC 
LIMIT 1;
```

### Get all resumes for a user
```sql
SELECT id, file_name, created_at, updated_at, parsing_accuracy_score
FROM parsed_resumes 
WHERE user_id = 'YOUR_USER_ID' 
ORDER BY created_at DESC;
```

### Get resume statistics
```sql
SELECT * FROM v_user_resume_stats 
WHERE user_id = 'YOUR_USER_ID';
```

### Get edit history for a resume
```sql
SELECT field_path, old_value, new_value, edited_at, edit_reason
FROM resume_edit_history 
WHERE resume_id = 'RESUME_ID' 
ORDER BY edited_at DESC;
```

### Get resumes with high accuracy
```sql
SELECT file_name, parsing_accuracy_score, created_at
FROM parsed_resumes 
WHERE parsing_accuracy_score > 80 
ORDER BY parsing_accuracy_score DESC;
```

## 🛠️ Functions

### `get_active_resume(user_id UUID)`
Returns the user's most recently updated active resume.

**Usage**:
```sql
SELECT * FROM get_active_resume('YOUR_USER_ID');
```

### `update_resume_updated_at()`
Trigger function that automatically updates `updated_at` timestamp on resume updates.

## 📈 Views

### `v_user_resume_stats`
Aggregated statistics per user:
- Total resumes count
- Active resumes count
- Latest resume date
- Average parsing accuracy

**Usage**:
```sql
SELECT * FROM v_user_resume_stats WHERE user_id = 'YOUR_USER_ID';
```

## 🔍 Indexes

The schema includes optimized indexes for:
- ✅ Fast user resume lookups: `idx_parsed_resumes_user_id`
- ✅ Active resume queries: `idx_parsed_resumes_active`
- ✅ Recent resumes: `idx_parsed_resumes_created_at`
- ✅ Edit history: `idx_resume_edit_history_resume_id`

## 🧪 Testing

After setup, test the tables with these queries:

```sql
-- Test insert (replace YOUR_USER_ID with actual auth.uid())
INSERT INTO parsed_resumes (user_id, file_name, file_size, resume_data)
VALUES (
  'YOUR_USER_ID',
  'test_resume.pdf',
  1024000,
  '{"profile": {"name": "Test User", "email": "test@example.com"}}'::jsonb
);

-- Test select
SELECT * FROM parsed_resumes WHERE user_id = 'YOUR_USER_ID';

-- Test update
UPDATE parsed_resumes 
SET resume_data = jsonb_set(resume_data, '{profile,name}', '"Updated Name"')
WHERE user_id = 'YOUR_USER_ID';

-- Cleanup test data
DELETE FROM parsed_resumes WHERE file_name = 'test_resume.pdf';
```

## 🐛 Troubleshooting

### Issue: "relation does not exist"
**Solution**: Make sure you ran the schema in the correct database and project.

### Issue: "permission denied"
**Solution**: Check RLS policies. You must be authenticated as the resume owner.

### Issue: "invalid input syntax for type json"
**Solution**: Ensure `resume_data` is valid JSON. Use `::jsonb` casting.

### Issue: "duplicate key value violates unique constraint"
**Solution**: Resume IDs must be unique. Check for existing entries.

## 📚 Integration with Frontend

The TypeScript service `resumeService.ts` provides these methods:

```typescript
import { resumeService } from '@/services/resumeService';

// Save parsed resume
await resumeService.saveResume(userId, resumeData, fileName, fileSize);

// Get active resume
await resumeService.getActiveResume(userId);

// Update resume
await resumeService.updateResume(resumeId, updatedResumeData, userId);

// Delete resume
await resumeService.deleteResume(resumeId, userId);

// Track edits
await resumeService.trackEdit(resumeId, userId, 'profile.name', 'Old Name', 'New Name');

// Export as JSON
resumeService.exportAsJSON(resumeData, 'my_resume');
```

## 🎨 Future Enhancements

Planned features for future versions:
- [ ] Resume templates storage
- [ ] AI-powered resume suggestions
- [ ] Resume comparison analytics
- [ ] Share resume with unique links
- [ ] Version control for resumes
- [ ] Collaborative editing
- [ ] Resume scoring metrics

## 📞 Support

For issues or questions:
1. Check the main README.md
2. Review Supabase documentation
3. Check the SQL error logs in Supabase dashboard
4. Contact the development team

---

**Last Updated**: October 31, 2025  
**Schema Version**: v1.0  
**Maintained By**: ArcadeLearn Team
