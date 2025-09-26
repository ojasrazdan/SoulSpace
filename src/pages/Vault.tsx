import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { 
  Lock, 
  PlusCircle, 
  BookOpen, 
  Calendar, 
  Heart, 
  Smile, 
  Frown, 
  Meh, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  Eye, 
  EyeOff,
  Star,
  Clock,
  TrendingUp,
  BarChart3,
  PenTool,
  Sparkles,
  Shield,
  Archive,
  Tag
} from "lucide-react";
import { motion, useScroll, useTransform, useSpring, useInView } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

// Animated Components
const FloatingParticles = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    {[...Array(20)].map((_, i) => (
      <motion.div
        key={i}
        className="absolute w-2 h-2 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full opacity-20"
        style={{
          left: `${Math.random() * 100}%`,
          top: `${Math.random() * 100}%`,
        }}
        animate={{
          y: [0, -30, 0],
          x: [0, Math.random() * 20 - 10, 0],
          scale: [1, 1.2, 1],
        }}
        transition={{
          duration: 3 + Math.random() * 2,
          repeat: Infinity,
          delay: Math.random() * 2,
        }}
      />
    ))}
  </div>
);

const MorphingBackground = () => (
  <div className="absolute inset-0 overflow-hidden">
    <motion.div
      className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-purple-400/20 to-pink-600/20 rounded-full blur-3xl"
      animate={{
        scale: [1, 1.2, 1],
        rotate: [0, 180, 360],
      }}
      transition={{
        duration: 20,
        repeat: Infinity,
        ease: "linear",
      }}
    />
    <motion.div
      className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-blue-400/20 to-purple-600/20 rounded-full blur-3xl"
      animate={{
        scale: [1.2, 1, 1.2],
        rotate: [360, 180, 0],
      }}
      transition={{
        duration: 25,
        repeat: Infinity,
        ease: "linear",
      }}
    />
  </div>
);

const AnimatedText = ({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.6, delay }}
  >
    {children}
  </motion.div>
);

const StaggeredCard = ({ children, index = 0 }: { children: React.ReactNode; index?: number }) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.6, delay: index * 0.1 }}
    whileHover={{ y: -5, scale: 1.02 }}
    className="h-full"
  >
    {children}
  </motion.div>
);

// Diary Entry Types
type DiaryEntry = {
  id: string;
  title: string;
  content: string;
  mood: 'happy' | 'sad' | 'angry' | 'anxious' | 'neutral' | 'excited' | 'grateful' | 'confused';
  type: 'daily' | 'dream' | 'vent' | 'gratitude' | 'goal' | 'memory' | 'reflection' | 'creative';
  tags: string[];
  isPrivate: boolean;
  createdAt: string;
  updatedAt: string;
  wordCount: number;
  isFavorite: boolean;
};

const Vault = () => {
  const { user, isAuthenticated } = useAuth();
  const [entries, setEntries] = useState<DiaryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<DiaryEntry | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterMood, setFilterMood] = useState<string>("all");
  const [filterType, setFilterType] = useState<string>("all");
  const [showPrivate, setShowPrivate] = useState(true);
  const [newEntry, setNewEntry] = useState({
    title: "",
    content: "",
    mood: "neutral" as DiaryEntry['mood'],
    type: "daily" as DiaryEntry['type'],
    tags: [] as string[],
    isPrivate: true
  });

  // Load diary entries (mock data for now)
  const loadEntries = async () => {
    if (!user?.id) return;
    
    try {
      setLoading(true);
      // Mock data - replace with actual API calls
      const mockEntries: DiaryEntry[] = [
        {
          id: "1",
          title: "My Dream Last Night",
          content: "I had the most vivid dream about flying over mountains. It felt so real and peaceful. I wish I could experience that freedom in real life.",
          mood: "happy",
          type: "dream",
          tags: ["dreams", "flying", "peaceful"],
          isPrivate: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          wordCount: 28,
          isFavorite: false
        },
        {
          id: "2",
          title: "Frustrations from Today",
          content: "Had a really tough day at work. Everything seemed to go wrong and I felt overwhelmed. But I'm trying to stay positive and learn from this experience.",
          mood: "angry",
          type: "vent",
          tags: ["work", "stress", "learning"],
          isPrivate: true,
          createdAt: new Date(Date.now() - 86400000).toISOString(),
          updatedAt: new Date(Date.now() - 86400000).toISOString(),
          wordCount: 32,
          isFavorite: false
        },
        {
          id: "3",
          title: "Grateful for Today",
          content: "I'm so grateful for my family and friends who support me. They make everything better and I don't know what I'd do without them.",
          mood: "grateful",
          type: "gratitude",
          tags: ["gratitude", "family", "friends"],
          isPrivate: false,
          createdAt: new Date(Date.now() - 172800000).toISOString(),
          updatedAt: new Date(Date.now() - 172800000).toISOString(),
          wordCount: 25,
          isFavorite: true
        }
      ];
      setEntries(mockEntries);
    } catch (error) {
      console.error("Error loading entries:", error);
      toast.error("Failed to load diary entries");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated && user?.id) {
      loadEntries();
    }
  }, [isAuthenticated, user?.id]);

  // Calculate statistics
  const totalEntries = entries.length;
  const totalWords = entries.reduce((sum, entry) => sum + entry.wordCount, 0);
  const moodCounts = entries.reduce((counts, entry) => {
    counts[entry.mood] = (counts[entry.mood] || 0) + 1;
    return counts;
  }, {} as Record<string, number>);

  // Filter entries
  const filteredEntries = entries.filter(entry => {
    const matchesSearch = entry.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         entry.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         entry.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesMood = filterMood === "all" || entry.mood === filterMood;
    const matchesType = filterType === "all" || entry.type === filterType;
    const matchesPrivacy = showPrivate || !entry.isPrivate;
    
    return matchesSearch && matchesMood && matchesType && matchesPrivacy;
  });

  // Create new entry
  const handleCreateEntry = async () => {
    if (!user?.id || !newEntry.title.trim() || !newEntry.content.trim()) return;

    try {
      const entry: DiaryEntry = {
        id: Date.now().toString(),
        title: newEntry.title.trim(),
        content: newEntry.content.trim(),
        mood: newEntry.mood,
        type: newEntry.type,
        tags: newEntry.tags,
        isPrivate: newEntry.isPrivate,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        wordCount: newEntry.content.trim().split(/\s+/).length,
        isFavorite: false
      };
      
      setEntries(prev => [entry, ...prev]);
      setNewEntry({ title: "", content: "", mood: "neutral", type: "daily", tags: [], isPrivate: true });
      setIsCreateDialogOpen(false);
      toast.success("Diary entry created successfully! 📝");
    } catch (error) {
      console.error("Error creating entry:", error);
      toast.error("Failed to create diary entry");
    }
  };

  // Delete entry
  const handleDeleteEntry = async (entryId: string) => {
    try {
      setEntries(prev => prev.filter(entry => entry.id !== entryId));
      toast.success("Diary entry deleted successfully! 🗑️");
    } catch (error) {
      console.error("Error deleting entry:", error);
      toast.error("Failed to delete diary entry");
    }
  };

  // Toggle favorite
  const handleToggleFavorite = (entryId: string) => {
    setEntries(prev => prev.map(entry => 
      entry.id === entryId ? { ...entry, isFavorite: !entry.isFavorite } : entry
    ));
  };

  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], [0, -50]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0.8]);

  // GSAP Animations
  useEffect(() => {
    const ctx = gsap.context(() => {
      // Hero section animations
      gsap.fromTo('.vault-header', 
        { opacity: 0, y: 50 },
        { opacity: 1, y: 0, duration: 0.8, ease: "power2.out" }
      );
      
      gsap.fromTo('.vault-stats', 
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.6, delay: 0.2, stagger: 0.1, ease: "power2.out" }
      );
      
      gsap.fromTo('.vault-entries', 
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.6, delay: 0.4, stagger: 0.05, ease: "power2.out" }
      );

      // Magnetic button effect
      const buttons = document.querySelectorAll('.magnetic-btn');
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
    });

    return () => ctx.revert();
  }, [entries]);

  return (
    <div className="min-h-screen relative overflow-hidden">
      <MorphingBackground />
      <FloatingParticles />
      
      <motion.div 
        className="relative z-10 min-h-screen p-4"
        style={{ y, opacity }}
      >
        <div className="container mx-auto max-w-6xl">
          {/* Hero Section */}
          <motion.div 
            className="text-center mb-12 pt-8 vault-header"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <motion.div
              className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-full border border-purple-200/20 mb-6"
              whileHover={{ scale: 1.05 }}
            >
              <Shield className="w-4 h-4 text-purple-500" />
              <span className="text-sm font-medium text-purple-600">Private Diary</span>
            </motion.div>
            
            <motion.h1 
              className="text-5xl md:text-6xl font-bold mb-6"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
            >
              <motion.span 
                className="bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent inline-block"
                whileHover={{ 
                  scale: 1.05, 
                  rotate: 1,
                  transition: { duration: 0.2, type: "spring", stiffness: 400 }
                }}
              >
                Thought Vault
              </motion.span>
            </motion.h1>
            
            <motion.p 
              className="text-xl text-gray-600 max-w-2xl mx-auto"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4, ease: "easeOut" }}
              whileHover={{ 
                scale: 1.02,
                transition: { duration: 0.2 }
              }}
            >
              Your private, encrypted space for thoughts, dreams, and reflections
            </motion.p>
          </motion.div>

          {/* Stats Cards */}
          <div className="grid md:grid-cols-4 gap-6 mb-12 vault-stats">
            <StaggeredCard index={0}>
              <Card className="relative overflow-hidden group hover:shadow-2xl transition-all duration-300">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <CardHeader className="relative">
                  <CardTitle className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg">
                      <BookOpen className="w-5 h-5 text-white" />
                    </div>
                    <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                      Total Entries
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="relative">
                  <motion.p 
                    className="text-4xl font-bold text-purple-600"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                  >
                    {totalEntries}
                  </motion.p>
                  <p className="text-sm text-gray-500 mt-1">Diary entries</p>
                </CardContent>
              </Card>
            </StaggeredCard>

            <StaggeredCard index={1}>
              <Card className="relative overflow-hidden group hover:shadow-2xl transition-all duration-300">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <CardHeader className="relative">
                  <CardTitle className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg">
                      <PenTool className="w-5 h-5 text-white" />
                    </div>
                    <span className="bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                      Total Words
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="relative">
                  <motion.p 
                    className="text-4xl font-bold text-blue-600"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                  >
                    {totalWords.toLocaleString()}
                  </motion.p>
                  <p className="text-sm text-gray-500 mt-1">Words written</p>
                </CardContent>
              </Card>
            </StaggeredCard>

            <StaggeredCard index={2}>
              <Card className="relative overflow-hidden group hover:shadow-2xl transition-all duration-300">
                <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-emerald-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <CardHeader className="relative">
                  <CardTitle className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg">
                      <Heart className="w-5 h-5 text-white" />
                    </div>
                    <span className="bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                      Favorites
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="relative">
                  <motion.p 
                    className="text-4xl font-bold text-green-600"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.5, delay: 0.5 }}
                  >
                    {entries.filter(e => e.isFavorite).length}
                  </motion.p>
                  <p className="text-sm text-gray-500 mt-1">Starred entries</p>
                </CardContent>
              </Card>
            </StaggeredCard>

            <StaggeredCard index={3}>
              <Card className="relative overflow-hidden group hover:shadow-2xl transition-all duration-300">
                <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-red-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <CardHeader className="relative">
                  <CardTitle className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg">
                      <TrendingUp className="w-5 h-5 text-white" />
                    </div>
                    <span className="bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                      This Week
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="relative">
                  <motion.p 
                    className="text-4xl font-bold text-orange-600"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.5, delay: 0.6 }}
                  >
                    {entries.filter(e => {
                      const entryDate = new Date(e.createdAt);
                      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
                      return entryDate > weekAgo;
                    }).length}
                  </motion.p>
                  <p className="text-sm text-gray-500 mt-1">Recent entries</p>
                </CardContent>
              </Card>
            </StaggeredCard>
          </div>

          {/* Action Bar */}
          <div className="flex flex-col sm:flex-row gap-4 mb-8">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search entries, tags, or content..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="flex gap-2">
              <Select value={filterMood} onValueChange={setFilterMood}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Mood" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Moods</SelectItem>
                  <SelectItem value="happy">😊 Happy</SelectItem>
                  <SelectItem value="sad">😢 Sad</SelectItem>
                  <SelectItem value="angry">😠 Angry</SelectItem>
                  <SelectItem value="anxious">😰 Anxious</SelectItem>
                  <SelectItem value="neutral">😐 Neutral</SelectItem>
                  <SelectItem value="excited">🤩 Excited</SelectItem>
                  <SelectItem value="grateful">🙏 Grateful</SelectItem>
                  <SelectItem value="confused">😕 Confused</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="daily">📅 Daily</SelectItem>
                  <SelectItem value="dream">💭 Dream</SelectItem>
                  <SelectItem value="vent">💢 Vent</SelectItem>
                  <SelectItem value="gratitude">🙏 Gratitude</SelectItem>
                  <SelectItem value="goal">🎯 Goal</SelectItem>
                  <SelectItem value="memory">📸 Memory</SelectItem>
                  <SelectItem value="reflection">🤔 Reflection</SelectItem>
                  <SelectItem value="creative">🎨 Creative</SelectItem>
                </SelectContent>
              </Select>

              <Button
                variant={showPrivate ? "default" : "outline"}
                onClick={() => setShowPrivate(!showPrivate)}
                className="flex items-center gap-2"
              >
                {showPrivate ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                {showPrivate ? "All" : "Private"}
              </Button>
            </div>

            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="magnetic-btn"
                >
                  <Button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white">
                    <PlusCircle className="w-4 h-4 mr-2" />
                    New Entry
                  </Button>
                </motion.div>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                  <DialogTitle>Create New Diary Entry</DialogTitle>
                  <DialogDescription>
                    Express your thoughts, feelings, and experiences in your private space.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <label htmlFor="title" className="text-sm font-medium">
                      Title
                    </label>
                    <Input
                      id="title"
                      placeholder="What's on your mind?"
                      value={newEntry.title}
                      onChange={(e) => setNewEntry(prev => ({ ...prev, title: e.target.value }))}
                    />
                  </div>
                  
                  <div className="grid gap-2">
                    <label htmlFor="content" className="text-sm font-medium">
                      Content
                    </label>
                    <Textarea
                      id="content"
                      placeholder="Write your thoughts here..."
                      value={newEntry.content}
                      onChange={(e) => setNewEntry(prev => ({ ...prev, content: e.target.value }))}
                      className="min-h-[200px]"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <label htmlFor="mood" className="text-sm font-medium">
                        Mood
                      </label>
                      <Select 
                        value={newEntry.mood} 
                        onValueChange={(value) => setNewEntry(prev => ({ ...prev, mood: value as DiaryEntry['mood'] }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="happy">😊 Happy</SelectItem>
                          <SelectItem value="sad">😢 Sad</SelectItem>
                          <SelectItem value="angry">😠 Angry</SelectItem>
                          <SelectItem value="anxious">😰 Anxious</SelectItem>
                          <SelectItem value="neutral">😐 Neutral</SelectItem>
                          <SelectItem value="excited">🤩 Excited</SelectItem>
                          <SelectItem value="grateful">🙏 Grateful</SelectItem>
                          <SelectItem value="confused">😕 Confused</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid gap-2">
                      <label htmlFor="type" className="text-sm font-medium">
                        Type
                      </label>
                      <Select 
                        value={newEntry.type} 
                        onValueChange={(value) => setNewEntry(prev => ({ ...prev, type: value as DiaryEntry['type'] }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="daily">📅 Daily</SelectItem>
                          <SelectItem value="dream">💭 Dream</SelectItem>
                          <SelectItem value="vent">💢 Vent</SelectItem>
                          <SelectItem value="gratitude">🙏 Gratitude</SelectItem>
                          <SelectItem value="goal">🎯 Goal</SelectItem>
                          <SelectItem value="memory">📸 Memory</SelectItem>
                          <SelectItem value="reflection">🤔 Reflection</SelectItem>
                          <SelectItem value="creative">🎨 Creative</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="private"
                      checked={newEntry.isPrivate}
                      onChange={(e) => setNewEntry(prev => ({ ...prev, isPrivate: e.target.checked }))}
                      className="rounded"
                    />
                    <label htmlFor="private" className="text-sm font-medium">
                      Keep this entry private
                    </label>
                  </div>
                </div>
                <DialogFooter>
                  <Button 
                    onClick={handleCreateEntry}
                    disabled={!newEntry.title.trim() || !newEntry.content.trim()}
                    className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                  >
                    Create Entry
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          {/* Entries List */}
          <div className="space-y-6 vault-entries">
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading your diary entries...</p>
              </div>
            ) : filteredEntries.length === 0 ? (
              <motion.div 
                className="text-center py-12"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.8 }}
              >
                <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-600 mb-2">No entries found</h3>
                <p className="text-gray-500 mb-6">
                  {searchTerm || filterMood !== "all" || filterType !== "all" 
                    ? "Try adjusting your search or filters" 
                    : "Start writing your first diary entry!"}
                </p>
                <Button 
                  onClick={() => setIsCreateDialogOpen(true)}
                  className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                >
                  <PlusCircle className="w-4 h-4 mr-2" />
                  Create Your First Entry
                </Button>
              </motion.div>
            ) : (
              filteredEntries.map((entry, index) => (
                <StaggeredCard key={entry.id} index={index + 4}>
                  <Card className="relative overflow-hidden group hover:shadow-xl transition-all duration-300">
                    <div className={`absolute inset-0 ${
                      entry.isPrivate 
                        ? 'bg-gradient-to-r from-purple-500/5 to-pink-500/5' 
                        : 'bg-gradient-to-r from-blue-500/5 to-cyan-500/5'
                    } opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
                    
                    <CardContent className="relative p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-xl font-semibold text-gray-900">{entry.title}</h3>
                            {entry.isFavorite && (
                              <Star className="w-5 h-5 text-yellow-500 fill-current" />
                            )}
                            {entry.isPrivate && (
                              <Lock className="w-4 h-4 text-purple-500" />
                            )}
                          </div>
                          
                          <div className="flex items-center gap-4 mb-3">
                            <Badge 
                              variant="secondary" 
                              className={`${
                                entry.mood === 'happy' ? 'bg-green-100 text-green-800' :
                                entry.mood === 'sad' ? 'bg-blue-100 text-blue-800' :
                                entry.mood === 'angry' ? 'bg-red-100 text-red-800' :
                                entry.mood === 'anxious' ? 'bg-yellow-100 text-yellow-800' :
                                entry.mood === 'grateful' ? 'bg-purple-100 text-purple-800' :
                                'bg-gray-100 text-gray-800'
                              }`}
                            >
                              {entry.mood === 'happy' ? '😊' : 
                               entry.mood === 'sad' ? '😢' :
                               entry.mood === 'angry' ? '😠' :
                               entry.mood === 'anxious' ? '😰' :
                               entry.mood === 'grateful' ? '🙏' :
                               entry.mood === 'excited' ? '🤩' :
                               entry.mood === 'confused' ? '😕' : '😐'} {entry.mood}
                            </Badge>
                            
                            <Badge variant="outline">
                              {entry.type === 'daily' ? '📅' : 
                               entry.type === 'dream' ? '💭' :
                               entry.type === 'vent' ? '💢' :
                               entry.type === 'gratitude' ? '🙏' :
                               entry.type === 'goal' ? '🎯' :
                               entry.type === 'memory' ? '📸' :
                               entry.type === 'reflection' ? '🤔' : '🎨'} {entry.type}
                            </Badge>
                            
                            <div className="flex items-center gap-1 text-sm text-gray-500">
                              <Clock className="w-4 h-4" />
                              {new Date(entry.createdAt).toLocaleDateString()}
                            </div>
                          </div>
                          
                          <p className="text-gray-700 mb-4 line-clamp-3">{entry.content}</p>
                          
                          {entry.tags.length > 0 && (
                            <div className="flex flex-wrap gap-2 mb-4">
                              {entry.tags.map((tag, tagIndex) => (
                                <Badge key={tagIndex} variant="secondary" className="text-xs">
                                  <Tag className="w-3 h-3 mr-1" />
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-2 ml-4">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleToggleFavorite(entry.id)}
                            className={entry.isFavorite ? 'text-yellow-600 border-yellow-600' : ''}
                          >
                            <Star className={`w-4 h-4 ${entry.isFavorite ? 'fill-current' : ''}`} />
                          </Button>
                          
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDeleteEntry(entry.id)}
                            className="text-red-600 border-red-600 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <span>{entry.wordCount} words</span>
                        <span>Created {new Date(entry.createdAt).toLocaleDateString()}</span>
                      </div>
                    </CardContent>
                  </Card>
                </StaggeredCard>
              ))
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Vault;