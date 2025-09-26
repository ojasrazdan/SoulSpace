import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { MessageSquare, Rss, Heart, Trash2, Plus, ArrowLeft, Send, Star, Sparkles, Zap, Globe, Layers, Users, MessageCircle, ThumbsUp, Calendar, Clock } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAccessibility } from "@/hooks/AccessibilityContext";
import { getSession } from "@/lib/auth";
import { 
  getCommunityPosts, 
  getPostWithComments, 
  createPost, 
  addComment, 
  toggleLike, 
  hasUserLiked, 
  deletePost, 
  deleteComment,
  type CommunityPost, 
  type CommunityComment 
} from "@/lib/community";
import { motion, useScroll, useTransform, useSpring, useInView } from "framer-motion";
import { useInView as useInViewSpring, animated, useSprings } from "@react-spring/web";
import { useIntersectionObserver } from "react-intersection-observer";
import { gsap } from "gsap";

// Animated Particle Component
const FloatingParticles = () => {
  const particles = Array.from({ length: 30 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 3 + 1,
    delay: Math.random() * 5,
  }));

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute w-1 h-1 bg-gradient-to-r from-amber-400 to-orange-500 rounded-full"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
          }}
          animate={{
            y: [0, -20, 0],
            opacity: [0.3, 0.8, 0.3],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 3 + Math.random() * 2,
            repeat: Infinity,
            delay: particle.delay,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
};

// Morphing Background Component
const MorphingBackground = () => {
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 300], [0, -50]);
  const y2 = useTransform(scrollY, [0, 300], [0, 50]);
  const scale = useTransform(scrollY, [0, 300], [1, 1.1]);

  return (
    <div className="absolute inset-0 overflow-hidden">
      <motion.div
        className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-amber-200/40 to-orange-200/40 rounded-full blur-3xl"
        style={{ y: y1, scale }}
      />
      <motion.div
        className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-rose-200/40 to-pink-200/40 rounded-full blur-3xl"
        style={{ y: y2, scale }}
      />
      <motion.div
        className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-blue-200/30 to-indigo-200/30 rounded-full blur-3xl"
        style={{ scale }}
      />
    </div>
  );
};

// Animated Text Component
const AnimatedText = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

// Staggered Card Animation
const StaggeredCard = ({ children, index }: { children: React.ReactNode; index: number }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 60, scale: 0.9 }}
      animate={isInView ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 60, scale: 0.9 }}
      transition={{ 
        duration: 0.6, 
        delay: index * 0.1,
        ease: "easeOut"
      }}
      whileHover={{ 
        y: -10, 
        scale: 1.02,
        transition: { duration: 0.3 }
      }}
      className="w-full"
    >
      {children}
    </motion.div>
  );
};

const Community = () => {
  const { highContrast, adhdMode } = useAccessibility();
  const navigate = useNavigate();
  const [userId, setUserId] = useState<string | null>(null);
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [selectedPost, setSelectedPost] = useState<CommunityPost | null>(null);
  const [comments, setComments] = useState<CommunityComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);
  const [commenting, setCommenting] = useState(false);
  
  // GSAP refs
  const headerRef = useRef<HTMLDivElement>(null);
  const postsRef = useRef<HTMLDivElement>(null);
  const createPostRef = useRef<HTMLDivElement>(null);
  
  // New post form
  const [newPostTitle, setNewPostTitle] = useState("");
  const [newPostContent, setNewPostContent] = useState("");
  
  // New comment form
  const [newComment, setNewComment] = useState("");

  useEffect(() => {
    loadUserAndPosts();
  }, []);

  // Advanced GSAP animations
  useEffect(() => {
    // Ensure elements are visible by default
    gsap.set(".community-header", { opacity: 1, y: 0 });
    gsap.set(".community-stats", { opacity: 1, y: 0 });
    gsap.set(".community-content", { opacity: 1, y: 0 });

    // Magnetic effect for buttons
    const buttons = document.querySelectorAll('.magnetic-button');
    buttons.forEach(button => {
      button.addEventListener('mousemove', (e) => {
        const rect = button.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        
        gsap.to(button, {
          x: x * 0.1,
          y: y * 0.1,
          duration: 0.3,
          ease: "power2.out"
        });
      });
      
      button.addEventListener('mouseleave', () => {
        gsap.to(button, {
          x: 0,
          y: 0,
          duration: 0.5,
          ease: "elastic.out(1, 0.3)"
        });
      });
    });

  }, [posts]);

  const loadUserAndPosts = async () => {
    try {
      const session = await getSession();
      setUserId(session?.user?.id || null);
      
      const postsData = await getCommunityPosts();
      setPosts(postsData);
    } catch (error) {
      console.error("Failed to load posts:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePost = async () => {
    if (!newPostTitle.trim() || !newPostContent.trim()) return;
    
    try {
      setPosting(true);
      console.log("Creating post:", { title: newPostTitle, content: newPostContent, isAnonymous: true });
      
      const newPost = await createPost(newPostTitle, newPostContent, true);
      console.log("Post created successfully:", newPost);
      
      // Clear the form immediately
      setNewPostTitle("");
      setNewPostContent("");
      
      // Refresh the entire posts list to ensure we have the latest data
      console.log("Refreshing posts list...");
      const updatedPosts = await getCommunityPosts();
      console.log("Posts refreshed:", updatedPosts);
      setPosts(updatedPosts);
      
      console.log("Post creation completed successfully!");
    } catch (error) {
      console.error("Error in handleCreatePost:", error);
      console.error("Error details:", {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
      alert(`Failed to create post: ${error.message}`);
    } finally {
      setPosting(false);
    }
  };

  const handleViewPost = async (post: CommunityPost) => {
    try {
      const { post: postData, comments: commentsData } = await getPostWithComments(post.id);
      setSelectedPost(postData);
      setComments(commentsData);
    } catch (error) {
      console.error("Failed to load post details:", error);
    }
  };

  const handleAddComment = async () => {
    if (!selectedPost || !newComment.trim()) return;
    
    // Check if user is authenticated
    if (!userId) {
      // Redirect to auth page if not signed in
      navigate('/auth');
      return;
    }
    
    try {
      setCommenting(true);
      const newCommentData = await addComment(selectedPost.id, newComment, false);
      setComments([...comments, newCommentData]);
      setNewComment("");
      
      // Update post comments count
      setPosts(posts.map(p => 
        p.id === selectedPost.id 
          ? { ...p, comments_count: p.comments_count + 1 }
          : p
      ));
    } catch (error) {
      console.error("Failed to add comment:", error);
    } finally {
      setCommenting(false);
    }
  };

  const handleToggleLike = async (postId: string) => {
    // Check if user is authenticated
    if (!userId) {
      // Redirect to auth page if not signed in
      navigate('/auth');
      return;
    }

    try {
      const { liked, likesCount } = await toggleLike(postId);
      setPosts(posts.map(p => 
        p.id === postId 
          ? { ...p, likes_count: likesCount }
          : p
      ));
      
      if (selectedPost && selectedPost.id === postId) {
        setSelectedPost({ ...selectedPost, likes_count: likesCount });
      }
    } catch (error) {
      console.error("Failed to toggle like:", error);
    }
  };

  const handleDeletePost = async (postId: string) => {
    try {
      await deletePost(postId);
      setPosts(posts.filter(p => p.id !== postId));
      if (selectedPost && selectedPost.id === postId) {
        setSelectedPost(null);
        setComments([]);
      }
    } catch (error) {
      console.error("Failed to delete post:", error);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    try {
      await deleteComment(commentId);
      setComments(comments.filter(c => c.id !== commentId));
      
      if (selectedPost) {
        setPosts(posts.map(p => 
          p.id === selectedPost.id 
            ? { ...p, comments_count: p.comments_count - 1 }
            : p
        ));
      }
    } catch (error) {
      console.error("Failed to delete comment:", error);
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return `${diffInSeconds}s ago`;
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  };

  if (selectedPost) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-amber-50 overflow-hidden">
        {/* Hero Section */}
        <motion.div 
          className="relative overflow-hidden bg-gradient-to-br from-slate-50 via-white to-amber-50 py-16"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
        >
          {/* Animated Background */}
          <MorphingBackground />
          <FloatingParticles />
          
          <div className="container mx-auto px-4 relative z-10">
            <motion.div 
              className="max-w-4xl mx-auto"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, ease: "easeOut" }}
            >
          {/* Header */}
              <motion.div 
                className="flex items-center justify-between mb-8"
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
            <Button
              variant="outline"
              onClick={() => {
                setSelectedPost(null);
                setComments([]);
              }}
                    className="flex items-center gap-2 border-amber-300 text-amber-700 hover:bg-amber-50 font-body"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Posts
            </Button>
                </motion.div>
              </motion.div>
            </motion.div>
          </div>
        </motion.div>

        {/* Main Content */}
        <div className="container mx-auto px-4 py-20 relative z-10">
          <div className="max-w-4xl mx-auto">

          {/* Post Details */}
            <motion.div
              className="mb-8"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Card className="bg-white/80 backdrop-blur-sm shadow-xl border-0 overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-amber-50 to-orange-50 border-b border-amber-100">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                      <CardTitle className="text-2xl mb-3 font-heading text-gray-900">{selectedPost.title}</CardTitle>
                      <div className="flex items-center gap-4 text-sm text-gray-600 font-body">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          Posted by {selectedPost.author_name}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {formatTimeAgo(selectedPost.created_at)}
                        </span>
                  </div>
                </div>
                {userId === selectedPost.author_id && (
                      <motion.div
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleDeletePost(selectedPost.id)}
                          className="border-red-300 text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                      </motion.div>
                )}
              </div>
            </CardHeader>
                <CardContent className="p-8">
                  <p className="whitespace-pre-wrap leading-relaxed text-gray-700 font-body text-lg mb-6">{selectedPost.content}</p>
              
              {/* Post Actions */}
                  <div className="flex items-center gap-4 pt-6 border-t border-gray-200">
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleToggleLike(selectedPost.id)}
                        className={`flex items-center gap-2 font-body ${
                          selectedPost.user_has_liked 
                            ? 'bg-red-50 border-red-200 text-red-700 hover:bg-red-100' 
                            : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                        }`}
                            title={!userId ? "Sign in to like posts" : ""}
                          >
                        <Heart className={`h-4 w-4 ${selectedPost.user_has_liked ? 'text-red-500 fill-current' : ''}`} />
                            {selectedPost.likes_count} {selectedPost.likes_count === 1 ? 'like' : 'likes'}
                          </Button>
                    </motion.div>
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Badge variant="outline" className="bg-blue-50 border-blue-200 text-blue-700 font-body">
                        <MessageCircle className="h-3 w-3 mr-1" />
                  {selectedPost.comments_count} {selectedPost.comments_count === 1 ? 'comment' : 'comments'}
                </Badge>
                    </motion.div>
              </div>
            </CardContent>
          </Card>
            </motion.div>

          {/* Comments */}
            <motion.div
              className="mb-8"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Card className="bg-white/80 backdrop-blur-sm shadow-xl border-0 overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100">
                  <CardTitle className="flex items-center gap-3 font-heading text-xl">
                    <motion.div
                      className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center"
                      whileHover={{ rotate: 360, scale: 1.1 }}
                      transition={{ duration: 0.6 }}
                    >
                      <MessageCircle className="h-5 w-5 text-white" />
                    </motion.div>
                    Comments
                  </CardTitle>
                  <CardDescription className="font-body text-gray-600">
                    Share your thoughts and join the discussion
                  </CardDescription>
            </CardHeader>
                <CardContent className="p-6">
                  {comments.length === 0 ? (
                    <motion.div
                      className="text-center py-12"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.6 }}
                    >
                      <motion.div
                        className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-6"
                        animate={{ 
                          scale: [1, 1.1, 1],
                          rotate: [0, 5, -5, 0]
                        }}
                        transition={{ 
                          duration: 2,
                          repeat: Infinity,
                          ease: "easeInOut"
                        }}
                      >
                        <MessageCircle className="h-12 w-12 text-gray-400" />
                      </motion.div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-2 font-heading">No Comments Yet</h3>
                      <p className="text-gray-600 font-body">Be the first to share your thoughts!</p>
                    </motion.div>
                  ) : (
                    <div className="space-y-6">
                      {comments.map((comment, index) => (
                        <StaggeredCard key={comment.id} index={index}>
                          <motion.div 
                            className="border border-gray-200 rounded-xl p-6 bg-white/50 backdrop-blur-sm hover:shadow-lg transition-all duration-300 group"
                            whileHover={{ 
                              y: -2, 
                              scale: 1.01,
                              transition: { duration: 0.2 }
                            }}
                          >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                                <div className="flex items-center gap-3 text-sm text-gray-600 font-body mb-3">
                                  <span className="flex items-center gap-1 font-medium">
                                    <Users className="h-4 w-4" />
                                    {comment.author_name}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <Clock className="h-4 w-4" />
                                    {formatTimeAgo(comment.created_at)}
                                  </span>
                      </div>
                                <p className="whitespace-pre-wrap text-gray-700 font-body leading-relaxed">{comment.content}</p>
                    </div>
                    {userId === comment.author_id && (
                                <motion.div
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                >
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleDeleteComment(comment.id)}
                                    className="border-red-300 text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                                </motion.div>
                    )}
                  </div>
                          </motion.div>
                        </StaggeredCard>
                      ))}
                </div>
              )}
            </CardContent>
          </Card>
            </motion.div>

          {/* Add Comment */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
          {userId ? (
                <Card className="bg-white/80 backdrop-blur-sm shadow-xl border-0 overflow-hidden">
                  <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 border-b border-green-100">
                    <CardTitle className="flex items-center gap-3 font-heading text-xl">
                      <motion.div
                        className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center"
                        whileHover={{ rotate: 360, scale: 1.1 }}
                        transition={{ duration: 0.6 }}
                      >
                        <Send className="h-5 w-5 text-white" />
                      </motion.div>
                      Add a Comment
                    </CardTitle>
                    <CardDescription className="font-body text-gray-600">
                      Your comment will show your name
                    </CardDescription>
              </CardHeader>
                  <CardContent className="p-8">
                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2 font-body">Your Comment</label>
                <Textarea
                  placeholder="Share your thoughts..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                          className="min-h-[120px] border-gray-300 focus:border-green-500 focus:ring-green-500 font-body"
                />
                      </div>
                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                <Button
                  onClick={handleAddComment}
                  disabled={!newComment.trim() || commenting}
                          className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-body font-medium py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 magnetic-button"
                        >
                          <motion.div
                  className="flex items-center gap-2"
                            whileHover={{ x: 5 }}
                            transition={{ duration: 0.2 }}
                >
                            <Send className="h-5 w-5" />
                  {commenting ? "Posting..." : "Post Comment"}
                          </motion.div>
                </Button>
                      </motion.div>
                    </div>
              </CardContent>
            </Card>
          ) : (
                <Card className="bg-white/80 backdrop-blur-sm shadow-xl border-0 overflow-hidden">
                  <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 border-b border-green-100">
                    <CardTitle className="flex items-center gap-3 font-heading text-xl">
                      <motion.div
                        className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center"
                        whileHover={{ rotate: 360, scale: 1.1 }}
                        transition={{ duration: 0.6 }}
                      >
                        <Send className="h-5 w-5 text-white" />
                      </motion.div>
                      Add a Comment
                    </CardTitle>
                    <CardDescription className="font-body text-gray-600">
                      Join the discussion by signing in
                    </CardDescription>
              </CardHeader>
                  <CardContent className="p-8">
                    <div className="text-center py-8">
                      <motion.div
                        className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-4"
                        animate={{ 
                          scale: [1, 1.1, 1],
                          rotate: [0, 5, -5, 0]
                        }}
                        transition={{ 
                          duration: 2,
                          repeat: Infinity,
                          ease: "easeInOut"
                        }}
                      >
                        <Send className="h-8 w-8 text-gray-400" />
                      </motion.div>
                      <p className="text-gray-600 mb-6 font-body">Sign in to add comments and join the discussion</p>
                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                <Button
                  onClick={() => navigate('/auth')}
                          className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-body font-medium py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 magnetic-button"
                        >
                          <motion.div
                  className="flex items-center gap-2"
                            whileHover={{ x: 5 }}
                            transition={{ duration: 0.2 }}
                >
                            <Send className="h-5 w-5" />
                  Sign In to Comment
                          </motion.div>
                </Button>
                      </motion.div>
                    </div>
              </CardContent>
            </Card>
          )}
            </motion.div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-amber-50 overflow-hidden">
      {/* Hero Section */}
      <motion.div 
        className="relative overflow-hidden bg-gradient-to-br from-slate-50 via-white to-amber-50 py-20"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      >
        {/* Animated Background */}
        <MorphingBackground />
        <FloatingParticles />
        
        <div className="container mx-auto px-4 relative z-10">
          <motion.div 
            className="text-center max-w-4xl mx-auto community-header"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
          >
            {/* Animated badge */}
            <motion.div 
              className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-100 to-orange-100 text-amber-800 px-6 py-3 rounded-full text-sm font-medium mb-8 font-body shadow-lg backdrop-blur-sm"
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              >
                <Users className="h-4 w-4" />
              </motion.div>
              Your Supportive Community
            </motion.div>
            
            {/* Animated title */}
            <motion.h1 
              className="text-5xl md:text-6xl lg:text-7xl font-bold mb-8 font-heading text-gray-900"
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.2, ease: "easeOut" }}
            >
              <motion.span
                className="inline-block bg-gradient-to-r from-gray-900 via-amber-600 to-rose-600 bg-clip-text text-transparent"
                whileHover={{ scale: 1.1, rotate: 2 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                Community
              </motion.span>
            </motion.h1>
            
            {/* Animated subtitle */}
            <motion.p 
              className="text-xl md:text-2xl text-gray-600 mb-12 font-body leading-relaxed max-w-3xl mx-auto"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
          A safe space to share and connect. Posts are anonymous, but replies show your name.
            </motion.p>
          </motion.div>
        </div>
      </motion.div>

      {/* Stats Section */}
      <motion.section 
        className="py-20 bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 relative overflow-hidden"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
      >
        <div className="container mx-auto px-4 relative z-10">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4 font-heading text-gray-900">
              Community Overview
            </h2>
            <p className="text-xl text-gray-600 font-body max-w-2xl mx-auto">
              Connect with others and share your journey
            </p>
          </motion.div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto community-stats animate-fade-in-up">
            {[
              { icon: MessageSquare, value: posts.length, label: "Total Posts", color: "text-blue-600", bgColor: "bg-blue-100" },
              { icon: Heart, value: posts.reduce((sum, post) => sum + post.likes_count, 0), label: "Total Likes", color: "text-green-600", bgColor: "bg-green-100" },
              { icon: MessageCircle, value: posts.reduce((sum, post) => sum + post.comments_count, 0), label: "Total Comments", color: "text-purple-600", bgColor: "bg-purple-100" }
            ].map((stat, index) => (
              <motion.div
                key={index}
                className="text-center p-8 bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 group relative overflow-hidden"
                initial={{ opacity: 0, y: 50, scale: 0.9 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ 
                  duration: 0.6, 
                  delay: index * 0.1,
                  ease: "easeOut"
                }}
                whileHover={{ 
                  y: -10, 
                  scale: 1.05,
                  transition: { duration: 0.3 }
                }}
              >
                {/* Animated icon */}
                <motion.div 
                  className={`w-16 h-16 rounded-2xl ${stat.bgColor} flex items-center justify-center mx-auto mb-6 relative z-10`}
                  whileHover={{ 
                    rotate: 360,
                    scale: 1.2
                  }}
                  transition={{ duration: 0.6 }}
                >
                  <stat.icon className={`h-8 w-8 ${stat.color}`} />
                </motion.div>
                
                {/* Counter */}
                <div className={`text-3xl md:text-4xl font-bold mb-3 font-heading ${stat.color} relative z-10`}>
                  {stat.value}
                </div>
                
                <div className="text-gray-600 font-body relative z-10">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-20 relative z-10">
        <div className="max-w-6xl mx-auto community-content">

        {/* Create New Post */}
          <motion.div
            className="mb-12"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
        {userId ? (
              <Card className="bg-white/80 backdrop-blur-sm shadow-xl border-0 overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-amber-50 to-orange-50 border-b border-amber-100">
                  <CardTitle className="flex items-center gap-3 font-heading text-xl">
                    <motion.div
                      className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center"
                      whileHover={{ rotate: 360, scale: 1.1 }}
                      transition={{ duration: 0.6 }}
                    >
                      <Plus className="h-5 w-5 text-white" />
                    </motion.div>
                Start a New Discussion
              </CardTitle>
                  <CardDescription className="font-body text-gray-600">
                    Share your thoughts and connect with the community
                  </CardDescription>
            </CardHeader>
                <CardContent className="p-8">
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2 font-body">Title</label>
              <Input
                placeholder="What's on your mind?"
                value={newPostTitle}
                onChange={(e) => setNewPostTitle(e.target.value)}
                        className="w-full border-gray-300 focus:border-amber-500 focus:ring-amber-500 font-body"
              />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2 font-body">Content</label>
              <Textarea
                placeholder="Share your thoughts, ask for advice, or start a discussion..."
                value={newPostContent}
                onChange={(e) => setNewPostContent(e.target.value)}
                        className="min-h-[120px] border-gray-300 focus:border-amber-500 focus:ring-amber-500 font-body"
              />
                    </div>
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
              <Button
                onClick={handleCreatePost}
                disabled={!newPostTitle.trim() || !newPostContent.trim() || posting}
                        className="w-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-body font-medium py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 magnetic-button"
                      >
                        <motion.div
                className="flex items-center gap-2"
                          whileHover={{ x: 5 }}
                          transition={{ duration: 0.2 }}
              >
                          <MessageSquare className="h-5 w-5" />
                {posting ? "Posting..." : "Post Discussion"}
                        </motion.div>
              </Button>
                    </motion.div>
                  </div>
            </CardContent>
          </Card>
        ) : (
              <Card className="bg-white/80 backdrop-blur-sm shadow-xl border-0 overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-amber-50 to-orange-50 border-b border-amber-100">
                  <CardTitle className="flex items-center gap-3 font-heading text-xl">
                    <motion.div
                      className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center"
                      whileHover={{ rotate: 360, scale: 1.1 }}
                      transition={{ duration: 0.6 }}
                    >
                      <Plus className="h-5 w-5 text-white" />
                    </motion.div>
                Start a New Discussion
              </CardTitle>
                  <CardDescription className="font-body text-gray-600">
                    Join the community to share your thoughts
                  </CardDescription>
            </CardHeader>
                <CardContent className="p-8">
                  <div className="text-center py-8">
                    <motion.div
                      className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-4"
                      animate={{ 
                        scale: [1, 1.1, 1],
                        rotate: [0, 5, -5, 0]
                      }}
                      transition={{ 
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                    >
                      <MessageSquare className="h-8 w-8 text-gray-400" />
                    </motion.div>
                    <p className="text-gray-600 mb-6 font-body">Sign in to create posts and join the discussion</p>
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
              <Button
                onClick={() => navigate('/auth')}
                        className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-body font-medium py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 magnetic-button"
                      >
                        <motion.div
                className="flex items-center gap-2"
                          whileHover={{ x: 5 }}
                          transition={{ duration: 0.2 }}
              >
                          <MessageSquare className="h-5 w-5" />
                Sign In to Post
                        </motion.div>
              </Button>
                    </motion.div>
                  </div>
            </CardContent>
          </Card>
        )}
          </motion.div>

        {/* Posts List */}
          <motion.div
            className="community-content animate-fade-in-up"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Card className="bg-white/80 backdrop-blur-sm shadow-xl border-0 overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100">
            <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-3 font-heading text-xl">
                    <motion.div
                      className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center"
                      whileHover={{ rotate: 360, scale: 1.1 }}
                      transition={{ duration: 0.6 }}
                    >
                      <Rss className="h-5 w-5 text-white" />
                    </motion.div>
                Recent Posts
              </CardTitle>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
              <Button
                variant="outline"
                size="sm"
                onClick={loadUserAndPosts}
                disabled={loading}
                      className="border-amber-300 text-amber-700 hover:bg-amber-50 font-body"
              >
                {loading ? "Loading..." : "Refresh"}
              </Button>
                  </motion.div>
            </div>
                <CardDescription className="font-body text-gray-600">
                  Connect with the community through discussions
                </CardDescription>
          </CardHeader>
              <CardContent className="p-6">
            {loading ? (
                  <motion.div
                    className="text-center py-12"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.6 }}
                  >
                    <motion.div
                      className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-4"
                      animate={{ 
                        scale: [1, 1.1, 1],
                        rotate: [0, 5, -5, 0]
                      }}
                      transition={{ 
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                    >
                      <Rss className="h-8 w-8 text-gray-400" />
                    </motion.div>
                    <p className="text-gray-600 font-body">Loading posts...</p>
                  </motion.div>
            ) : posts.length === 0 ? (
                  <motion.div
                    className="text-center py-12"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.6 }}
                  >
                    <motion.div
                      className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-6"
                      animate={{ 
                        scale: [1, 1.1, 1],
                        rotate: [0, 5, -5, 0]
                      }}
                      transition={{ 
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                    >
                      <MessageSquare className="h-12 w-12 text-gray-400" />
                    </motion.div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2 font-heading">No Posts Yet</h3>
                    <p className="text-gray-600 font-body">Be the first to start a discussion!</p>
                  </motion.div>
            ) : (
              <div className="space-y-6">
                    {posts.map((post, index) => (
                      <StaggeredCard key={post.id} index={index}>
                        <motion.div 
                          className="border border-gray-200 rounded-xl p-6 bg-white/50 backdrop-blur-sm hover:shadow-lg transition-all duration-300 group"
                          whileHover={{ 
                            y: -2, 
                            scale: 1.01,
                            transition: { duration: 0.2 }
                          }}
                        >
                          <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                              <h3 className="font-semibold text-xl mb-2 cursor-pointer hover:text-amber-600 font-heading text-gray-900 transition-colors duration-200" 
                            onClick={() => handleViewPost(post)}>
                          {post.title}
                        </h3>
                              <div className="flex items-center gap-4 text-sm text-gray-500 font-body mb-3">
                                <span className="flex items-center gap-1">
                                  <Calendar className="h-4 w-4" />
                          Posted by {post.author_name} • {formatTimeAgo(post.created_at)}
                                </span>
                                {post.is_anonymous && (
                                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">Anonymous</span>
                                )}
                              </div>
                        <div className="flex items-center gap-4">
                                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                          <Button
                            variant="link"
                                    className="p-0 h-auto font-body text-amber-600 hover:text-amber-700"
                            onClick={() => handleViewPost(post)}
                          >
                            View {post.comments_count} {post.comments_count === 1 ? 'reply' : 'replies'}
                          </Button>
                                </motion.div>
                                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleToggleLike(post.id)}
                                    className={`flex items-center gap-1 font-body ${
                                      post.user_has_liked 
                                        ? 'bg-red-50 border-red-200 text-red-700 hover:bg-red-100' 
                                        : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                                    }`}
                            title={!userId ? "Sign in to like posts" : ""}
                          >
                                    <Heart className={`h-3 w-3 ${post.user_has_liked ? 'text-red-500 fill-current' : ''}`} />
                            {post.likes_count}
                          </Button>
                                </motion.div>
                        </div>
                      </div>
                      {userId === post.author_id && (
                              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleDeletePost(post.id)}
                                  className="border-red-300 text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                              </motion.div>
                      )}
                    </div>
                        </motion.div>
                      </StaggeredCard>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Community;