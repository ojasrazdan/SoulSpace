-- Revert community tables to original working state
-- Run this in your Supabase SQL Editor

-- Drop the extra columns that were added
ALTER TABLE public.community_posts DROP COLUMN IF EXISTS title;
ALTER TABLE public.community_posts DROP COLUMN IF EXISTS is_anonymous;
ALTER TABLE public.community_posts DROP COLUMN IF EXISTS updated_at;

ALTER TABLE public.community_comments DROP COLUMN IF EXISTS is_anonymous;
ALTER TABLE public.community_comments DROP COLUMN IF EXISTS updated_at;

-- The tables should now be back to the original working state:
-- community_posts: id, author_id, content, created_at
-- community_comments: id, post_id, author_id, content, created_at
