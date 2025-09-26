-- Quick fix for community tables
-- Run this in your Supabase SQL Editor

-- Add title column to community_posts if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'community_posts' AND column_name = 'title') THEN
        ALTER TABLE public.community_posts ADD COLUMN title text;
    END IF;
END $$;

-- Add is_anonymous column to community_posts if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'community_posts' AND column_name = 'is_anonymous') THEN
        ALTER TABLE public.community_posts ADD COLUMN is_anonymous boolean DEFAULT true;
    END IF;
END $$;

-- Add is_anonymous column to community_comments if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'community_comments' AND column_name = 'is_anonymous') THEN
        ALTER TABLE public.community_comments ADD COLUMN is_anonymous boolean DEFAULT false;
    END IF;
END $$;

-- Add updated_at columns if they don't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'community_posts' AND column_name = 'updated_at') THEN
        ALTER TABLE public.community_posts ADD COLUMN updated_at timestamptz DEFAULT now();
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'community_comments' AND column_name = 'updated_at') THEN
        ALTER TABLE public.community_comments ADD COLUMN updated_at timestamptz DEFAULT now();
    END IF;
END $$;

-- Update existing posts to extract titles from content
UPDATE public.community_posts 
SET title = split_part(content, E'\n\n', 1)
WHERE title IS NULL OR title = '';

-- Make title NOT NULL after updating existing data
ALTER TABLE public.community_posts ALTER COLUMN title SET NOT NULL;

