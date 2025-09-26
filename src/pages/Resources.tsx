import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  BookOpen, 
  Play, 
  Pause, 
  RotateCcw, 
  Heart, 
  Brain, 
  Leaf, 
  Video, 
  Headphones, 
  FileText, 
  Download,
  Clock,
  Star,
  ArrowRight,
  PlayCircle,
  Volume2,
  Download as DownloadIcon,
  ExternalLink,
  Users,
  Shield,
  Zap
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAccessibility } from "../hooks/AccessibilityContext";
import { gsap } from "gsap";

// Enhanced resource data
const SUPPORT_ARTICLES = [
  {
    id: 1,
    title: "Understanding Anxiety: A Student's Guide",
    category: "Anxiety",
    summary: "Learn about anxiety symptoms, triggers, and coping strategies specifically for college students.",
    readTime: "5 min read",
    difficulty: "Beginner",
    rating: 4.8,
    content: "Anxiety is a normal response to stress, but when it becomes overwhelming, it can interfere with daily life and academic performance...",
    author: "Dr. Sarah Johnson",
    publishedDate: "2024-01-15",
    tags: ["anxiety", "college", "coping", "mental health"]
  },
  {
    id: 2,
    title: "Managing Depression in College",
    category: "Depression", 
    summary: "Recognize signs of depression and discover effective ways to seek help and support.",
    readTime: "7 min read",
    difficulty: "Intermediate",
    rating: 4.9,
    content: "Depression affects millions of college students. Understanding the signs and knowing where to turn for help is crucial...",
    author: "Dr. Michael Chen",
    publishedDate: "2024-01-10",
    tags: ["depression", "support", "therapy", "recovery"]
  },
  {
    id: 3,
    title: "ADHD and Academic Success",
    category: "ADHD",
    summary: "Strategies for students with ADHD to improve focus, organization, and academic performance.",
    readTime: "6 min read", 
    difficulty: "Intermediate",
    rating: 4.7,
    content: "ADHD can present unique challenges in college, but with the right strategies and support, students can thrive...",
    author: "Dr. Lisa Rodriguez",
    publishedDate: "2024-01-08",
    tags: ["adhd", "academic", "focus", "organization"]
  },
  {
    id: 4,
    title: "Stress Management Techniques",
    category: "Stress",
    summary: "Evidence-based techniques to manage academic and personal stress effectively.",
    readTime: "4 min read",
    difficulty: "Beginner",
    rating: 4.6,
    content: "Stress is inevitable in college, but how you manage it makes all the difference. Here are proven techniques...",
    author: "Dr. James Wilson",
    publishedDate: "2024-01-05",
    tags: ["stress", "management", "wellness", "techniques"]
  },
  {
    id: 5,
    title: "Building Healthy Relationships",
    category: "Relationships",
    summary: "Guidance on forming and maintaining healthy relationships during college years.",
    readTime: "8 min read",
    difficulty: "Beginner",
    rating: 4.8,
    content: "Healthy relationships are crucial for mental wellbeing. Learn how to build meaningful connections...",
    author: "Dr. Emily Davis",
    publishedDate: "2024-01-12",
    tags: ["relationships", "social", "communication", "boundaries"]
  },
  {
    id: 6,
    title: "Sleep and Mental Health",
    category: "Sleep",
    summary: "The connection between sleep quality and mental health, plus tips for better rest.",
    readTime: "6 min read",
    difficulty: "Beginner",
    rating: 4.9,
    content: "Quality sleep is essential for mental health. Discover how to improve your sleep habits...",
    author: "Dr. Robert Kim",
    publishedDate: "2024-01-18",
    tags: ["sleep", "health", "habits", "wellness"]
  }
];

const VIDEO_RESOURCES = [
  {
    id: 1,
    title: "Mindfulness Meditation for Beginners",
    duration: "15:30",
    category: "Meditation",
    description: "A gentle introduction to mindfulness meditation techniques",
    thumbnail: "/api/placeholder/300/200",
    views: "12.5K",
    rating: 4.9,
    instructor: "Dr. Sarah Johnson",
    level: "Beginner"
  },
  {
    id: 2,
    title: "Managing Test Anxiety",
    duration: "22:15",
    category: "Anxiety",
    description: "Practical strategies to overcome test anxiety and perform your best",
    thumbnail: "/api/placeholder/300/200",
    views: "8.7K",
    rating: 4.8,
    instructor: "Dr. Michael Chen",
    level: "Intermediate"
  },
  {
    id: 3,
    title: "Building Self-Confidence",
    duration: "18:45",
    category: "Self-Development",
    description: "Techniques to boost self-esteem and confidence in academic and social settings",
    thumbnail: "/api/placeholder/300/200",
    views: "15.2K",
    rating: 4.9,
    instructor: "Dr. Lisa Rodriguez",
    level: "Beginner"
  },
  {
    id: 4,
    title: "Crisis Intervention Strategies",
    duration: "25:10",
    category: "Crisis Support",
    description: "How to help yourself and others during mental health crises",
    thumbnail: "/api/placeholder/300/200",
    views: "6.3K",
    rating: 4.7,
    instructor: "Dr. James Wilson",
    level: "Advanced"
  }
];

const AUDIO_RESOURCES = [
  {
    id: 1,
    title: "Guided Sleep Meditation",
    duration: "20:00",
    category: "Sleep",
    description: "A calming audio guide to help you fall asleep peacefully",
    type: "Meditation",
    fileSize: "8.2 MB",
    downloads: "5.2K",
    rating: 4.9
  },
  {
    id: 2,
    title: "Anxiety Relief Breathing",
    duration: "12:30",
    category: "Anxiety",
    description: "Immediate relief techniques for anxiety attacks",
    type: "Breathing Exercise",
    fileSize: "5.1 MB",
    downloads: "7.8K",
    rating: 4.8
  },
  {
    id: 3,
    title: "Focus and Concentration",
    duration: "15:45",
    category: "Focus",
    description: "Background sounds to enhance concentration during study",
    type: "Ambient Sounds",
    fileSize: "6.3 MB",
    downloads: "9.1K",
    rating: 4.7
  },
  {
    id: 4,
    title: "Positive Affirmations",
    duration: "10:20",
    category: "Self-Development",
    description: "Daily affirmations to boost self-esteem and motivation",
    type: "Affirmations",
    fileSize: "4.2 MB",
    downloads: "6.5K",
    rating: 4.9
  }
];

const BREATHING_EXERCISES = [
  {
    id: 1,
    name: "4-7-8 Breathing",
    description: "A calming technique to reduce anxiety and promote relaxation",
    duration: 240,
    difficulty: "Beginner",
    category: "Anxiety Relief",
    instructions: [
      "Inhale quietly through your nose for 4 counts",
      "Hold your breath for 7 counts", 
      "Exhale completely through your mouth for 8 counts",
      "Repeat this cycle 4 times"
    ],
    benefits: ["Reduces anxiety", "Improves sleep", "Calms the mind"]
  },
  {
    id: 2,
    name: "Box Breathing",
    description: "A simple technique used by Navy SEALs to stay calm under pressure",
    duration: 300,
    difficulty: "Intermediate",
    category: "Stress Management",
    instructions: [
      "Inhale for 4 counts",
      "Hold for 4 counts",
      "Exhale for 4 counts", 
      "Hold empty for 4 counts",
      "Repeat this pattern"
    ],
    benefits: ["Reduces stress", "Improves focus", "Enhances performance"]
  },
  {
    id: 3,
    name: "Progressive Relaxation",
    description: "Release tension by focusing on different muscle groups",
    duration: 600,
    difficulty: "Intermediate",
    category: "Relaxation",
    instructions: [
      "Start with your toes, tense for 5 seconds then relax",
      "Move up to your calves, thighs, abdomen",
      "Continue with arms, shoulders, neck, and face",
      "Focus on the contrast between tension and relaxation"
    ],
    benefits: ["Reduces muscle tension", "Promotes relaxation", "Improves sleep"]
  },
  {
    id: 4,
    name: "Alternate Nostril Breathing",
    description: "A balancing technique that calms the nervous system",
    duration: 180,
    difficulty: "Beginner",
    category: "Balance",
    instructions: [
      "Close your right nostril with your thumb",
      "Inhale through your left nostril",
      "Close your left nostril, open your right",
      "Exhale through your right nostril",
      "Repeat, alternating sides"
    ],
    benefits: ["Balances energy", "Reduces stress", "Improves focus"]
  }
];

const Resources = () => {
  const [selectedArticle, setSelectedArticle] = useState<number | null>(null);
  const [activeExercise, setActiveExercise] = useState<number | null>(null);
  const [exerciseTime, setExerciseTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeTab, setActiveTab] = useState("articles");
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const { ttsEnabled } = useAccessibility();

  // GSAP animations
  useEffect(() => {
    if (containerRef.current) {
      gsap.fromTo(".resource-card", 
        { opacity: 0, y: 50, scale: 0.9 },
        { 
          opacity: 1, 
          y: 0, 
          scale: 1, 
          duration: 0.6, 
          stagger: 0.1,
          ease: "power2.out"
        }
      );
    }
  }, [activeTab]);

  const speakText = (text: string) => {
    if (ttsEnabled && "speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(utterance);
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'anxiety': return <Heart className="h-4 w-4" />;
      case 'depression': return <Brain className="h-4 w-4" />;
      case 'adhd': return <Brain className="h-4 w-4" />;
      case 'stress': return <Leaf className="h-4 w-4" />;
      case 'relationships': return <Users className="h-4 w-4" />;
      case 'sleep': return <Shield className="h-4 w-4" />;
      case 'meditation': return <Zap className="h-4 w-4" />;
      case 'self-development': return <Star className="h-4 w-4" />;
      case 'crisis support': return <Shield className="h-4 w-4" />;
      case 'focus': return <Brain className="h-4 w-4" />;
      case 'relaxation': return <Leaf className="h-4 w-4" />;
      case 'balance': return <Heart className="h-4 w-4" />;
      default: return <BookOpen className="h-4 w-4" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case 'anxiety': return 'bg-red-100 text-red-800 border-red-200';
      case 'depression': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'adhd': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'stress': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'relationships': return 'bg-pink-100 text-pink-800 border-pink-200';
      case 'sleep': return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'meditation': return 'bg-green-100 text-green-800 border-green-200';
      case 'self-development': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'crisis support': return 'bg-red-100 text-red-800 border-red-200';
      case 'focus': return 'bg-cyan-100 text-cyan-800 border-cyan-200';
      case 'relaxation': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'balance': return 'bg-violet-100 text-violet-800 border-violet-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Timer logic
  useEffect(() => {
    if (isPlaying && activeExercise !== null) {
      intervalRef.current = setInterval(() => {
        setExerciseTime(prev => {
          const exercise = BREATHING_EXERCISES.find(ex => ex.id === activeExercise);
          if (exercise && prev >= exercise.duration) {
            setIsPlaying(false);
            setActiveExercise(null);
            speakText("Exercise completed");
            return 0;
          }
          return prev + 1;
        });
      }, 1000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isPlaying, activeExercise]);

  const startExercise = (exerciseId: number) => {
    setActiveExercise(exerciseId);
    setIsPlaying(true);
    setExerciseTime(0);
    const exercise = BREATHING_EXERCISES.find(ex => ex.id === exerciseId);
    if (exercise) speakText(`Starting ${exercise.name}`);
  };

  const pauseExercise = () => {
    setIsPlaying(false);
    speakText("Exercise paused");
  };

  const resetExercise = () => {
    setIsPlaying(false);
    setExerciseTime(0);
    setActiveExercise(null);
    speakText("Exercise reset");
  };

  // Render selected article
  if (selectedArticle) {
    const article = SUPPORT_ARTICLES.find(a => a.id === selectedArticle);
    if (!article) return null;

    return (
      <motion.div 
        className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-amber-50 p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="container mx-auto max-w-4xl">
          <motion.div 
            className="mb-6"
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <Button 
              variant="outline" 
              onClick={() => setSelectedArticle(null)}
              className="mb-4 hover:bg-amber-50"
            >
              ← Back to Resources
            </Button>
            <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
              {article.title}
            </h1>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <Badge className={getCategoryColor(article.category)}>
                {getCategoryIcon(article.category)}
                <span className="ml-1">{article.category}</span>
              </Badge>
              <span>{article.readTime}</span>
              <span>•</span>
              <span>{article.difficulty}</span>
              <span>•</span>
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span>{article.rating}</span>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
              <CardContent className="prose prose-lg max-w-none p-8">
                <p className="text-xl text-muted-foreground mb-6 font-medium">{article.summary}</p>
                <div className="space-y-6 text-foreground">
                  <p className="text-lg leading-relaxed">{article.content}</p>
                  <p className="text-lg leading-relaxed">
                    This comprehensive guide provides evidence-based strategies for managing {article.category.toLowerCase()}. 
                    Remember that seeking professional help is always recommended when dealing with mental health concerns.
                  </p>
                  <div className="bg-amber-50 p-6 rounded-lg border-l-4 border-amber-400">
                    <h3 className="font-semibold text-amber-800 mb-2">Professional Support</h3>
                    <p className="text-amber-700">
                      Your campus counseling center is a great resource for additional support. 
                      Don't hesitate to reach out when you need help.
                    </p>
                  </div>
              </div>
            </CardContent>
          </Card>
          </motion.div>
        </div>
      </motion.div>
    );
  }

  // Main resources page
  return (
    <motion.div 
      className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-amber-50 p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      ref={containerRef}
    >
      <div className="container mx-auto max-w-7xl">
        <motion.div 
          className="text-center mb-12"
          initial={{ y: -30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-amber-600 via-orange-600 to-rose-600 bg-clip-text text-transparent">
            Mental Health Resources
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Comprehensive evidence-based resources to support your mental wellbeing journey
          </p>
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4 mb-8 bg-white/80 backdrop-blur-sm">
              <TabsTrigger value="articles" className="data-[state=active]:bg-amber-500 data-[state=active]:text-white">
                <FileText className="h-4 w-4 mr-2" />
              Articles
            </TabsTrigger>
              <TabsTrigger value="videos" className="data-[state=active]:bg-amber-500 data-[state=active]:text-white">
                <Video className="h-4 w-4 mr-2" />
                Videos
              </TabsTrigger>
              <TabsTrigger value="audio" className="data-[state=active]:bg-amber-500 data-[state=active]:text-white">
                <Headphones className="h-4 w-4 mr-2" />
              Audio
            </TabsTrigger>
              <TabsTrigger value="exercises" className="data-[state=active]:bg-amber-500 data-[state=active]:text-white">
                <Heart className="h-4 w-4 mr-2" />
                Breathing
            </TabsTrigger>
          </TabsList>

            {/* Support Articles */}
          <TabsContent value="articles">
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {SUPPORT_ARTICLES.map((article, index) => (
                  <motion.div
                    key={article.id}
                    className="resource-card"
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ y: -5, scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                <Card
                      className="h-full shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer border-0 bg-white/80 backdrop-blur-sm group"
                  onClick={() => {
                    setSelectedArticle(article.id);
                    speakText(`Opening article ${article.title}`);
                  }}
                >
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between mb-2">
                          <Badge className={`${getCategoryColor(article.category)} text-xs`}>
                        {getCategoryIcon(article.category)}
                        <span className="ml-1">{article.category}</span>
                      </Badge>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                            <span>{article.rating}</span>
                          </div>
                    </div>
                        <CardTitle className="text-lg group-hover:text-amber-600 transition-colors">
                          {article.title}
                        </CardTitle>
                        <CardDescription className="text-sm line-clamp-2">
                          {article.summary}
                        </CardDescription>
                  </CardHeader>
                      <CardContent className="pt-0">
                        <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
                          <span>{article.readTime}</span>
                          <span>•</span>
                          <span>{article.difficulty}</span>
                    </div>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="w-full group-hover:bg-amber-50 group-hover:border-amber-300 group-hover:text-amber-700"
                        >
                          Read Article
                          <ArrowRight className="h-3 w-3 ml-2 group-hover:translate-x-1 transition-transform" />
                        </Button>
                  </CardContent>
                </Card>
                  </motion.div>
              ))}
            </div>
          </TabsContent>

            {/* Video Resources */}
            <TabsContent value="videos">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {VIDEO_RESOURCES.map((video, index) => (
                  <motion.div
                    key={video.id}
                    className="resource-card"
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ y: -5, scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Card className="h-full shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer border-0 bg-white/80 backdrop-blur-sm group">
                      <div className="relative">
                        <div className="aspect-video bg-gradient-to-br from-amber-100 to-orange-100 rounded-t-lg flex items-center justify-center">
                          <PlayCircle className="h-16 w-16 text-amber-600 group-hover:scale-110 transition-transform" />
                        </div>
                        <div className="absolute top-2 right-2">
                          <Badge className="bg-black/80 text-white text-xs">
                            {video.duration}
                          </Badge>
                        </div>
                      </div>
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between mb-2">
                          <Badge className={`${getCategoryColor(video.category)} text-xs`}>
                            {getCategoryIcon(video.category)}
                            <span className="ml-1">{video.category}</span>
                          </Badge>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                            <span>{video.rating}</span>
                          </div>
                        </div>
                        <CardTitle className="text-lg group-hover:text-amber-600 transition-colors">
                          {video.title}
                        </CardTitle>
                        <CardDescription className="text-sm line-clamp-2">
                          {video.description}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
                          <span>{video.views} views</span>
                          <span>•</span>
                          <span>{video.level}</span>
                        </div>
                          <Button 
                          variant="outline" 
                            size="sm" 
                          className="w-full group-hover:bg-amber-50 group-hover:border-amber-300 group-hover:text-amber-700"
                        >
                          <Play className="h-3 w-3 mr-2" />
                          Watch Now
                          </Button>
                    </CardContent>
                  </Card>
                  </motion.div>
                ))}
            </div>
          </TabsContent>

            {/* Audio Resources */}
            <TabsContent value="audio">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {AUDIO_RESOURCES.map((audio, index) => (
                  <motion.div
                    key={audio.id}
                    className="resource-card"
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ y: -5, scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Card className="h-full shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer border-0 bg-white/80 backdrop-blur-sm group">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-center mb-4">
                          <div className="w-16 h-16 bg-gradient-to-br from-amber-100 to-orange-100 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                            <Headphones className="h-8 w-8 text-amber-600" />
                          </div>
                        </div>
                        <div className="flex items-start justify-between mb-2">
                          <Badge className={`${getCategoryColor(audio.category)} text-xs`}>
                            {getCategoryIcon(audio.category)}
                            <span className="ml-1">{audio.category}</span>
                              </Badge>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                            <span>{audio.rating}</span>
                          </div>
                        </div>
                        <CardTitle className="text-lg group-hover:text-amber-600 transition-colors">
                          {audio.title}
                        </CardTitle>
                        <CardDescription className="text-sm line-clamp-2">
                          {audio.description}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
                          <span>{audio.duration}</span>
                          <span>•</span>
                          <span>{audio.downloads} downloads</span>
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="flex-1 group-hover:bg-amber-50 group-hover:border-amber-300 group-hover:text-amber-700"
                          >
                            <Play className="h-3 w-3 mr-2" />
                            Play
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="group-hover:bg-amber-50 group-hover:border-amber-300 group-hover:text-amber-700"
                          >
                            <DownloadIcon className="h-3 w-3" />
                          </Button>
                      </div>
                    </CardContent>
                  </Card>
                  </motion.div>
                ))}
            </div>
          </TabsContent>

          {/* Breathing Exercises */}
          <TabsContent value="exercises">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {BREATHING_EXERCISES.map((exercise, index) => (
                  <motion.div
                    key={exercise.id}
                    className="resource-card"
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ y: -5, scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Card className="h-full shadow-lg hover:shadow-xl transition-all duration-300 border-0 bg-white/80 backdrop-blur-sm group">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between mb-2">
                          <Badge className={`${getCategoryColor(exercise.category)} text-xs`}>
                            {getCategoryIcon(exercise.category)}
                            <span className="ml-1">{exercise.category}</span>
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {exercise.difficulty}
                          </Badge>
                        </div>
                        <CardTitle className="text-lg group-hover:text-amber-600 transition-colors">
                          {exercise.name}
                        </CardTitle>
                        <CardDescription className="text-sm line-clamp-2">
                          {exercise.description}
                        </CardDescription>
                  </CardHeader>
                      <CardContent className="pt-0">
                    <div className="space-y-4">
                      <div className="text-center">
                            <div className="text-3xl font-mono text-amber-600">
                          {activeExercise === exercise.id 
                            ? formatTime(exercise.duration - exerciseTime)
                            : formatTime(exercise.duration)
                          }
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {activeExercise === exercise.id 
                            ? `${formatTime(exerciseTime)} / ${formatTime(exercise.duration)}`
                            : `Duration: ${formatTime(exercise.duration)}`
                          }
                        </div>
                      </div>

                      <div className="flex justify-center gap-2">
                        {activeExercise === exercise.id ? (
                          <>
                            <Button
                              size="sm"
                              variant={isPlaying ? "default" : "outline"}
                              onClick={isPlaying ? pauseExercise : () => { setIsPlaying(true); speakText("Exercise resumed"); }}
                                  className={isPlaying ? "bg-amber-500 hover:bg-amber-600" : ""}
                            >
                              {isPlaying ? <Pause size={16} /> : <Play size={16} />}
                            </Button>
                                <Button 
                                  size="sm" 
                                  variant="outline" 
                                  onClick={resetExercise}
                                  className="hover:bg-red-50 hover:border-red-300 hover:text-red-700"
                                >
                              <RotateCcw size={16} />
                            </Button>
                          </>
                        ) : (
                          <Button
                            size="sm"
                            onClick={() => startExercise(exercise.id)}
                                className="bg-amber-500 hover:bg-amber-600 text-white w-full"
                          >
                            <Play size={16} className="mr-2" />
                                Start Exercise
                          </Button>
                        )}
                      </div>

                      <div className="space-y-2">
                            <h4 className="font-medium text-sm">Benefits:</h4>
                          <div className="flex flex-wrap gap-1">
                              {exercise.benefits.map((benefit, idx) => (
                              <Badge key={idx} variant="secondary" className="text-xs">
                                  {benefit}
                              </Badge>
                            ))}
                            </div>
                          </div>
                      </div>
                    </CardContent>
                  </Card>
                  </motion.div>
                ))}
            </div>
          </TabsContent>
        </Tabs>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Resources;