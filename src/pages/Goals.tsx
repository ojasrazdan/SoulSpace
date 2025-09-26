import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CheckCircle, Target, Award, Sparkles, TrendingUp, Calendar, Plus, Edit, Trash2, Check, X } from "lucide-react";
import { motion, useScroll, useTransform, useSpring, useInView } from "framer-motion";
import { useInView as useInViewSpring, animated, useSprings } from "@react-spring/web";
import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { useAuth } from "@/hooks/useAuth";
import { listGoals, createGoal, updateGoal, deleteGoal, type Goal } from "@/lib/goals";
import { toast } from "sonner";

// Animated Components
const FloatingParticles = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    {[...Array(20)].map((_, i) => (
      <motion.div
        key={i}
        className="absolute w-2 h-2 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full opacity-20"
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
      className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-600/20 rounded-full blur-3xl"
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
      className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-emerald-400/20 to-rose-600/20 rounded-full blur-3xl"
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

const Goals = () => {
  const { user, isAuthenticated } = useAuth();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [newGoal, setNewGoal] = useState({ title: "", description: "", category: "general" });
  const [editGoal, setEditGoal] = useState({ title: "", description: "", status: "in_progress", progress: 0 });
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [showCategoryGoals, setShowCategoryGoals] = useState<string | null>(null);

  // Predefined goal categories for selection
  const predefinedCategories = [
    { key: "digital", name: "Digital Wellness", icon: "📱", description: "Screen time, apps, tech habits" },
    { key: "physical", name: "Physical Health", icon: "🏃", description: "Exercise, fitness, sports" },
    { key: "mindfulness", name: "Mindfulness", icon: "🧘", description: "Meditation, yoga, mental health" },
    { key: "learning", name: "Learning & Skills", icon: "📚", description: "Education, courses, skill development" },
    { key: "health", name: "Health & Nutrition", icon: "🏥", description: "Diet, nutrition, medical checkups" },
    { key: "productivity", name: "Productivity", icon: "⚡", description: "Work habits, time management" },
    { key: "social", name: "Social & Relationships", icon: "👥", description: "Social connections, family time" },
    { key: "financial", name: "Financial", icon: "💰", description: "Savings, budgeting, investments" },
    { key: "creative", name: "Creative", icon: "🎨", description: "Art, music, writing, hobbies" },
    { key: "general", name: "General", icon: "⭐", description: "Other personal goals" }
  ];

  // Load goals from database
  const loadGoals = async () => {
    if (!user?.id) return;
    
    try {
      setLoading(true);
      const userGoals = await listGoals(user.id);
      setGoals(userGoals || []);
    } catch (error) {
      console.error("Error loading goals:", error);
      toast.error("Failed to load goals");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated && user?.id) {
      loadGoals();
    }
  }, [isAuthenticated, user?.id]);

  // Calculate stats from actual goals
  const completedGoals = goals.filter(goal => goal.status === 'completed').length;
  const totalGoals = goals.length;
  const completionRate = totalGoals > 0 ? (completedGoals / totalGoals) * 100 : 0;

  // Enhanced categorization system with all predefined categories
  const categorizeGoals = (goals: Goal[]) => {
    const categories = {
      digital: goals.filter(goal => {
        const title = goal.title.toLowerCase();
        const desc = (goal.description || '').toLowerCase();
        const text = `${title} ${desc}`;
        return text.includes('screen') || 
               text.includes('digital') ||
               text.includes('phone') ||
               text.includes('social') ||
               text.includes('app') ||
               text.includes('online') ||
               text.includes('computer') ||
               text.includes('laptop') ||
               text.includes('tech') ||
               text.includes('internet') ||
               text.includes('gaming') ||
               text.includes('streaming');
      }),
      physical: goals.filter(goal => {
        const title = goal.title.toLowerCase();
        const desc = (goal.description || '').toLowerCase();
        const text = `${title} ${desc}`;
        return text.includes('walk') || 
               text.includes('exercise') ||
               text.includes('fitness') ||
               text.includes('steps') ||
               text.includes('run') ||
               text.includes('jog') ||
               text.includes('gym') ||
               text.includes('workout') ||
               text.includes('sport') ||
               text.includes('bike') ||
               text.includes('swim') ||
               text.includes('dance') ||
               text.includes('hike') ||
               text.includes('cardio') ||
               text.includes('strength');
      }),
      mindfulness: goals.filter(goal => {
        const title = goal.title.toLowerCase();
        const desc = (goal.description || '').toLowerCase();
        const text = `${title} ${desc}`;
        return text.includes('meditation') || 
               text.includes('yoga') ||
               text.includes('mindfulness') ||
               text.includes('breathing') ||
               text.includes('relax') ||
               text.includes('stress') ||
               text.includes('anxiety') ||
               text.includes('sleep') ||
               text.includes('journal') ||
               text.includes('gratitude') ||
               text.includes('peace') ||
               text.includes('calm') ||
               text.includes('focus') ||
               text.includes('mental');
      }),
      learning: goals.filter(goal => {
        const title = goal.title.toLowerCase();
        const desc = (goal.description || '').toLowerCase();
        const text = `${title} ${desc}`;
        return text.includes('learn') || 
               text.includes('study') ||
               text.includes('read') ||
               text.includes('book') ||
               text.includes('course') ||
               text.includes('skill') ||
               text.includes('language') ||
               text.includes('programming') ||
               text.includes('coding') ||
               text.includes('education') ||
               text.includes('knowledge') ||
               text.includes('practice');
      }),
      health: goals.filter(goal => {
        const title = goal.title.toLowerCase();
        const desc = (goal.description || '').toLowerCase();
        const text = `${title} ${desc}`;
        return text.includes('health') || 
               text.includes('diet') ||
               text.includes('nutrition') ||
               text.includes('water') ||
               text.includes('vitamin') ||
               text.includes('doctor') ||
               text.includes('medical') ||
               text.includes('checkup') ||
               text.includes('weight') ||
               text.includes('meal') ||
               text.includes('food') ||
               text.includes('drink');
      }),
      productivity: goals.filter(goal => {
        const title = goal.title.toLowerCase();
        const desc = (goal.description || '').toLowerCase();
        const text = `${title} ${desc}`;
        return text.includes('productivity') || 
               text.includes('work') ||
               text.includes('task') ||
               text.includes('project') ||
               text.includes('deadline') ||
               text.includes('schedule') ||
               text.includes('time management') ||
               text.includes('organize') ||
               text.includes('efficiency') ||
               text.includes('focus');
      }),
      social: goals.filter(goal => {
        const title = goal.title.toLowerCase();
        const desc = (goal.description || '').toLowerCase();
        const text = `${title} ${desc}`;
        return text.includes('social') || 
               text.includes('friend') ||
               text.includes('family') ||
               text.includes('relationship') ||
               text.includes('meet') ||
               text.includes('connect') ||
               text.includes('community') ||
               text.includes('network') ||
               text.includes('hangout') ||
               text.includes('party');
      }),
      financial: goals.filter(goal => {
        const title = goal.title.toLowerCase();
        const desc = (goal.description || '').toLowerCase();
        const text = `${title} ${desc}`;
        return text.includes('money') || 
               text.includes('budget') ||
               text.includes('save') ||
               text.includes('invest') ||
               text.includes('financial') ||
               text.includes('debt') ||
               text.includes('income') ||
               text.includes('expense') ||
               text.includes('retirement') ||
               text.includes('wealth');
      }),
      creative: goals.filter(goal => {
        const title = goal.title.toLowerCase();
        const desc = (goal.description || '').toLowerCase();
        const text = `${title} ${desc}`;
        return text.includes('creative') || 
               text.includes('art') ||
               text.includes('music') ||
               text.includes('write') ||
               text.includes('draw') ||
               text.includes('paint') ||
               text.includes('design') ||
               text.includes('craft') ||
               text.includes('hobby') ||
               text.includes('photography');
      }),
      general: goals.filter(goal => {
        // General category for goals that don't fit other categories
        return true;
      })
    };
    return categories;
  };

  const goalCategories = categorizeGoals(goals);
  
  // Create goal categories data from predefined categories
  const goalCategoriesData = predefinedCategories.map(category => {
    const categoryGoals = goalCategories[category.key as keyof typeof goalCategories] || [];
    const completedGoals = categoryGoals.filter(g => g.status === 'completed').length;
    const progress = categoryGoals.length > 0 ? (completedGoals / categoryGoals.length) * 100 : 0;
    
    const colors = {
      digital: "from-blue-500 to-cyan-500",
      physical: "from-green-500 to-emerald-500", 
      mindfulness: "from-purple-500 to-pink-500",
      learning: "from-orange-500 to-red-500",
      health: "from-teal-500 to-green-500",
      productivity: "from-indigo-500 to-blue-500",
      social: "from-pink-500 to-rose-500",
      financial: "from-yellow-500 to-orange-500",
      creative: "from-violet-500 to-purple-500",
      general: "from-gray-500 to-slate-500"
    };
    
    return {
      name: category.name,
      description: category.description,
      progress,
      icon: category.icon,
      color: colors[category.key as keyof typeof colors],
      count: categoryGoals.length,
      key: category.key
    };
  });

  // Filter goals based on selected category
  const filteredGoals = selectedCategory === "all" 
    ? goals 
    : goalCategories[selectedCategory as keyof typeof goalCategories] || [];

  // Get goals for a specific category
  const getCategoryGoals = (categoryKey: string) => {
    return goalCategories[categoryKey as keyof typeof goalCategories] || [];
  };

  // Enhanced achievement system with comprehensive tracking
  const calculateAchievements = () => {
    const categoryStats = goalCategoriesData.map(cat => ({
      name: cat.name,
      count: cat.count,
      completed: cat.count > 0 ? Math.round((cat.progress / 100) * cat.count) : 0
    }));

    const recentGoals = goals
      .filter(goal => goal.status === 'completed')
      .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
      .slice(0, 5);

    const hasRecentCompletion = recentGoals.length > 0 && 
      (new Date().getTime() - new Date(recentGoals[0].updated_at).getTime()) < (7 * 24 * 60 * 60 * 1000);

    const achievements = [
      // Basic Achievements
      { 
        name: "Goal Setter", 
        description: "Created your first goal", 
        icon: Target, 
        color: "text-blue-500",
        bgColor: "bg-blue-50",
        borderColor: "border-blue-200",
        earned: totalGoals > 0,
        progress: Math.min(totalGoals, 1),
        maxProgress: 1
      },
      { 
        name: "First Success", 
        description: "Completed your first goal", 
        icon: CheckCircle, 
        color: "text-green-500",
        bgColor: "bg-green-50",
        borderColor: "border-green-200",
        earned: completedGoals > 0,
        progress: Math.min(completedGoals, 1),
        maxProgress: 1
      },
      
      // Quantity Achievements
      { 
        name: "Goal Crusher", 
        description: "Completed 5+ goals", 
        icon: Sparkles, 
        color: "text-purple-500",
        bgColor: "bg-purple-50",
        borderColor: "border-purple-200",
        earned: completedGoals >= 5,
        progress: Math.min(completedGoals, 5),
        maxProgress: 5
      },
      { 
        name: "Goal Master", 
        description: "Completed 10+ goals", 
        icon: Award, 
        color: "text-yellow-500",
        bgColor: "bg-yellow-50",
        borderColor: "border-yellow-200",
        earned: completedGoals >= 10,
        progress: Math.min(completedGoals, 10),
        maxProgress: 10
      },
      { 
        name: "Goal Legend", 
        description: "Completed 25+ goals", 
        icon: TrendingUp, 
        color: "text-orange-500",
        bgColor: "bg-orange-50",
        borderColor: "border-orange-200",
        earned: completedGoals >= 25,
        progress: Math.min(completedGoals, 25),
        maxProgress: 25
      },
      
      // Quality Achievements
      { 
        name: "Perfect Score", 
        description: "100% completion rate", 
        icon: CheckCircle, 
        color: "text-green-500",
        bgColor: "bg-green-50",
        borderColor: "border-green-200",
        earned: completionRate === 100 && totalGoals > 0,
        progress: Math.round(completionRate),
        maxProgress: 100
      },
      { 
        name: "High Achiever", 
        description: "80%+ completion rate", 
        icon: TrendingUp, 
        color: "text-blue-500",
        bgColor: "bg-blue-50",
        borderColor: "border-blue-200",
        earned: completionRate >= 80 && totalGoals > 0,
        progress: Math.round(completionRate),
        maxProgress: 100
      },
      
      // Category Achievements
      { 
        name: "Well-Rounded", 
        description: "Goals in 3+ categories", 
        icon: Target, 
        color: "text-indigo-500",
        bgColor: "bg-indigo-50",
        borderColor: "border-indigo-200",
        earned: categoryStats.filter(cat => cat.count > 0).length >= 3,
        progress: categoryStats.filter(cat => cat.count > 0).length,
        maxProgress: 3
      },
      { 
        name: "Category Master", 
        description: "Goals in 5+ categories", 
        icon: Award, 
        color: "text-pink-500",
        bgColor: "bg-pink-50",
        borderColor: "border-pink-200",
        earned: categoryStats.filter(cat => cat.count > 0).length >= 5,
        progress: categoryStats.filter(cat => cat.count > 0).length,
        maxProgress: 5
      },
      
      // Specific Category Achievements
      { 
        name: "Digital Wellness", 
        description: "Completed digital wellness goals", 
        icon: Target, 
        color: "text-cyan-500",
        bgColor: "bg-cyan-50",
        borderColor: "border-cyan-200",
        earned: categoryStats.find(cat => cat.name === "Digital Wellness")?.completed > 0,
        progress: categoryStats.find(cat => cat.name === "Digital Wellness")?.completed || 0,
        maxProgress: 1
      },
      { 
        name: "Fitness Enthusiast", 
        description: "Completed physical health goals", 
        icon: Target, 
        color: "text-emerald-500",
        bgColor: "bg-emerald-50",
        borderColor: "border-emerald-200",
        earned: categoryStats.find(cat => cat.name === "Physical Health")?.completed > 0,
        progress: categoryStats.find(cat => cat.name === "Physical Health")?.completed || 0,
        maxProgress: 1
      },
      { 
        name: "Mindful Soul", 
        description: "Completed mindfulness goals", 
        icon: Target, 
        color: "text-purple-500",
        bgColor: "bg-purple-50",
        borderColor: "border-purple-200",
        earned: categoryStats.find(cat => cat.name === "Mindfulness")?.completed > 0,
        progress: categoryStats.find(cat => cat.name === "Mindfulness")?.completed || 0,
        maxProgress: 1
      },
      { 
        name: "Lifelong Learner", 
        description: "Completed learning goals", 
        icon: Target, 
        color: "text-orange-500",
        bgColor: "bg-orange-50",
        borderColor: "border-orange-200",
        earned: categoryStats.find(cat => cat.name === "Learning & Skills")?.completed > 0,
        progress: categoryStats.find(cat => cat.name === "Learning & Skills")?.completed || 0,
        maxProgress: 1
      },
      
      // Time-based Achievements
      { 
        name: "Recent Success", 
        description: "Completed a goal this week", 
        icon: Calendar, 
        color: "text-teal-500",
        bgColor: "bg-teal-50",
        borderColor: "border-teal-200",
        earned: hasRecentCompletion,
        progress: hasRecentCompletion ? 1 : 0,
        maxProgress: 1
      },
      
      // Streak Achievements
      { 
        name: "Streak Master", 
        description: "Completed 3 goals in a row", 
        icon: Award, 
        color: "text-yellow-500",
        bgColor: "bg-yellow-50",
        borderColor: "border-yellow-200",
        earned: completedGoals >= 3,
        progress: Math.min(completedGoals, 3),
        maxProgress: 3
      },
      { 
        name: "Consistency King", 
        description: "Completed 7 goals in a row", 
        icon: Sparkles, 
        color: "text-violet-500",
        bgColor: "bg-violet-50",
        borderColor: "border-violet-200",
        earned: completedGoals >= 7,
        progress: Math.min(completedGoals, 7),
        maxProgress: 7
      }
    ];

    return achievements;
  };

  const achievements = calculateAchievements();
  const earnedAchievements = achievements.filter(achievement => achievement.earned);
  const unearnedAchievements = achievements.filter(achievement => !achievement.earned);

  // Create new goal
  const handleCreateGoal = async () => {
    if (!user?.id || !newGoal.title.trim()) return;

    try {
      const goal = await createGoal(user.id, {
        title: newGoal.title.trim(),
        description: newGoal.description.trim() || undefined
      });
      
      setGoals(prev => [goal, ...prev]);
      setNewGoal({ title: "", description: "", category: "general" });
      setIsCreateDialogOpen(false);
      toast.success("Goal created successfully! 🎯");
    } catch (error) {
      console.error("Error creating goal:", error);
      toast.error("Failed to create goal");
    }
  };

  // Update goal
  const handleUpdateGoal = async () => {
    if (!editingGoal) return;

    try {
      const updatedGoal = await updateGoal(editingGoal.id, {
        title: editGoal.title.trim(),
        description: editGoal.description.trim() || undefined,
        status: editGoal.status as 'in_progress' | 'completed' | 'paused',
        progress: editGoal.progress
      });
      
      setGoals(prev => prev.map(g => g.id === editingGoal.id ? updatedGoal : g));
      setEditingGoal(null);
      setIsEditDialogOpen(false);
      toast.success("Goal updated successfully! ✨");
    } catch (error) {
      console.error("Error updating goal:", error);
      toast.error("Failed to update goal");
    }
  };

  // Delete goal
  const handleDeleteGoal = async (goalId: string) => {
    try {
      await deleteGoal(goalId);
      setGoals(prev => prev.filter(g => g.id !== goalId));
      toast.success("Goal deleted successfully! 🗑️");
    } catch (error) {
      console.error("Error deleting goal:", error);
      toast.error("Failed to delete goal");
    }
  };

  // Toggle goal status
  const handleToggleGoalStatus = async (goal: Goal) => {
    const newStatus = goal.status === 'completed' ? 'in_progress' : 'completed';
    const newProgress = newStatus === 'completed' ? 100 : goal.progress;
    
    try {
      const updatedGoal = await updateGoal(goal.id, {
        status: newStatus,
        progress: newProgress
      });
      
      setGoals(prev => prev.map(g => g.id === goal.id ? updatedGoal : g));
      toast.success(newStatus === 'completed' ? "Goal completed! 🎉" : "Goal marked as in progress! 🔄");
    } catch (error) {
      console.error("Error updating goal status:", error);
      toast.error("Failed to update goal status");
    }
  };

  // Open edit dialog
  const handleEditGoal = (goal: Goal) => {
    setEditingGoal(goal);
    setEditGoal({
      title: goal.title,
      description: goal.description || "",
      status: goal.status,
      progress: goal.progress
    });
    setIsEditDialogOpen(true);
  };

  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], [0, -50]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0.8]);

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
            className="text-center mb-12 pt-8"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <motion.div
              className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-full border border-blue-200/20 mb-6"
              whileHover={{ scale: 1.05 }}
            >
              <Target className="w-4 h-4 text-blue-500" />
              <span className="text-sm font-medium text-blue-600">Goal Tracking</span>
            </motion.div>
            
            <motion.h1 
              className="text-5xl md:text-6xl font-bold mb-6"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
            >
              <motion.span 
                className="bg-gradient-to-r from-blue-600 via-purple-600 to-emerald-600 bg-clip-text text-transparent inline-block"
                whileHover={{ 
                  scale: 1.05, 
                  rotate: 1,
                  transition: { duration: 0.2, type: "spring", stiffness: 400 }
                }}
              >
                Your Goals
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
              Track your progress, celebrate achievements, and build better habits
            </motion.p>
          </motion.div>

          {/* Stats Cards */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <StaggeredCard index={0}>
              <Card className="relative overflow-hidden group hover:shadow-2xl transition-all duration-300">
                <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-emerald-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <CardHeader className="relative">
                  <CardTitle className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg">
                      <CheckCircle className="w-5 h-5 text-white" />
                    </div>
                    <span className="bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                      Completed
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="relative">
                  <motion.p 
                    className="text-4xl font-bold text-green-600"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                  >
                    {completedGoals}
                  </motion.p>
                  <p className="text-sm text-gray-500 mt-1">Goals achieved</p>
                </CardContent>
              </Card>
            </StaggeredCard>

            <StaggeredCard index={1}>
              <Card className="relative overflow-hidden group hover:shadow-2xl transition-all duration-300">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <CardHeader className="relative">
                  <CardTitle className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg">
                      <Target className="w-5 h-5 text-white" />
                    </div>
                    <span className="bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                      Total Goals
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
                    {totalGoals}
                  </motion.p>
                  <p className="text-sm text-gray-500 mt-1">Goals set</p>
                </CardContent>
              </Card>
            </StaggeredCard>

            <StaggeredCard index={2}>
              <Card className="relative overflow-hidden group hover:shadow-2xl transition-all duration-300">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <CardHeader className="relative">
                  <CardTitle className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg">
                      <TrendingUp className="w-5 h-5 text-white" />
                    </div>
                    <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                      Completion Rate
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="relative">
                  <motion.div
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ duration: 1, delay: 0.5 }}
                    className="origin-left"
                  >
                    <Progress value={completionRate} className="w-full h-3" />
                  </motion.div>
                  <motion.p 
                    className="text-center mt-3 text-2xl font-bold text-purple-600"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.8 }}
                  >
                    {completionRate.toFixed(0)}%
                  </motion.p>
                </CardContent>
              </Card>
            </StaggeredCard>
            </div>

          {/* Enhanced Achievements Section */}
          <StaggeredCard index={3}>
            <Card className="mb-12 relative overflow-hidden group hover:shadow-2xl transition-all duration-300">
              <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/5 to-orange-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <CardHeader className="relative">
                <CardTitle className="flex items-center gap-3 text-2xl">
                  <div className="p-2 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-lg">
                    <Award className="w-6 h-6 text-white" />
                  </div>
                  <span className="bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">
                    Achievements
                  </span>
                  <Badge variant="secondary" className="ml-auto">
                    {earnedAchievements.length}/{achievements.length}
                  </Badge>
                </CardTitle>
                <CardDescription className="text-lg">
                  Earn badges by completing goals and reaching milestones
                </CardDescription>
                </CardHeader>
              <CardContent className="relative">
                {/* Earned Achievements */}
                {earnedAchievements.length > 0 && (
                  <div className="mb-6">
                    <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      Earned Achievements ({earnedAchievements.length})
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {earnedAchievements.map((achievement, index) => (
                        <motion.div
                          key={achievement.name}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ duration: 0.5, delay: 0.6 + index * 0.1 }}
                          whileHover={{ scale: 1.02, y: -2 }}
                          className={`p-4 rounded-lg border-2 ${achievement.bgColor} ${achievement.borderColor} relative overflow-hidden`}
                        >
                          <div className="flex items-center gap-3 mb-2">
                            <achievement.icon className={`w-6 h-6 ${achievement.color}`} />
                            <h5 className="font-semibold text-gray-800">{achievement.name}</h5>
                            <div className="ml-auto">
                              <CheckCircle className="w-5 h-5 text-green-500" />
                            </div>
                          </div>
                          <p className="text-sm text-gray-600 mb-3">{achievement.description}</p>
                          {achievement.maxProgress > 1 && (
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className={`h-2 rounded-full ${achievement.color.replace('text-', 'bg-')}`}
                                style={{ width: `${(achievement.progress / achievement.maxProgress) * 100}%` }}
                              />
                            </div>
                          )}
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Unearned Achievements */}
                {unearnedAchievements.length > 0 && (
                  <div>
                    <h4 className="text-lg font-semibold text-gray-600 mb-4 flex items-center gap-2">
                      <Target className="w-5 h-5 text-gray-500" />
                      Available Achievements ({unearnedAchievements.length})
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {unearnedAchievements.slice(0, 6).map((achievement, index) => (
                        <motion.div
                          key={achievement.name}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ duration: 0.5, delay: 0.8 + index * 0.1 }}
                          whileHover={{ scale: 1.02, y: -2 }}
                          className="p-4 rounded-lg border-2 border-gray-200 bg-gray-50 relative overflow-hidden opacity-75"
                        >
                          <div className="flex items-center gap-3 mb-2">
                            <achievement.icon className={`w-6 h-6 ${achievement.color}`} />
                            <h5 className="font-semibold text-gray-600">{achievement.name}</h5>
                            <div className="ml-auto">
                              <Target className="w-5 h-5 text-gray-400" />
                            </div>
                          </div>
                          <p className="text-sm text-gray-500 mb-3">{achievement.description}</p>
                          {achievement.maxProgress > 1 && (
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className={`h-2 rounded-full ${achievement.color.replace('text-', 'bg-')}`}
                                style={{ width: `${(achievement.progress / achievement.maxProgress) * 100}%` }}
                              />
                              <p className="text-xs text-gray-500 mt-1">
                                {achievement.progress}/{achievement.maxProgress}
                              </p>
                            </div>
                          )}
                        </motion.div>
                      ))}
                    </div>
                    {unearnedAchievements.length > 6 && (
                      <p className="text-sm text-gray-500 text-center mt-4">
                        +{unearnedAchievements.length - 6} more achievements available
                      </p>
                    )}
                  </div>
                )}

                {/* Achievement Stats */}
                <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                    <div>
                      <p className="text-2xl font-bold text-blue-600">{earnedAchievements.length}</p>
                      <p className="text-sm text-gray-600">Earned</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-purple-600">{achievements.length}</p>
                      <p className="text-sm text-gray-600">Total</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-green-600">{completedGoals}</p>
                      <p className="text-sm text-gray-600">Goals Done</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-orange-600">{Math.round(completionRate)}%</p>
                      <p className="text-sm text-gray-600">Success Rate</p>
                    </div>
                  </div>
                  </div>
                </CardContent>
              </Card>
          </StaggeredCard>

          {/* Goal Categories Section */}
          <div>
            <motion.h2 
              className="text-3xl font-bold mb-8 text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.8 }}
            >
              <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                Goal Categories
              </span>
            </motion.h2>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
              {goalCategoriesData.map((goal, index) => (
                <StaggeredCard key={goal.name} index={index + 4}>
                  <motion.div
                    whileHover={{ y: -5, scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="h-full"
                  >
                    <Card 
                      className={`relative overflow-hidden group hover:shadow-2xl transition-all duration-300 h-full cursor-pointer ${
                        selectedCategory === goal.key ? 'ring-2 ring-blue-500 shadow-lg' : ''
                      }`}
                      onClick={() => {
                        setSelectedCategory(goal.key);
                        setShowCategoryGoals(showCategoryGoals === goal.key ? null : goal.key);
                      }}
                    >
                      <div className={`absolute inset-0 bg-gradient-to-br ${goal.color} opacity-5 group-hover:opacity-10 transition-opacity duration-300`} />
                      <CardHeader className="relative">
                        <CardTitle className="flex items-center gap-3 text-xl">
                          <span className="text-3xl">{goal.icon}</span>
                          <span className={`bg-gradient-to-r ${goal.color} bg-clip-text text-transparent`}>
                            {goal.name}
                          </span>
                          <Badge 
                            variant={goal.count > 0 ? "default" : "secondary"} 
                            className={`ml-auto ${
                              goal.count > 0 
                                ? `bg-gradient-to-r ${goal.color} text-white` 
                                : 'bg-gray-200 text-gray-600'
                            }`}
                          >
                            {goal.count} goals
                          </Badge>
                        </CardTitle>
                        <CardDescription className="text-base">{goal.description}</CardDescription>
                      </CardHeader>
                      <CardContent className="relative">
                        <motion.div
                          initial={{ scaleX: 0 }}
                          animate={{ scaleX: 1 }}
                          transition={{ duration: 1, delay: 1 + index * 0.2 }}
                          className="origin-left"
                        >
                          <Progress 
                            value={goal.progress} 
                            className="w-full h-3 mb-3"
                          />
                        </motion.div>
                        <motion.p 
                          className="text-center text-2xl font-bold"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.5, delay: 1.2 + index * 0.2 }}
                        >
                          <span className={`bg-gradient-to-r ${goal.color} bg-clip-text text-transparent`}>
                            {Math.round(goal.progress)}%
                          </span>
                        </motion.p>
                        {goal.count > 0 && (
                          <motion.div
                            className="mt-2 text-center"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.5, delay: 1.4 + index * 0.2 }}
                          >
                            <p className="text-sm text-gray-500">
                              {showCategoryGoals === goal.key ? 'Click to hide goals' : 'Click to view goals'}
                            </p>
                          </motion.div>
                        )}
                </CardContent>
              </Card>
                  </motion.div>
                </StaggeredCard>
              ))}
            </div>
          </div>

          {/* Goals List Section */}
          <div className="mt-16">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
              <motion.h2 
                className="text-3xl font-bold"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 1.4 }}
              >
                <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                  {selectedCategory === "all" ? "All Goals" : `${goalCategoriesData.find(c => c.key === selectedCategory)?.name} Goals`}
                </span>
              </motion.h2>
              
              {/* Category Filter */}
              <div className="flex items-center gap-4">
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filter by category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {goalCategoriesData.map((category) => (
                      <SelectItem key={category.key} value={category.key}>
                        <div className="flex items-center gap-2">
                          <span>{category.icon}</span>
                          <span>{category.name}</span>
                          <Badge variant="secondary" className="ml-auto">
                            {category.count}
                          </Badge>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
              
              <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogTrigger asChild>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Goal
                    </Button>
                  </motion.div>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Create New Goal</DialogTitle>
                    <DialogDescription>
                      Set a new goal to track your progress and stay motivated.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <label htmlFor="title" className="text-sm font-medium">
                        Goal Title
                      </label>
                      <Input
                        id="title"
                        placeholder="e.g., Walk 10,000 steps daily"
                        value={newGoal.title}
                        onChange={(e) => setNewGoal(prev => ({ ...prev, title: e.target.value }))}
                      />
                    </div>
                    <div className="grid gap-2">
                      <label htmlFor="description" className="text-sm font-medium">
                        Description (Optional)
                      </label>
                      <Textarea
                        id="description"
                        placeholder="Add more details about your goal..."
                        value={newGoal.description}
                        onChange={(e) => setNewGoal(prev => ({ ...prev, description: e.target.value }))}
                      />
                    </div>
                    <div className="grid gap-2">
                      <label htmlFor="category" className="text-sm font-medium">
                        Category
                      </label>
                      <Select 
                        value={newGoal.category} 
                        onValueChange={(value) => setNewGoal(prev => ({ ...prev, category: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                        <SelectContent>
                          {predefinedCategories.map((category) => (
                            <SelectItem key={category.key} value={category.key}>
                              <div className="flex items-center gap-2">
                                <span>{category.icon}</span>
                                <span>{category.name}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-gray-500">
                        {predefinedCategories.find(c => c.key === newGoal.category)?.description}
                      </p>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button 
                      onClick={handleCreateGoal}
                      disabled={!newGoal.title.trim()}
                      className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
                    >
                      Create Goal
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading your goals...</p>
              </div>
            ) : goals.length === 0 ? (
              <motion.div 
                className="text-center py-12"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 1.6 }}
              >
                <Target className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-600 mb-2">No goals yet</h3>
                <p className="text-gray-500 mb-6">Create your first goal to start tracking your progress!</p>
                <Button 
                  onClick={() => setIsCreateDialogOpen(true)}
                  className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create Your First Goal
                </Button>
              </motion.div>
            ) : (
              <div className="grid gap-4">
                {filteredGoals.map((goal, index) => (
                  <StaggeredCard key={goal.id} index={index + 7}>
                    <Card className="relative overflow-hidden group hover:shadow-xl transition-all duration-300">
                      <div className={`absolute inset-0 ${
                        goal.status === 'completed' 
                          ? 'bg-gradient-to-r from-green-500/5 to-emerald-500/5' 
                          : 'bg-gradient-to-r from-blue-500/5 to-purple-500/5'
                      } opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
                      
                      <CardContent className="relative p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className={`text-xl font-semibold ${
                                goal.status === 'completed' ? 'line-through text-gray-500' : 'text-gray-900'
                              }`}>
                                {goal.title}
                              </h3>
                              <Badge 
                                variant={goal.status === 'completed' ? 'default' : 'secondary'}
                                className={goal.status === 'completed' ? 'bg-green-500' : ''}
                              >
                                {goal.status === 'completed' ? 'Completed' : 'In Progress'}
                              </Badge>
                            </div>
                            
                            {goal.description && (
                              <p className="text-gray-600 mb-4">{goal.description}</p>
                            )}
                            
                            <div className="flex items-center gap-4">
                              <div className="flex-1">
                                <div className="flex items-center justify-between mb-1">
                                  <span className="text-sm text-gray-500">Progress</span>
                                  <span className="text-sm font-medium">{goal.progress}%</span>
                                </div>
                                <Progress value={goal.progress} className="h-2" />
                              </div>
                            </div>
                      </div>
                          
                          <div className="flex items-center gap-2 ml-4">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleToggleGoalStatus(goal)}
                              className={goal.status === 'completed' ? 'text-green-600 border-green-600' : 'text-blue-600 border-blue-600'}
                            >
                              {goal.status === 'completed' ? (
                                <X className="w-4 h-4" />
                              ) : (
                                <Check className="w-4 h-4" />
                              )}
                          </Button>
                            
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEditGoal(goal)}
                            >
                              <Edit className="w-4 h-4" />
                          </Button>
                            
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDeleteGoal(goal.id)}
                              className="text-red-600 border-red-600 hover:bg-red-50"
                            >
                              <Trash2 className="w-4 h-4" />
                        </Button>
                          </div>
                      </div>
                    </CardContent>
                  </Card>
                  </StaggeredCard>
                ))}
              </div>
            )}

            {/* Category Goals Preview */}
            {showCategoryGoals && getCategoryGoals(showCategoryGoals).length > 0 && (
              <motion.div 
                className="mt-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6 border border-blue-200">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-semibold text-gray-800">
                      {goalCategoriesData.find(c => c.key === showCategoryGoals)?.name} Goals
                    </h3>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setShowCategoryGoals(null)}
                    >
                      <X className="w-4 h-4 mr-2" />
                      Close
                    </Button>
                  </div>
                  <div className="grid gap-3">
                    {getCategoryGoals(showCategoryGoals).slice(0, 3).map((goal, index) => (
                      <motion.div
                        key={goal.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.4, delay: index * 0.1 }}
                        className="flex items-center justify-between p-3 bg-white rounded-lg shadow-sm"
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-3 h-3 rounded-full ${
                            goal.status === 'completed' ? 'bg-green-500' : 'bg-blue-500'
                          }`} />
                          <span className={`font-medium ${
                            goal.status === 'completed' ? 'line-through text-gray-500' : 'text-gray-800'
                          }`}>
                            {goal.title}
                          </span>
            </div>
                        <div className="flex items-center gap-2">
                          <Progress value={goal.progress} className="w-20 h-2" />
                          <span className="text-sm text-gray-500">{goal.progress}%</span>
                    </div>
                      </motion.div>
                    ))}
                    {getCategoryGoals(showCategoryGoals).length > 3 && (
                      <p className="text-sm text-gray-500 text-center mt-2">
                        +{getCategoryGoals(showCategoryGoals).length - 3} more goals
                      </p>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
        </div>
      </motion.div>

      {/* Edit Goal Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Goal</DialogTitle>
            <DialogDescription>
              Update your goal details and progress.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <label htmlFor="edit-title" className="text-sm font-medium">
                Goal Title
              </label>
              <Input
                id="edit-title"
                value={editGoal.title}
                onChange={(e) => setEditGoal(prev => ({ ...prev, title: e.target.value }))}
              />
            </div>
            <div className="grid gap-2">
              <label htmlFor="edit-description" className="text-sm font-medium">
                Description
              </label>
              <Textarea
                id="edit-description"
                value={editGoal.description}
                onChange={(e) => setEditGoal(prev => ({ ...prev, description: e.target.value }))}
              />
            </div>
            <div className="grid gap-2">
              <label htmlFor="edit-status" className="text-sm font-medium">
                Status
              </label>
              <Select 
                value={editGoal.status} 
                onValueChange={(value) => setEditGoal(prev => ({ ...prev, status: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="paused">Paused</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <label htmlFor="edit-progress" className="text-sm font-medium">
                Progress: {editGoal.progress}%
              </label>
              <input
                type="range"
                min="0"
                max="100"
                value={editGoal.progress}
                onChange={(e) => setEditGoal(prev => ({ ...prev, progress: parseInt(e.target.value) }))}
                className="w-full"
              />
            </div>
      </div>
          <DialogFooter>
            <Button 
              onClick={handleUpdateGoal}
              className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
            >
              Update Goal
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Goals;