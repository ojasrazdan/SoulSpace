import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Calendar, 
  Heart, 
  Droplets, 
  Smile, 
  Frown, 
  CheckCircle, 
  Sparkles, 
  Star,
  Moon,
  Sun,
  Zap,
  Coffee,
  BookOpen,
  Users,
  Target,
  Gift,
  Trophy,
  Flame,
  Leaf,
  Rainbow,
  Flower,
  Flower2
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getSession } from "@/lib/auth";
import { getTodayCheckin, upsertTodayCheckin } from "@/lib/checkins";
import { supabase } from "@/lib/supabaseClient";
import { useAccessibility } from "../hooks/AccessibilityContext";
import { motion, useScroll, useTransform, useSpring, useInView } from "framer-motion";
import { useInView as useInViewSpring, animated, useSprings } from "@react-spring/web";
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
      initial={{ opacity: 1, y: 0 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 1, y: 0 }}
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
      initial={{ opacity: 1, y: 0, scale: 1 }}
      animate={isInView ? { opacity: 1, y: 0, scale: 1 } : { opacity: 1, y: 0, scale: 1 }}
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

const MOOD_LABELS = [
  { label: "Very Low", emoji: "😢", color: "text-red-500", bg: "bg-red-50" },
  { label: "Low", emoji: "😔", color: "text-orange-500", bg: "bg-orange-50" },
  { label: "Okay", emoji: "😐", color: "text-yellow-500", bg: "bg-yellow-50" },
  { label: "Good", emoji: "🙂", color: "text-blue-500", bg: "bg-blue-50" },
  { label: "Great", emoji: "😊", color: "text-green-500", bg: "bg-green-50" }
];

const ENERGY_LABELS = [
  { label: "Exhausted", emoji: "😴", color: "text-gray-500", bg: "bg-gray-50" },
  { label: "Tired", emoji: "😮‍💨", color: "text-orange-500", bg: "bg-orange-50" },
  { label: "Moderate", emoji: "😌", color: "text-yellow-500", bg: "bg-yellow-50" },
  { label: "Energetic", emoji: "⚡", color: "text-blue-500", bg: "bg-blue-50" },
  { label: "Very Energetic", emoji: "🚀", color: "text-green-500", bg: "bg-green-50" }
];

const QUICK_ACTIVITIES = [
  { text: "Spent time outdoors", emoji: "🌳", icon: Flower, color: "bg-green-100 hover:bg-green-200" },
  { text: "Exercised or moved my body", emoji: "💪", icon: Zap, color: "bg-blue-100 hover:bg-blue-200" },
  { text: "Connected with friends/family", emoji: "👥", icon: Users, color: "bg-purple-100 hover:bg-purple-200" },
  { text: "Practiced mindfulness", emoji: "🧘‍♀️", icon: Leaf, color: "bg-emerald-100 hover:bg-emerald-200" },
  { text: "Got enough sleep", emoji: "😴", icon: Moon, color: "bg-indigo-100 hover:bg-indigo-200" },
  { text: "Ate healthy meals", emoji: "🥗", icon: Heart, color: "bg-green-100 hover:bg-green-200" },
  { text: "Accomplished a goal", emoji: "🎯", icon: Target, color: "bg-orange-100 hover:bg-orange-200" },
  { text: "Helped someone else", emoji: "🤝", icon: Gift, color: "bg-pink-100 hover:bg-pink-200" },
  { text: "Learned something new", emoji: "📚", icon: BookOpen, color: "bg-yellow-100 hover:bg-yellow-200" },
  { text: "Took a break when needed", emoji: "☕", icon: Coffee, color: "bg-amber-100 hover:bg-amber-200" }
];

const DailyCheckin = () => {
  const { ttsEnabled, speakText, highContrast, adhdMode } = useAccessibility();
  const containerRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);
  const submitRef = useRef<HTMLDivElement>(null);

  const [checkinData, setCheckinData] = useState({
    mood: [3],
    energy: [3],
    gratitude: "",
    challenge: "",
    tomorrow: "",
    activities: [] as string[],
    waterIntake: [4], // glasses of water
    sleepHours: [7]
  });
  const [showCelebration, setShowCelebration] = useState(false);
  const [loading, setLoading] = useState(false);

  const { toast } = useToast();

  // Speak content when any relevant state changes
  useEffect(() => {
    if (ttsEnabled && containerRef.current) {
      speakText(containerRef.current.textContent || "");
    }
  }, [ttsEnabled, checkinData, speakText]);

  // Advanced GSAP animations with fallbacks
  useEffect(() => {
    // Ensure elements are visible by default
    gsap.set(".checkin-header", { opacity: 1, y: 0 });
    gsap.set(".checkin-cards", { opacity: 1, y: 0 });
    gsap.set(".checkin-submit", { opacity: 1, y: 0 });

    // Add CSS fallback classes
    const headerElement = document.querySelector(".checkin-header");
    const cardsElement = document.querySelector(".checkin-cards");
    const submitElement = document.querySelector(".checkin-submit");
    
    if (headerElement) {
      headerElement.classList.add('animate-fade-in-up');
    }
    if (cardsElement) {
      cardsElement.classList.add('animate-fade-in-up');
    }
    if (submitElement) {
      submitElement.classList.add('animate-fade-in-up');
    }

    // Magnetic effect for buttons
    const buttons = document.querySelectorAll('.magnetic-button');
    buttons.forEach(button => {
      button.addEventListener('mousemove', (e) => {
        const mouseEvent = e as MouseEvent;
        const rect = button.getBoundingClientRect();
        const x = mouseEvent.clientX - rect.left - rect.width / 2;
        const y = mouseEvent.clientY - rect.top - rect.height / 2;
        
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

  }, []);

  // Load today's check-in for the logged-in user
  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const session = await getSession();
        if (!session?.user) return;
        const existing = await getTodayCheckin(session.user.id);
        if (existing) {
          setCheckinData({
            mood: [Math.round((existing.mood ?? 6) / 2)], // Convert 2-10 back to 1-5
            energy: [Math.round((existing.energy ?? 6) / 2)], // Convert 2-10 back to 1-5
            gratitude: existing.gratitude ?? "",
            challenge: existing.challenge ?? "",
            tomorrow: existing.tomorrow ?? "",
            activities: existing.activities ?? [],
            waterIntake: [existing.water_intake ?? 4],
            sleepHours: [Number(existing.sleep_hours ?? 7)],
          });
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleActivityToggle = (activity: string) => {
    setCheckinData(prev => ({
      ...prev,
      activities: prev.activities.includes(activity)
        ? prev.activities.filter(a => a !== activity)
        : [...prev.activities, activity]
    }));
  };

  const getStreakMessage = () => {
    const activitiesCount = checkinData.activities.length;
    if (activitiesCount >= 8) return { message: "Amazing day! 🌟", color: "text-purple-600" };
    if (activitiesCount >= 6) return { message: "Great job! 🎉", color: "text-green-600" };
    if (activitiesCount >= 4) return { message: "Good progress! 👍", color: "text-blue-600" };
    if (activitiesCount >= 2) return { message: "Keep going! 💪", color: "text-orange-600" };
    return { message: "Every step counts! 🌱", color: "text-gray-600" };
  };

  const handleSubmit = async () => {
    console.log("Button clicked! Starting check-in submission...");
    
    try {
      setLoading(true);
      console.log("Starting check-in submission...");
      
      const session = await getSession();
      console.log("Session:", session);
      
      if (!session?.user) {
        console.log("No user session found");
        toast({ 
          title: "Please sign in", 
          description: "You need to be logged in to save your daily check-in." 
        });
        return;
      }

      console.log("User authenticated, saving check-in data...");
      
      const checkinPayload = {
        mood: checkinData.mood[0] * 2, // Convert 1-5 to 2-10 to match DB schema
        energy: checkinData.energy[0] * 2, // Convert 1-5 to 2-10 to match DB schema
        gratitude: checkinData.gratitude || null,
        challenge: checkinData.challenge || null,
        tomorrow: checkinData.tomorrow || null,
        activities: checkinData.activities || [],
        water_intake: checkinData.waterIntake[0] || 0,
        sleep_hours: checkinData.sleepHours[0] || 0,
      };

      console.log("Check-in payload:", checkinPayload);
      
      const result = await upsertTodayCheckin(session.user.id, checkinPayload);
      console.log("Check-in saved successfully!", result);

      const moodLevel = MOOD_LABELS[checkinData.mood[0] - 1];
      const energyLevel = ENERGY_LABELS[checkinData.energy[0] - 1];
      const streakMessage = getStreakMessage();
      
      // Show celebration animation
      setShowCelebration(true);
      setTimeout(() => setShowCelebration(false), 3000);
      
      // Create simple success message
      const personalizedMessage = createPersonalizedMessage(moodLevel, energyLevel, streakMessage, checkinData);
      
      toast({
        title: "Daily Check-in Complete!",
        description: personalizedMessage,
        duration: 5000,
      });

      // Reset the form after successful submission
      setCheckinData({
        mood: [3],
        energy: [3],
        gratitude: "",
        challenge: "",
        tomorrow: "",
        activities: [],
        waterIntake: [4],
        sleepHours: [7]
      });
      
    } catch (e: any) {
      console.error("Error saving check-in:", e);
      console.error("Error details:", {
        message: e?.message,
        details: e?.details,
        hint: e?.hint,
        code: e?.code
      });
      toast({ 
        title: "Save failed", 
        description: e?.message ?? e?.details ?? "Unknown error occurred. Please try again." 
      });
    } finally {
      setLoading(false);
    }
  };

  const createPersonalizedMessage = (moodLevel: any, energyLevel: any, streakMessage: any, data: any) => {
    const activitiesCount = data.activities.length;
    const waterGlasses = data.waterIntake[0];
    const sleepHours = data.sleepHours[0];
    
    let message = `Great job completing your daily check-in! `;
    
    // Mood-based message
    if (moodLevel.label === "Great") {
      message += `You're feeling amazing today! `;
    } else if (moodLevel.label === "Good") {
      message += `You're in a good mood! `;
    } else if (moodLevel.label === "Okay") {
      message += `You're doing okay today! `;
    } else {
      message += `Thanks for sharing how you're feeling. `;
    }
    
    // Activities message
    if (activitiesCount >= 8) {
      message += `You accomplished so much today! `;
    } else if (activitiesCount >= 6) {
      message += `You had a productive day! `;
    } else if (activitiesCount >= 4) {
      message += `You're making good progress! `;
    }
    
    message += `Your data is saved securely. Keep up the great work!`;
    
    return message;
  };

  const getMoodEmoji = (value: number) => {
    return MOOD_LABELS[value - 1].emoji;
  };

  const getEnergyEmoji = (value: number) => {
    return ENERGY_LABELS[value - 1].emoji;
  };

  const getWaterEmoji = (glasses: number) => {
    if (glasses >= 8) return "💧💧💧💧💧💧💧💧";
    if (glasses >= 6) return "💧💧💧💧💧💧";
    if (glasses >= 4) return "💧💧💧💧";
    if (glasses >= 2) return "💧💧";
    return "💧";
  };

  const getSleepEmoji = (hours: number) => {
    if (hours >= 8) return "😴😴😴😴";
    if (hours >= 6) return "😴😴😴";
    if (hours >= 4) return "😴😴";
    return "😴";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-amber-50 overflow-hidden">
        {/* Celebration Animation */}
        {showCelebration && (
        <motion.div 
          className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center"
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.5 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          <motion.div 
            className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-8 py-4 rounded-xl shadow-2xl font-body font-medium"
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
            🎉 Check-in Complete! 🎉
          </motion.div>
        </motion.div>
      )}

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
            className="text-center max-w-4xl mx-auto checkin-header"
            initial={{ opacity: 1, y: 0 }}
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
                <Calendar className="h-4 w-4" />
              </motion.div>
              Daily Wellness Check-in
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
              Daily Check-in
              </motion.span>
            </motion.h1>
            
            {/* Animated subtitle */}
            <motion.p 
              className="text-xl md:text-2xl text-gray-600 mb-12 font-body leading-relaxed max-w-3xl mx-auto"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              Take a moment to reflect on your day and track your wellness journey
            </motion.p>
          </motion.div>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-20 relative z-10">
        <div className="max-w-4xl mx-auto checkin-cards animate-fade-in-up">

        <div className="grid gap-6">
          {/* Mood & Energy */}
          <div className="grid md:grid-cols-2 gap-6">
              <StaggeredCard index={0}>
                <Card className="bg-white/80 backdrop-blur-sm shadow-xl border-0 overflow-hidden">
                  <CardHeader className="bg-gradient-to-r from-red-50 to-pink-50 border-b border-red-100">
                    <CardTitle className="flex items-center gap-3 font-heading text-xl">
                      <motion.div
                        className="w-10 h-10 bg-gradient-to-br from-red-500 to-pink-600 rounded-xl flex items-center justify-center"
                        whileHover={{ rotate: 360, scale: 1.1 }}
                        transition={{ duration: 0.6 }}
                      >
                        <Heart className="h-5 w-5 text-white" />
                      </motion.div>
                  How are you feeling today?
                </CardTitle>
              </CardHeader>
                  <CardContent className="p-6">
                    <div className="space-y-6">
                      <motion.div 
                        className="text-center"
                        animate={{ scale: [1, 1.05, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        <div className={`text-3xl font-bold font-heading ${MOOD_LABELS[checkinData.mood[0] - 1].color}`}>
                      {MOOD_LABELS[checkinData.mood[0] - 1].label}
                    </div>
                        <div className="text-4xl mt-2">
                          {MOOD_LABELS[checkinData.mood[0] - 1].emoji}
                  </div>
                      </motion.div>
                  <Slider
                    value={checkinData.mood}
                    onValueChange={(value) => setCheckinData(prev => ({ ...prev, mood: value }))}
                    max={5}
                    min={1}
                    step={1}
                    className="w-full"
                  />
                      <div className="flex justify-between text-sm text-gray-500 font-body">
                    <span>Very Low</span>
                    <span>Low</span>
                    <span>Okay</span>
                    <span>Good</span>
                    <span>Great</span>
                  </div>
                </div>
              </CardContent>
            </Card>
              </StaggeredCard>

              <StaggeredCard index={1}>
                <Card className="bg-white/80 backdrop-blur-sm shadow-xl border-0 overflow-hidden">
                  <CardHeader className="bg-gradient-to-r from-yellow-50 to-orange-50 border-b border-yellow-100">
                    <CardTitle className="flex items-center gap-3 font-heading text-xl">
                      <motion.div
                        className="w-10 h-10 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-xl flex items-center justify-center"
                        whileHover={{ rotate: 360, scale: 1.1 }}
                        transition={{ duration: 0.6 }}
                      >
                        <Zap className="h-5 w-5 text-white" />
                      </motion.div>
                  Energy Level
                </CardTitle>
              </CardHeader>
                  <CardContent className="p-6">
                    <div className="space-y-6">
                      <motion.div 
                        className="text-center"
                        animate={{ scale: [1, 1.05, 1] }}
                        transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                      >
                        <div className={`text-3xl font-bold font-heading ${ENERGY_LABELS[checkinData.energy[0] - 1].color}`}>
                      {ENERGY_LABELS[checkinData.energy[0] - 1].label}
                    </div>
                        <div className="text-4xl mt-2">
                          {ENERGY_LABELS[checkinData.energy[0] - 1].emoji}
                  </div>
                      </motion.div>
                  <Slider
                    value={checkinData.energy}
                    onValueChange={(value) => setCheckinData(prev => ({ ...prev, energy: value }))}
                    max={5}
                    min={1}
                    step={1}
                    className="w-full"
                  />
                      <div className="flex justify-between text-sm text-gray-500 font-body">
                    <span>Exhausted</span>
                    <span>Tired</span>
                    <span>Moderate</span>
                    <span>Energetic</span>
                    <span>Very Energetic</span>
                  </div>
                </div>
              </CardContent>
            </Card>
              </StaggeredCard>
          </div>

          {/* Wellness Tracking */}
          <div className="grid md:grid-cols-2 gap-6">
              <StaggeredCard index={2}>
                <Card className="bg-white/80 backdrop-blur-sm shadow-xl border-0 overflow-hidden">
                  <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100">
                    <CardTitle className="flex items-center gap-3 font-heading text-xl">
                      <motion.div
                        className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center"
                        whileHover={{ rotate: 360, scale: 1.1 }}
                        transition={{ duration: 0.6 }}
                      >
                        <Droplets className="h-5 w-5 text-white" />
                      </motion.div>
                  Water Intake
                </CardTitle>
                    <CardDescription className="font-body text-gray-600">How many glasses of water did you drink?</CardDescription>
              </CardHeader>
                  <CardContent className="p-6">
                    <div className="space-y-6 text-center">
                      <motion.div 
                        animate={{ scale: [1, 1.05, 1] }}
                        transition={{ duration: 2, repeat: Infinity, delay: 1 }}
                      >
                        <div className="text-4xl font-bold text-blue-600 font-heading">{checkinData.waterIntake[0]} glasses</div>
                        <div className="text-3xl mt-2">
                          {getWaterEmoji(checkinData.waterIntake[0])}
                        </div>
                      </motion.div>
                  <Slider
                    value={checkinData.waterIntake}
                    onValueChange={(value) => setCheckinData(prev => ({ ...prev, waterIntake: value }))}
                    max={12}
                    min={0}
                    step={1}
                    className="w-full"
                  />
                </div>
              </CardContent>
            </Card>
              </StaggeredCard>

              <StaggeredCard index={3}>
                <Card className="bg-white/80 backdrop-blur-sm shadow-xl border-0 overflow-hidden">
                  <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50 border-b border-indigo-100">
                    <CardTitle className="flex items-center gap-3 font-heading text-xl">
                      <motion.div
                        className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center"
                        whileHover={{ rotate: 360, scale: 1.1 }}
                        transition={{ duration: 0.6 }}
                      >
                        <Moon className="h-5 w-5 text-white" />
                      </motion.div>
                  Sleep Quality
                </CardTitle>
                    <CardDescription className="font-body text-gray-600">How many hours did you sleep last night?</CardDescription>
              </CardHeader>
                  <CardContent className="p-6">
                    <div className="space-y-6 text-center">
                      <motion.div 
                        animate={{ scale: [1, 1.05, 1] }}
                        transition={{ duration: 2, repeat: Infinity, delay: 1.5 }}
                      >
                        <div className="text-4xl font-bold text-indigo-600 font-heading">{checkinData.sleepHours[0]} hours</div>
                        <div className="text-3xl mt-2">
                          {getSleepEmoji(checkinData.sleepHours[0])}
                        </div>
                      </motion.div>
                  <Slider
                    value={checkinData.sleepHours}
                    onValueChange={(value) => setCheckinData(prev => ({ ...prev, sleepHours: value }))}
                    max={12}
                    min={3}
                    step={0.5}
                    className="w-full"
                  />
                </div>
              </CardContent>
            </Card>
              </StaggeredCard>
          </div>

          {/* Activities */}
            <StaggeredCard index={4}>
              <Card className="bg-white/80 backdrop-blur-sm shadow-xl border-0 overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 border-b border-purple-100">
                  <CardTitle className="flex items-center gap-3 font-heading text-xl">
                    <motion.div
                      className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center"
                      whileHover={{ rotate: 360, scale: 1.1 }}
                      transition={{ duration: 0.6 }}
                    >
                      <Trophy className="h-5 w-5 text-white" />
                    </motion.div>
                Today's Activities
              </CardTitle>
                  <CardDescription className="font-body text-gray-600">Select the activities you did today</CardDescription>
                  <div className="mt-4">
                    <div className="flex items-center gap-3">
                  <Progress 
                    value={(checkinData.activities.length / QUICK_ACTIVITIES.length) * 100} 
                        className="flex-1 h-3 bg-gray-200" 
                  />
                      <span className="text-sm font-medium text-gray-600 font-body">
                    {checkinData.activities.length}/{QUICK_ACTIVITIES.length}
                  </span>
                </div>
              </div>
            </CardHeader>
                <CardContent className="p-6">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {QUICK_ACTIVITIES.map((activity, index) => {
                  const IconComponent = activity.icon;
                  const isSelected = checkinData.activities.includes(activity.text);
                  return (
                        <motion.div
                          key={activity.text}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                        >
                          <div
                            className={`p-4 rounded-xl cursor-pointer transition-all duration-300 ${
                        isSelected 
                                ? 'bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200 shadow-lg' 
                                : 'bg-gray-50 hover:bg-gray-100 border-2 border-transparent hover:border-purple-100'
                      }`}
                      onClick={() => handleActivityToggle(activity.text)}
                    >
                      <div className="text-center">
                              <motion.div
                                animate={isSelected ? { scale: [1, 1.2, 1] } : {}}
                                transition={{ duration: 0.3 }}
                              >
                                <IconComponent className={`h-6 w-6 mx-auto mb-2 ${isSelected ? 'text-purple-600' : 'text-gray-400'}`} />
                              </motion.div>
                              <div className={`text-sm font-medium font-body ${isSelected ? 'text-purple-600' : 'text-gray-600'}`}>
                          {activity.text}
                        </div>
                        {isSelected && (
                                <motion.div
                                  initial={{ scale: 0 }}
                                  animate={{ scale: 1 }}
                                  transition={{ duration: 0.3 }}
                                >
                                  <CheckCircle className="h-4 w-4 mx-auto mt-2 text-purple-500" />
                                </motion.div>
                        )}
                      </div>
                    </div>
                        </motion.div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
            </StaggeredCard>

          {/* Reflections */}
          <div className="grid md:grid-cols-1 gap-6">
              <StaggeredCard index={5}>
                <Card className="bg-white/80 backdrop-blur-sm shadow-xl border-0 overflow-hidden">
                  <CardHeader className="bg-gradient-to-r from-yellow-50 to-orange-50 border-b border-yellow-100">
                    <CardTitle className="flex items-center gap-3 font-heading text-xl">
                      <motion.div
                        className="w-10 h-10 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-xl flex items-center justify-center"
                        whileHover={{ rotate: 360, scale: 1.1 }}
                        transition={{ duration: 0.6 }}
                      >
                        <Star className="h-5 w-5 text-white" />
                      </motion.div>
                  Gratitude & Reflection
                </CardTitle>
                    <CardDescription className="font-body text-gray-600">What are you grateful for today?</CardDescription>
              </CardHeader>
                  <CardContent className="p-6">
                <Textarea
                  value={checkinData.gratitude}
                  onChange={(e) => setCheckinData(prev => ({ ...prev, gratitude: e.target.value }))}
                  placeholder="I'm grateful for..."
                      className="min-h-[120px] border-gray-300 focus:border-yellow-500 focus:ring-yellow-500 font-body"
                />
              </CardContent>
            </Card>
              </StaggeredCard>

            <div className="grid md:grid-cols-2 gap-6">
                <StaggeredCard index={6}>
                  <Card className="bg-white/80 backdrop-blur-sm shadow-xl border-0 overflow-hidden">
                    <CardHeader className="bg-gradient-to-r from-orange-50 to-red-50 border-b border-orange-100">
                      <CardTitle className="flex items-center gap-3 font-heading text-xl">
                        <motion.div
                          className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center"
                          whileHover={{ rotate: 360, scale: 1.1 }}
                          transition={{ duration: 0.6 }}
                        >
                          <Target className="h-5 w-5 text-white" />
                        </motion.div>
                    Today's Challenge
                  </CardTitle>
                      <CardDescription className="font-body text-gray-600">What was difficult about today?</CardDescription>
                </CardHeader>
                    <CardContent className="p-6">
                  <Textarea
                    value={checkinData.challenge}
                    onChange={(e) => setCheckinData(prev => ({ ...prev, challenge: e.target.value }))}
                    placeholder="Today was challenging because..."
                        className="min-h-[100px] border-gray-300 focus:border-orange-500 focus:ring-orange-500 font-body"
                  />
                </CardContent>
              </Card>
                </StaggeredCard>

                <StaggeredCard index={7}>
                  <Card className="bg-white/80 backdrop-blur-sm shadow-xl border-0 overflow-hidden">
                    <CardHeader className="bg-gradient-to-r from-amber-50 to-yellow-50 border-b border-amber-100">
                      <CardTitle className="flex items-center gap-3 font-heading text-xl">
                        <motion.div
                          className="w-10 h-10 bg-gradient-to-br from-amber-500 to-yellow-600 rounded-xl flex items-center justify-center"
                          whileHover={{ rotate: 360, scale: 1.1 }}
                          transition={{ duration: 0.6 }}
                        >
                          <Sun className="h-5 w-5 text-white" />
                        </motion.div>
                    Tomorrow's Intention
                  </CardTitle>
                      <CardDescription className="font-body text-gray-600">What do you want to focus on tomorrow?</CardDescription>
                </CardHeader>
                    <CardContent className="p-6">
                  <Textarea
                    value={checkinData.tomorrow}
                    onChange={(e) => setCheckinData(prev => ({ ...prev, tomorrow: e.target.value }))}
                    placeholder="Tomorrow I will..."
                        className="min-h-[100px] border-gray-300 focus:border-amber-500 focus:ring-amber-500 font-body"
                  />
                </CardContent>
              </Card>
                </StaggeredCard>
              </div>
          </div>

          {/* Submit */}
            <motion.div 
              className="text-center checkin-submit"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.8 }}
            >
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
            <Button 
              onClick={(e) => {
                console.log("Button clicked!", e);
                handleSubmit();
              }}
                  className="magnetic-button bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white px-12 py-4 text-xl font-medium font-body shadow-xl hover:shadow-2xl transition-all duration-300"
              size="lg"
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Saving...
                </div>
              ) : (
                "Complete Check-in"
              )}
            </Button>
              </motion.div>
              <motion.p 
                className="text-sm text-gray-600 mt-4 font-body"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
              >
              Your data is saved securely and privately
              </motion.p>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DailyCheckin;
