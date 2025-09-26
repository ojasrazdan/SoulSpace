import { supabase as supabaseClient } from './supabaseClient';

export interface CommunityPost {
  id: string;
  title: string;
  content: string;
  author_id: string;
  created_at: string;
  updated_at: string;
  is_anonymous: boolean;
  likes_count: number;
  comments_count: number;
  author_name?: string;
}

export interface CommunityComment {
  id: string;
  post_id: string;
  content: string;
  author_id: string;
  created_at: string;
  updated_at: string;
  is_anonymous: boolean;
  author_name?: string;
}

export interface CommunityLike {
  post_id: string;
  user_id: string;
  created_at: string;
}

// Get all community posts with author info and counts
export async function getCommunityPosts(): Promise<CommunityPost[]> {
  try {
    const { data, error } = await supabaseClient
      .from('community_posts')
      .select(`
        *,
        community_likes (post_id),
        community_comments (id)
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching posts:', error);
      throw error;
    }

    console.log('Fetched posts:', data);

    return data.map(post => {
      // Extract title from content
      const contentParts = post.content.split('\n\n');
      const extractedTitle = contentParts[0] || 'Untitled Post';
      const extractedContent = contentParts.slice(1).join('\n\n') || post.content;

      return {
        id: post.id,
        title: extractedTitle,
        content: extractedContent,
        author_id: post.author_id,
        created_at: post.created_at,
        updated_at: post.created_at,
        is_anonymous: true,
        likes_count: post.community_likes?.length || 0,
        comments_count: post.community_comments?.length || 0,
        author_name: 'Anonymous'
      };
    });
  } catch (error) {
    console.error('Error fetching community posts:', error);
    throw error;
  }
}

// Get a single post with comments
export async function getPostWithComments(postId: string): Promise<{
  post: CommunityPost;
  comments: CommunityComment[];
}> {
  try {
    // Get post
    const { data: postData, error: postError } = await supabaseClient
      .from('community_posts')
      .select(`
        *,
        community_likes (post_id),
        community_comments (id)
      `)
      .eq('id', postId)
      .single();

    if (postError) throw postError;

    // Get comments
    const { data: commentsData, error: commentsError } = await supabaseClient
      .from('community_comments')
      .select('*')
      .eq('post_id', postId)
      .order('created_at', { ascending: true });

    if (commentsError) throw commentsError;

    // Extract title from content
    const contentParts = postData.content.split('\n\n');
    const extractedTitle = contentParts[0] || 'Untitled Post';
    const extractedContent = contentParts.slice(1).join('\n\n') || postData.content;

    const post: CommunityPost = {
      id: postData.id,
      title: extractedTitle,
      content: extractedContent,
      author_id: postData.author_id,
      created_at: postData.created_at,
      updated_at: postData.created_at,
      is_anonymous: true,
      likes_count: postData.community_likes?.length || 0,
      comments_count: postData.community_comments?.length || 0,
      author_name: 'Anonymous'
    };

    const comments: CommunityComment[] = commentsData.map(comment => ({
      id: comment.id,
      post_id: comment.post_id,
      content: comment.content,
      author_id: comment.author_id,
      created_at: comment.created_at,
      updated_at: comment.created_at,
      is_anonymous: false,
      author_name: 'User'
    }));

    return { post, comments };
  } catch (error) {
    console.error('Error fetching post with comments:', error);
    throw error;
  }
}

// Create a new post
export async function createPost(
  title: string,
  content: string,
  isAnonymous: boolean = true
): Promise<CommunityPost> {
  try {
    console.log('createPost called with:', { title, content, isAnonymous });
    
    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) {
      console.error('No authenticated user found');
      throw new Error('User not authenticated');
    }

    console.log('User authenticated:', user.id);

    const postData = {
      content: `${title.trim()}\n\n${content.trim()}`,
      author_id: user.id
    };
    
    console.log('Inserting post data:', postData);

    const { data, error } = await supabaseClient
      .from('community_posts')
      .insert(postData)
      .select('*')
      .single();

    if (error) {
      console.error('Database error creating post:', error);
      console.error('Error details:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      });
      throw new Error(`Database error: ${error.message}`);
    }

    console.log('Post created successfully in database:', data);

    // Extract title from content
    const contentParts = data.content.split('\n\n');
    const extractedTitle = contentParts[0] || 'Untitled';
    const extractedContent = contentParts.slice(1).join('\n\n') || data.content;

    const result = {
      id: data.id,
      title: extractedTitle,
      content: extractedContent,
      author_id: data.author_id,
      created_at: data.created_at,
      updated_at: data.created_at,
      is_anonymous: true,
      likes_count: 0,
      comments_count: 0,
      author_name: 'Anonymous'
    };

    console.log('Returning post result:', result);
    return result;
  } catch (error) {
    console.error('Error in createPost function:', error);
    console.error('Error stack:', error.stack);
    throw error;
  }
}

// Add a comment to a post
export async function addComment(
  postId: string,
  content: string,
  isAnonymous: boolean = false
): Promise<CommunityComment> {
  try {
    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabaseClient
      .from('community_comments')
      .insert({
        post_id: postId,
        content: content.trim(),
        author_id: user.id
      })
      .select('*')
      .single();

    if (error) throw error;

    return {
      id: data.id,
      post_id: data.post_id,
      content: data.content,
      author_id: data.author_id,
      created_at: data.created_at,
      updated_at: data.created_at,
      is_anonymous: false,
      author_name: 'User' // Simple name for now
    };
  } catch (error) {
    console.error('Error adding comment:', error);
    throw error;
  }
}

// Like/unlike a post
export async function toggleLike(postId: string): Promise<{ liked: boolean; likesCount: number }> {
  try {
    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // Check if user already liked this post
    const { data: existingLike, error: checkError } = await supabaseClient
      .from('community_likes')
      .select('post_id')
      .eq('post_id', postId)
      .eq('user_id', user.id)
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      throw checkError;
    }

    if (existingLike) {
      // Unlike the post
      const { error: deleteError } = await supabaseClient
        .from('community_likes')
        .delete()
        .eq('post_id', postId)
        .eq('user_id', user.id);

      if (deleteError) throw deleteError;

      // Get updated likes count
      const { count } = await supabaseClient
        .from('community_likes')
        .select('*', { count: 'exact', head: true })
        .eq('post_id', postId);

      return { liked: false, likesCount: count || 0 };
    } else {
      // Like the post
      const { error: insertError } = await supabaseClient
        .from('community_likes')
        .insert({
          post_id: postId,
          user_id: user.id
        });

      if (insertError) throw insertError;

      // Get updated likes count
      const { count } = await supabaseClient
        .from('community_likes')
        .select('*', { count: 'exact', head: true })
        .eq('post_id', postId);

      return { liked: true, likesCount: count || 0 };
    }
  } catch (error) {
    console.error('Error toggling like:', error);
    throw error;
  }
}

// Check if user has liked a post
export async function hasUserLiked(postId: string): Promise<boolean> {
  try {
    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) return false;

    const { data, error } = await supabaseClient
      .from('community_likes')
      .select('post_id')
      .eq('post_id', postId)
      .eq('user_id', user.id)
      .single();

    return !error && !!data;
  } catch (error) {
    return false;
  }
}

// Delete a post (only by author)
export async function deletePost(postId: string): Promise<void> {
  try {
    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { error } = await supabaseClient
      .from('community_posts')
      .delete()
      .eq('id', postId)
      .eq('author_id', user.id);

    if (error) throw error;
  } catch (error) {
    console.error('Error deleting post:', error);
    throw error;
  }
}

// Delete a comment (only by author)
export async function deleteComment(commentId: string): Promise<void> {
  try {
    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { error } = await supabaseClient
      .from('community_comments')
      .delete()
      .eq('id', commentId)
      .eq('author_id', user.id);

    if (error) throw error;
  } catch (error) {
    console.error('Error deleting comment:', error);
    throw error;
  }
}
