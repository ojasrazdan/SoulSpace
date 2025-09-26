-- Update Community Tables for Anonymous Posting
-- Run this in your Supabase SQL Editor

-- Add missing columns to community_posts
ALTER TABLE public.community_posts ADD COLUMN IF NOT EXISTS title text;
ALTER TABLE public.community_posts ADD COLUMN IF NOT EXISTS is_anonymous boolean DEFAULT true;
ALTER TABLE public.community_posts ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

-- Add missing columns to community_comments  
ALTER TABLE public.community_comments ADD COLUMN IF NOT EXISTS is_anonymous boolean DEFAULT false;
ALTER TABLE public.community_comments ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

-- Update existing posts to have titles if they don't
UPDATE public.community_posts 
SET title = 'Untitled Post' 
WHERE title IS NULL OR title = '';

-- Make title column NOT NULL after updating existing data
ALTER TABLE public.community_posts ALTER COLUMN title SET NOT NULL;
