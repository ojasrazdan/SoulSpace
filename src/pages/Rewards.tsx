import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Award, Star, ShoppingCart, ShieldCheck, Trophy, Zap, Target, Calendar, TrendingUp, Gift, Crown, Sparkles, Users, MessageCircle, ThumbsUp, Clock, Globe, Layers } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAccessibility } from "@/hooks/AccessibilityContext";
import { 
  getUserProgress, 
  getDailyChallenges, 
  completeDailyChallenge, 
  getUserRewards,
  type UserProgress, 
  type DailyChallenge, 
  type Reward 
} from "@/lib/rewards";
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

const Rewards = () => {
  const { toast } = useToast();
  const { highContrast, adhdMode } = useAccessibility();
  const [userProgress, setUserProgress] = useState<UserProgress | null>(null);
  const [dailyChallenges, setDailyChallenges] = useState<DailyChallenge[]>([]);
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  // Advanced GSAP animations
  useEffect(() => {
    // Ensure elements are visible by default and reset any transforms
    gsap.set(".rewards-header", { opacity: 1, y: 0, rotation: 0 });
    gsap.set(".rewards-stats", { opacity: 1, y: 0, rotation: 0 });
    gsap.set(".rewards-content", { opacity: 1, y: 0, rotation: 0 });
    
    // Specifically reset the badge rotation
    gsap.set(".achievement-badge", { rotation: 0, transformOrigin: "center center" });

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

  }, [userProgress, dailyChallenges, rewards]);

  const loadData = async () => {
    try {
      const [progress, challenges, userRewards] = await Promise.all([
        getUserProgress(),
        getDailyChallenges(),
        getUserRewards()
      ]);
      setUserProgress(progress);
      setDailyChallenges(challenges);
      setRewards(userRewards);
    } catch (error) {
      console.error('Failed to load rewards data:', error);
      toast({
        title: "Error",
        description: "Failed to load rewards data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteChallenge = async (challengeId: string) => {
    try {
      const result = await completeDailyChallenge(challengeId);
      
      // Refresh data
      await loadData();
      
      toast({
        title: "Challenge Completed! 🎉",
        description: `You earned ${result.xpGained} XP and ${result.pointsGained} Calm Points!${result.leveledUp ? ' You leveled up! 🚀' : ''}`,
        duration: 5000,
      });
    } catch (error) {
      console.error('Failed to complete challenge:', error);
      toast({
        title: "Error",
        description: "Failed to complete challenge. Please try again.",
        variant: "destructive",
      });
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'hard': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'wellness': return '🧘';
      case 'productivity': return '⚡';
      case 'social': return '👥';
      case 'learning': return '📚';
      default: return '🎯';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-amber-50 overflow-hidden">
        <motion.div 
          className="relative overflow-hidden bg-gradient-to-br from-slate-50 via-white to-amber-50 py-20"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
        >
          <MorphingBackground />
          <FloatingParticles />
          
          <div className="container mx-auto px-4 relative z-10">
            <motion.div 
              className="text-center py-20"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, ease: "easeOut" }}
            >
              <motion.div
                className="w-20 h-20 bg-gradient-to-br from-amber-500 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-8"
                animate={{ 
                  scale: [1, 1.1, 1],
                  rotate: [0, 360, 0]
                }}
                transition={{ 
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                <Trophy className="h-10 w-10 text-white" />
              </motion.div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4 font-heading">Loading Your Rewards</h2>
              <p className="text-gray-600 font-body">Preparing your progress and achievements...</p>
            </motion.div>
          </div>
        </motion.div>
      </div>
    );
  }

  const progressPercentage = userProgress ? (userProgress.xp / (userProgress.xp + (1000 * Math.pow(1.2, userProgress.level - 1)))) * 100 : 0;

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
            className="text-center max-w-4xl mx-auto rewards-header"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
          >
            {/* Animated badge */}
            <div className="achievement-badge inline-flex items-center gap-2 bg-gradient-to-r from-amber-100 to-orange-100 text-amber-800 px-6 py-3 rounded-full text-sm font-medium mb-8 font-body shadow-lg backdrop-blur-sm">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              >
                <Trophy className="h-4 w-4" />
              </motion.div>
              Your Achievement Journey
            </div>
            
            {/* Animated title */}
            <motion.h1 
              className="text-5xl md:text-6xl lg:text-7xl font-bold mb-8 font-heading text-gray-900"
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.2, ease: "easeOut" }}
            >
              <motion.span
                className="inline-block bg-gradient-to-r from-gray-900 via-amber-600 to-rose-600 bg-clip-text text-transparent"
                whileHover={{ scale: 1.05 }}
                transition={{ 
                  type: "spring", 
                  stiffness: 400, 
                  damping: 25,
                  duration: 0.3
                }}
                style={{ transform: "rotate(0deg)" }}
              >
                Rewards & Progress
              </motion.span>
            </motion.h1>
            
            {/* Animated subtitle */}
            <motion.p 
              className="text-xl md:text-2xl text-gray-600 mb-12 font-body leading-relaxed max-w-3xl mx-auto"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
            Track your journey and earn rewards for your wellness activities
            </motion.p>
          </motion.div>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-20 relative z-10">
        <div className="max-w-6xl mx-auto rewards-content">

        {/* Progress Overview */}
          <motion.div
            className="mb-12"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Card className="bg-white/80 backdrop-blur-sm shadow-xl border-0 overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-amber-50 to-orange-50 border-b border-amber-100">
                <CardTitle className="flex items-center gap-3 font-heading text-2xl">
                  <motion.div
                    className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center"
                    whileHover={{ rotate: 360, scale: 1.1 }}
                    transition={{ duration: 0.6 }}
                  >
                    <Crown className="h-5 w-5 text-white" />
                  </motion.div>
              Your Progress
            </CardTitle>
                <CardDescription className="font-body text-gray-600">
                  Track your wellness journey and achievements
                </CardDescription>
          </CardHeader>
              <CardContent className="p-8">
                <div className="grid md:grid-cols-4 gap-6 rewards-stats animate-fade-in-up">
                  <motion.div
                    className="text-center p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 group"
                    whileHover={{ y: -5, scale: 1.02 }}
                    transition={{ duration: 0.3 }}
                  >
                    <motion.div
                      className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4"
                      whileHover={{ rotate: 360, scale: 1.1 }}
                      transition={{ duration: 0.6 }}
                    >
                      <Crown className="h-8 w-8 text-white" />
                    </motion.div>
                    <div className="text-3xl font-bold text-blue-600 mb-2 font-heading">Level {userProgress?.level || 1}</div>
                    <div className="text-sm text-blue-800 font-body mb-3">Current Level</div>
                    <Progress value={progressPercentage} className="mb-2" />
                    <div className="text-xs text-blue-600 font-body">
                  {userProgress?.xp || 0} / {Math.floor(1000 * Math.pow(1.2, (userProgress?.level || 1) - 1))} XP
                </div>
                  </motion.div>
                  
                  <motion.div
                    className="text-center p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 group"
                    whileHover={{ y: -5, scale: 1.02 }}
                    transition={{ duration: 0.3 }}
                  >
                    <motion.div
                      className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4"
                      whileHover={{ rotate: 360, scale: 1.1 }}
                      transition={{ duration: 0.6 }}
                    >
                      <Zap className="h-8 w-8 text-white" />
                    </motion.div>
                    <div className="text-3xl font-bold text-green-600 mb-2 font-heading">{userProgress?.total_xp || 0}</div>
                    <div className="text-sm text-green-800 font-body">Total XP</div>
                  </motion.div>
                  
                  <motion.div
                    className="text-center p-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 group"
                    whileHover={{ y: -5, scale: 1.02 }}
                    transition={{ duration: 0.3 }}
                  >
                    <motion.div
                      className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4"
                      whileHover={{ rotate: 360, scale: 1.1 }}
                      transition={{ duration: 0.6 }}
                    >
                      <Star className="h-8 w-8 text-white" />
                    </motion.div>
                    <div className="text-3xl font-bold text-purple-600 mb-2 font-heading">{userProgress?.calm_points || 0}</div>
                    <div className="text-sm text-purple-800 font-body">Calm Points</div>
                  </motion.div>
                  
                  <motion.div
                    className="flex items-center justify-center"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-body font-medium py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 magnetic-button">
                      <motion.div
                        className="flex items-center gap-2"
                        whileHover={{ x: 5 }}
                        transition={{ duration: 0.2 }}
                      >
                        <ShoppingCart className="h-5 w-5" />
                  Redeem Points
                      </motion.div>
                </Button>
                  </motion.div>
            </div>
          </CardContent>
        </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
        <Tabs defaultValue="challenges" className="space-y-6">
              <TabsList className="grid w-full grid-cols-3 bg-white/80 backdrop-blur-sm shadow-lg border-0 rounded-xl p-1">
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <TabsTrigger value="challenges" className="flex items-center gap-2 font-body data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-500 data-[state=active]:to-orange-600 data-[state=active]:text-white rounded-lg">
              <Target className="h-4 w-4" />
              Daily Challenges
            </TabsTrigger>
                </motion.div>
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <TabsTrigger value="achievements" className="flex items-center gap-2 font-body data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-indigo-600 data-[state=active]:text-white rounded-lg">
              <Award className="h-4 w-4" />
              Achievements
            </TabsTrigger>
                </motion.div>
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <TabsTrigger value="rewards" className="flex items-center gap-2 font-body data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-emerald-600 data-[state=active]:text-white rounded-lg">
              <Gift className="h-4 w-4" />
              Rewards
            </TabsTrigger>
                </motion.div>
          </TabsList>

          <TabsContent value="challenges" className="space-y-6">
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                >
                  <Card className="bg-white/80 backdrop-blur-sm shadow-xl border-0 overflow-hidden">
                    <CardHeader className="bg-gradient-to-r from-amber-50 to-orange-50 border-b border-amber-100">
                      <CardTitle className="flex items-center gap-3 font-heading text-xl">
                        <motion.div
                          className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center"
                          whileHover={{ rotate: 360, scale: 1.1 }}
                          transition={{ duration: 0.6 }}
                        >
                          <Calendar className="h-5 w-5 text-white" />
                        </motion.div>
                  Today's Challenges
                </CardTitle>
                      <CardDescription className="font-body text-gray-600">
                  Complete challenges to earn XP and Calm Points
                </CardDescription>
              </CardHeader>
                    <CardContent className="p-6">
                {dailyChallenges.length === 0 ? (
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
                            <Target className="h-12 w-12 text-gray-400" />
                          </motion.div>
                          <h3 className="text-2xl font-bold text-gray-900 mb-2 font-heading">No Challenges Today</h3>
                          <p className="text-gray-600 font-body">Check back tomorrow for new challenges!</p>
                        </motion.div>
                      ) : (
                        <div className="grid md:grid-cols-2 gap-6">
                          {dailyChallenges.map((challenge, index) => (
                            <StaggeredCard key={challenge.id} index={index}>
                              <motion.div
                                className={`rounded-xl p-6 bg-white/50 backdrop-blur-sm border transition-all duration-300 group ${
                                  challenge.is_completed 
                                    ? 'bg-green-50 border-green-200 shadow-lg' 
                                    : 'border-gray-200 hover:shadow-lg hover:border-amber-300'
                                }`}
                                whileHover={{ y: -5, scale: 1.02 }}
                                transition={{ duration: 0.3 }}
                              >
                                <div className="flex items-start justify-between mb-4">
                                  <div className="flex items-center gap-3">
                                    <motion.div
                                      className="text-3xl"
                                      whileHover={{ scale: 1.2, rotate: 10 }}
                                      transition={{ duration: 0.3 }}
                                    >
                                      {getCategoryIcon(challenge.category)}
                                    </motion.div>
                              <div>
                                      <h3 className="font-semibold text-lg font-heading text-gray-900">{challenge.title}</h3>
                                      <Badge className={`text-xs font-body ${getDifficultyColor(challenge.difficulty)}`}>
                                  {challenge.difficulty}
                                </Badge>
                              </div>
                            </div>
                            <div className="text-right">
                                    <div className="text-sm font-medium text-green-600 font-body">+{challenge.xp_reward} XP</div>
                                    <div className="text-sm text-purple-600 font-body">+{challenge.points_reward} CP</div>
                            </div>
                          </div>
                          
                                <p className="text-sm text-gray-600 font-body mb-4 leading-relaxed">{challenge.description}</p>
                          
                          {challenge.is_completed ? (
                                  <motion.div 
                                    className="flex items-center gap-2 text-green-600"
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ duration: 0.5 }}
                                  >
                              <ShieldCheck className="h-4 w-4" />
                                    <span className="text-sm font-medium font-body">Completed!</span>
                                  </motion.div>
                          ) : (
                                  <motion.div
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                  >
                            <Button 
                              size="sm" 
                              onClick={() => handleCompleteChallenge(challenge.id)}
                                      className="w-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-body font-medium rounded-lg magnetic-button"
                            >
                              Complete Challenge
                            </Button>
                                  </motion.div>
                          )}
                              </motion.div>
                            </StaggeredCard>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
                </motion.div>
          </TabsContent>

          <TabsContent value="achievements" className="space-y-6">
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                >
                  <Card className="bg-white/80 backdrop-blur-sm shadow-xl border-0 overflow-hidden">
                    <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100">
                      <CardTitle className="flex items-center gap-3 font-heading text-xl">
                        <motion.div
                          className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center"
                          whileHover={{ rotate: 360, scale: 1.1 }}
                          transition={{ duration: 0.6 }}
                        >
                          <Award className="h-5 w-5 text-white" />
                        </motion.div>
                  Your Achievements
                </CardTitle>
                      <CardDescription className="font-body text-gray-600">
                  Unlock achievements by completing various activities
                </CardDescription>
              </CardHeader>
                    <CardContent className="p-6">
                      <div className="grid md:grid-cols-2 gap-6">
                        {[
                          { emoji: "🏆", title: "First Goal Completed", description: "Complete your first goal", status: "Earned", earned: true },
                          { emoji: "🧘", title: "Mindful Assessment", description: "Complete your first assessment", status: "Earned", earned: true },
                          { emoji: "💧", title: "Hydration Hero", description: "Drink 8 glasses of water for 3 days", status: "Locked", earned: false },
                          { emoji: "🔥", title: "Streak Master", description: "Complete daily challenges for 7 days", status: "Locked", earned: false }
                        ].map((achievement, index) => (
                          <StaggeredCard key={index} index={index}>
                            <motion.div
                              className={`flex items-center gap-4 p-6 rounded-xl border transition-all duration-300 group ${
                                achievement.earned 
                                  ? 'bg-green-50 border-green-200 shadow-lg hover:shadow-xl' 
                                  : 'bg-gray-50 border-gray-200 hover:shadow-lg hover:border-gray-300'
                              }`}
                              whileHover={{ y: -5, scale: 1.02 }}
                              transition={{ duration: 0.3 }}
                            >
                              <motion.div
                                className="text-3xl"
                                whileHover={{ scale: 1.2, rotate: 10 }}
                                transition={{ duration: 0.3 }}
                              >
                                {achievement.emoji}
                              </motion.div>
                              <div className="flex-1">
                                <p className="font-medium text-lg font-heading text-gray-900">{achievement.title}</p>
                                <p className="text-sm text-gray-600 font-body">{achievement.description}</p>
                    </div>
                              <Badge className={`font-body ${
                                achievement.earned 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-gray-100 text-gray-800'
                              }`}>
                                {achievement.status}
                              </Badge>
                            </motion.div>
                          </StaggeredCard>
                        ))}
                </div>
              </CardContent>
            </Card>
                </motion.div>
          </TabsContent>

          <TabsContent value="rewards" className="space-y-6">
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                >
                  <Card className="bg-white/80 backdrop-blur-sm shadow-xl border-0 overflow-hidden">
                    <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 border-b border-green-100">
                      <CardTitle className="flex items-center gap-3 font-heading text-xl">
                        <motion.div
                          className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center"
                          whileHover={{ rotate: 360, scale: 1.1 }}
                          transition={{ duration: 0.6 }}
                        >
                          <Gift className="h-5 w-5 text-white" />
                        </motion.div>
                  Your Rewards
                </CardTitle>
                      <CardDescription className="font-body text-gray-600">
                  Rewards earned through your wellness journey
                </CardDescription>
              </CardHeader>
                    <CardContent className="p-6">
                {rewards.length === 0 ? (
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
                            <Gift className="h-12 w-12 text-gray-400" />
                          </motion.div>
                          <h3 className="text-2xl font-bold text-gray-900 mb-2 font-heading">No Rewards Yet</h3>
                          <p className="text-gray-600 font-body">Keep completing activities to earn rewards!</p>
                        </motion.div>
                      ) : (
                        <div className="grid md:grid-cols-2 gap-6">
                          {rewards.map((reward, index) => (
                            <StaggeredCard key={reward.id} index={index}>
                              <motion.div
                                className={`rounded-xl p-6 bg-white/50 backdrop-blur-sm border transition-all duration-300 group ${
                                  reward.redeemed 
                                    ? 'bg-gray-50 border-gray-200 shadow-lg' 
                                    : 'border-gray-200 hover:shadow-lg hover:border-green-300'
                                }`}
                                whileHover={{ y: -5, scale: 1.02 }}
                                transition={{ duration: 0.3 }}
                              >
                          <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-4">
                                    <motion.div
                                      className="text-3xl"
                                      whileHover={{ scale: 1.2, rotate: 10 }}
                                      transition={{ duration: 0.3 }}
                                    >
                                      🎁
                                    </motion.div>
                              <div>
                                      <h3 className="font-semibold text-lg font-heading text-gray-900">{reward.name}</h3>
                                      <p className="text-sm text-gray-600 font-body">
                                  {reward.points} Calm Points
                                </p>
                              </div>
                            </div>
                            <div>
                              {reward.redeemed ? (
                                      <Badge className="bg-gray-100 text-gray-800 font-body">Redeemed</Badge>
                                    ) : (
                                      <motion.div
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                      >
                                        <Button size="sm" variant="outline" className="border-green-300 text-green-700 hover:bg-green-50 font-body">
                                  Redeem
                                </Button>
                                      </motion.div>
                              )}
                            </div>
                          </div>
                              </motion.div>
                            </StaggeredCard>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
                </motion.div>
          </TabsContent>
        </Tabs>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Rewards;