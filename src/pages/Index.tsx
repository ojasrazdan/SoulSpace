import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Brain,
  FileText,
  Calendar,
  Gamepad2,
  AlertTriangle,
  Target,
  Lock,
  Award,
  Users,
  Briefcase,
  Accessibility,
  Heart,
  Shield,
  Sparkles,
  ArrowRight,
  CheckCircle,
  Star,
  TrendingUp,
  Clock,
  UserCheck,
  MessageCircle,
  Zap,
  Globe,
  Layers,
  UserPlus,
  Bot,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import { getSession, onAuthStateChange } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { gsap } from "gsap";
import { motion, useScroll, useTransform, useSpring, useInView } from "framer-motion";
import { useInView as useInViewSpring, animated, useSprings } from "@react-spring/web";
// Removed unused import

// Animated Particle Component
const FloatingParticles = () => {
  const particles = Array.from({ length: 50 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 4 + 1,
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
        scale: 1.05,
        transition: { duration: 0.3 }
      }}
      className="w-full"
    >
      {children}
    </motion.div>
  );
};


const usps = [
  {
    icon: Accessibility,
    title: "Accessibility Features",
    description: "Comprehensive accessibility tools including screen reader support, high contrast modes, and customizable interfaces for inclusive learning",
    color: "text-blue-600",
    bgColor: "bg-blue-100",
    gradient: "from-blue-500 to-indigo-600",
    highlight: "Inclusive Design",
  },
  {
    icon: UserPlus,
    title: "Student Companion",
    description: "Connect with peer mentors and find your perfect study buddy through our intelligent matching system",
    color: "text-green-600",
    bgColor: "bg-green-100",
    gradient: "from-green-500 to-emerald-600",
    highlight: "Peer Support",
  },
  {
    icon: Bot,
    title: "AI Chatbot",
    description: "24/7 AI-powered mental health support with personalized guidance and instant responses to student needs",
    color: "text-purple-600",
    bgColor: "bg-purple-100",
    gradient: "from-purple-500 to-violet-600",
    highlight: "AI-Powered",
  },
];

const testimonials = [
  {
    name: "Sarah M.",
    role: "University Student",
    content: "SoulSpace helped me manage my anxiety during finals. The daily check-ins and community support made all the difference.",
    rating: 5,
  },
  {
    name: "Alex K.",
    role: "Graduate Student",
    content: "The assessment tools gave me insights I never had before. I finally understand my mental health patterns.",
    rating: 5,
  },
  {
    name: "Jordan L.",
    role: "PhD Candidate",
    content: "The mindfulness games are perfect for study breaks. I feel more focused and less stressed.",
    rating: 5,
  },
];

const features = [
  {
    to: "/goals",
    icon: Target,
    title: "Goals",
    description: "Set and track your personal goals.",
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
  },
  {
    to: "/vault",
    icon: Lock,
    title: "Vault",
    description: "A safe space for your thoughts and feelings.",
    color: "text-purple-500",
    bgColor: "bg-purple-500/10",
  },
  {
    to: "/games",
    icon: Gamepad2,
    title: "Games",
    description: "Mindful games to relax and focus.",
    color: "text-green-500",
    bgColor: "bg-green-500/10",
  },
  {
    to: "/community",
    icon: Users,
    title: "Community",
    description: "Connect with others in a safe space.",
    color: "text-orange-500",
    bgColor: "bg-orange-500/10",
  },
  {
    to: "/student-companion",
    icon: UserPlus,
    title: "Student Companion",
    description: "Find your perfect buddy for support.",
    color: "text-amber-500",
    bgColor: "bg-amber-500/10",
  },
  {
    to: "/assessment",
    icon: Brain,
    title: "Assessment",
    description: "Understand your mental well-being.",
    color: "text-pink-500",
    bgColor: "bg-pink-500/10",
  },
  {
    to: "/rewards",
    icon: Award,
    title: "Rewards",
    description: "Earn points and unlock achievements.",
    color: "text-yellow-500",
    bgColor: "bg-yellow-500/10",
  },
  {
    to: "/consultation",
    icon: Briefcase,
    title: "Consultation",
    description: "Book a session with a professional.",
    color: "text-indigo-500",
    bgColor: "bg-indigo-500/10",
  },
  {
    to: "/resources",
    icon: FileText,
    title: "Resources",
    description: "Articles, videos, and more.",
    color: "text-red-500",
    bgColor: "bg-red-500/10",
  },
  {
    to: "/daily-checkin",
    icon: Calendar,
    title: "Daily Check-in",
    description: "Log your mood and track your progress.",
    color: "text-teal-500",
    bgColor: "bg-teal-500/10",
  },
  {
    to: "/sos",
    icon: AlertTriangle,
    title: "SOS",
    description: "Immediate help in an emergency.",
    color: "text-gray-500",
    bgColor: "bg-gray-500/10",
  },
];

const Home = () => {
  const { toast } = useToast();
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const session = await getSession();
      const uid = session?.user?.id ?? null;
      setUserId(uid);
    })();
    const sub = onAuthStateChange(async (_e, session) => {
      const uid = session?.user?.id ?? null;
      setUserId(uid);
    })
    return () => { sub.data.subscription.unsubscribe() }
  }, []);

  // Advanced GSAP animations with ScrollTrigger
  useEffect(() => {
    const tl = gsap.timeline();
    
    // Hero text animation with split text effect
    tl.from(".hero-text", {
      y: 100,
      opacity: 0,
      duration: 1.2,
      ease: "power3.out",
      stagger: 0.1
    })
    .from(".hero-subtitle", {
      y: 50,
      opacity: 0,
      duration: 0.8,
      ease: "power2.out"
    }, "-=0.5")
    .from(".hero-buttons", {
      y: 30,
      opacity: 0,
      duration: 0.6,
      ease: "power2.out"
    }, "-=0.3");

    // Continuous floating animation for hero features
    gsap.to(".floating-card", {
      y: -10,
      duration: 2,
      ease: "power1.inOut",
      stagger: 0.2,
      repeat: -1,
      yoyo: true
    });

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

  // Scroll to features section
  const scrollToFeatures = () => {
    const featuresSection = document.getElementById('everything-you-need');
    if (featuresSection) {
      featuresSection.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-amber-50 overflow-hidden">
      {/* Hero Section */}
      <motion.div 
        className="relative overflow-hidden bg-gradient-to-br from-slate-50 via-white to-amber-50 min-h-screen flex items-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      >
        {/* Animated Background */}
        <MorphingBackground />
        <FloatingParticles />
        
        <div className="container mx-auto px-4 py-12 relative z-10">
          <motion.div 
            className="text-center max-w-4xl mx-auto"
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
                <Star className="h-4 w-4" />
              </motion.div>
              Your Mental Health Companion
            </motion.div>
            
            {/* Animated title with text reveal */}
            <motion.h1 
              className="text-6xl md:text-7xl lg:text-8xl font-bold mb-8 font-heading bg-gradient-to-r from-gray-900 via-amber-600 to-rose-600 bg-clip-text text-transparent"
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
            >
              <motion.span
                className="inline-block"
                whileHover={{ scale: 1.1, rotate: 2 }}
                transition={{ type: "spring", stiffness: 1000, damping: 30, duration: 0.1 }}
              >
                Soul
              </motion.span>
              <motion.span
                className="inline-block ml-2"
                whileHover={{ scale: 1.1, rotate: -2 }}
                transition={{ type: "spring", stiffness: 1000, damping: 30, duration: 0.1 }}
              >
                Space
              </motion.span>
            </motion.h1>
            
            {/* Animated subtitle */}
            <motion.p 
              className="text-xl md:text-2xl text-gray-600 mb-12 font-body leading-relaxed max-w-3xl mx-auto"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.05 }}
            >
              A comprehensive platform designed to support your mental well-being journey with 
              personalized tools, professional resources, and a caring community.
            </motion.p>
            
            {/* Animated buttons with magnetic effect */}
            <motion.div 
              className="flex flex-col sm:flex-row gap-6 justify-center mb-12"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
            >
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link to="/assessment">
                  <Button 
                    size="lg" 
                    className="magnetic-button bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white px-10 py-4 text-lg font-body shadow-2xl hover:shadow-3xl transition-all duration-300 relative overflow-hidden group"
                  >
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent"
                      initial={{ x: "-100%" }}
                      whileHover={{ x: "100%" }}
                      transition={{ duration: 0.6 }}
                    />
                    <span className="relative z-10 flex items-center">
                      Start Your Journey
                      <motion.div
                        animate={{ x: [0, 5, 0] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      >
                        <ArrowRight className="ml-2 h-5 w-5" />
                      </motion.div>
                    </span>
                  </Button>
          </Link>
              </motion.div>
              
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link to="/community">
                <Button
                  variant="outline"
                    size="lg" 
                    className="magnetic-button border-2 border-amber-300 text-amber-700 hover:bg-amber-50 px-10 py-4 text-lg font-body shadow-xl hover:shadow-2xl transition-all duration-300 relative overflow-hidden group"
                  >
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-amber-100/50 to-transparent"
                      initial={{ x: "-100%" }}
                      whileHover={{ x: "100%" }}
                      transition={{ duration: 0.6 }}
                    />
                    <span className="relative z-10">Join Community</span>
                  </Button>
                </Link>
              </motion.div>
              
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button 
                  onClick={scrollToFeatures}
                  variant="outline" 
                  size="lg" 
                  className="magnetic-button border-2 border-purple-300 text-purple-700 hover:bg-purple-50 px-10 py-4 text-lg font-body shadow-xl hover:shadow-2xl transition-all duration-300 relative overflow-hidden group"
                >
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-purple-100/50 to-transparent"
                    initial={{ x: "-100%" }}
                    whileHover={{ x: "100%" }}
                    transition={{ duration: 0.6 }}
                  />
                  <span className="relative z-10 flex items-center">
                    View Features
                    <motion.div
                      animate={{ y: [0, -3, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      <ArrowRight className="ml-2 h-5 w-5 rotate-90" />
                    </motion.div>
                  </span>
                </Button>
              </motion.div>
            </motion.div>
            
            {/* Animated quick stats */}
            <motion.div 
              className="flex flex-wrap justify-center gap-8 text-center"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.7 }}
            >
              {[
                { icon: CheckCircle, text: "Free to Use", color: "text-green-500" },
                { icon: Shield, text: "Privacy Protected", color: "text-blue-500" },
                { icon: Users, text: "Community Support", color: "text-purple-500" }
              ].map((stat, index) => (
                <motion.div 
                  key={index}
                  className="flex items-center gap-2 text-gray-600 font-body"
                  whileHover={{ scale: 1.1, y: -2 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <motion.div
                    animate={{ 
                      scale: [1, 1.2, 1],
                      rotate: [0, 10, -10, 0]
                    }}
                    transition={{ 
                      duration: 2, 
                      repeat: Infinity, 
                      delay: index * 0.5 
                    }}
                  >
                    <stat.icon className={`h-5 w-5 ${stat.color}`} />
                  </motion.div>
                  <span className="font-medium">{stat.text}</span>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
              </div>
      </motion.div>


      {/* Key Features Section */}
      <motion.section 
        id="key-features"
        className="py-20 bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 relative overflow-hidden"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
      >
        {/* Animated background elements */}
        <motion.div
          className="absolute inset-0"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 1 }}
        >
          <motion.div
            className="absolute top-10 left-10 w-32 h-32 bg-blue-200/30 rounded-full blur-xl"
            animate={{
              scale: [1, 1.2, 1],
              rotate: [0, 180, 360],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "linear"
            }}
          />
          <motion.div
            className="absolute bottom-10 right-10 w-40 h-40 bg-purple-200/30 rounded-full blur-xl"
            animate={{
              scale: [1.2, 1, 1.2],
              rotate: [360, 180, 0],
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: "linear"
            }}
          />
        </motion.div>
        
        <div className="container mx-auto px-4 relative z-10">
          <AnimatedText className="text-center mb-16">
            <motion.div
              className="inline-block"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.3 }}
            >
              <h2 className="text-4xl md:text-5xl font-bold mb-4 font-heading bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                Our Key Features
              </h2>
            </motion.div>
            <motion.p 
              className="text-xl text-gray-600 font-body max-w-2xl mx-auto"
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.3 }}
            >
              Discover what makes SoulSpace the ultimate platform for student mental health and wellness
            </motion.p>
          </AnimatedText>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {usps.map((usp, index) => (
              <motion.div
                key={index}
                className="group relative p-8 bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 border-2 border-gray-100 hover:border-purple-200 overflow-hidden"
                initial={{ opacity: 0, y: 50, scale: 0.9 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ 
                  duration: 0.6, 
                  delay: index * 0.2,
                  ease: "easeOut"
                }}
                whileHover={{ 
                  y: -15, 
                  scale: 1.05,
                  rotateY: 5,
                  transition: { duration: 0.4 }
                }}
              >
                {/* Gradient Background on Hover */}
                <div className={`absolute inset-0 bg-gradient-to-br ${usp.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-500`} />
                
                {/* Enhanced Highlight Badge */}
                <motion.div 
                  className={`absolute top-4 right-4 px-4 py-2 rounded-full text-sm font-bold ${usp.bgColor} ${usp.color} font-body shadow-lg border-2 border-white`}
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ duration: 0.2 }}
                >
                  {usp.highlight}
                </motion.div>
                
                {/* Enhanced Icon */}
                <motion.div 
                  className={`w-20 h-20 rounded-2xl ${usp.bgColor} flex items-center justify-center mx-auto mb-6 shadow-lg border-2 border-white group-hover:shadow-xl transition-all duration-300`}
                  whileHover={{ 
                    scale: 1.15, 
                    rotate: 10,
                    transition: { duration: 0.3 }
                  }}
                >
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    transition={{ duration: 0.2 }}
                  >
                    <usp.icon className={`h-10 w-10 ${usp.color}`} />
                  </motion.div>
                </motion.div>
                
                {/* Enhanced Title */}
                <motion.h3 
                  className={`text-2xl font-bold mb-4 font-heading ${usp.color} text-center group-hover:scale-105 transition-transform duration-300`}
                  whileHover={{ 
                    scale: 1.05,
                    textShadow: "0 0 20px rgba(0,0,0,0.3)"
                  }}
                  transition={{ duration: 0.2 }}
                >
                  {usp.title}
                </motion.h3>
                
                {/* Description */}
                <p className="text-gray-600 font-body text-center leading-relaxed group-hover:text-gray-700 transition-colors duration-300">
                  {usp.description}
                </p>
                
                {/* Enhanced Decorative Elements */}
                <motion.div 
                  className="absolute bottom-0 left-0 right-0 h-2 bg-gradient-to-r from-transparent via-purple-300 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  whileHover={{ scaleX: 1.1 }}
                  transition={{ duration: 0.3 }}
                />
                
                {/* Glow Effect */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-purple-100/20 via-transparent to-blue-100/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                
                {/* Corner Accents */}
                <div className="absolute top-2 left-2 w-3 h-3 bg-gradient-to-br from-purple-400 to-blue-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="absolute top-2 right-2 w-3 h-3 bg-gradient-to-br from-blue-400 to-purple-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="absolute bottom-2 left-2 w-3 h-3 bg-gradient-to-br from-indigo-400 to-purple-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="absolute bottom-2 right-2 w-3 h-3 bg-gradient-to-br from-purple-400 to-indigo-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Why Choose SoulSpace Section */}
      <motion.section 
        className="py-20 bg-gradient-to-r from-slate-50 via-gray-50 to-amber-50 relative overflow-hidden"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
      >
        <div className="container mx-auto px-4">
          <AnimatedText className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 font-heading text-gray-900">
              Why Choose SoulSpace?
            </h2>
            <p className="text-xl text-gray-600 font-body max-w-2xl mx-auto">
              Experience the future of mental health support with cutting-edge technology and compassionate care
            </p>
          </AnimatedText>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {[
              {
                icon: Heart,
                title: "Mental Health Support",
                description: "Comprehensive tools for your mental well-being journey",
                color: "text-rose-500",
                bgColor: "bg-rose-500/10",
                gradient: "from-rose-500/20 to-pink-500/20",
              },
              {
                icon: Shield,
                title: "Safe & Secure",
                description: "Your privacy and data security are our top priority",
                color: "text-blue-500",
                bgColor: "bg-blue-500/10",
                gradient: "from-blue-500/20 to-cyan-500/20",
              },
              {
                icon: Sparkles,
                title: "Personalized Experience",
                description: "Tailored to your unique needs and preferences",
                color: "text-purple-500",
                bgColor: "bg-purple-500/10",
                gradient: "from-purple-500/20 to-violet-500/20",
              },
            ].map((feature, index) => (
              <StaggeredCard key={index} index={index}>
                <Card className="text-center p-8 border-0 shadow-lg bg-white/80 backdrop-blur-sm hover:shadow-xl transition-all duration-300">
                  <div className={`w-16 h-16 rounded-full ${feature.bgColor} flex items-center justify-center mx-auto mb-4`}>
                    <feature.icon className={`h-8 w-8 ${feature.color}`} />
                  </div>
                  <h3 className="text-xl font-semibold mb-3 font-heading">{feature.title}</h3>
                  <p className="text-gray-600 font-body">{feature.description}</p>
                </Card>
              </StaggeredCard>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Testimonials Section */}
      <motion.section 
        className="py-20 bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50 relative overflow-hidden"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
      >
        {/* Floating testimonial cards background */}
        <motion.div
          className="absolute inset-0"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 1 }}
        >
          <motion.div
            className="absolute top-20 left-20 w-24 h-24 bg-amber-200/20 rounded-full blur-2xl"
            animate={{
              y: [0, -20, 0],
              x: [0, 10, 0],
            }}
            transition={{
              duration: 6,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          <motion.div
            className="absolute bottom-20 right-20 w-32 h-32 bg-orange-200/20 rounded-full blur-2xl"
            animate={{
              y: [0, 20, 0],
              x: [0, -10, 0],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        </motion.div>
        
        <div className="container mx-auto px-4 relative z-10">
          <AnimatedText className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 font-heading text-gray-900">
              What Our Users Say
            </h2>
            <p className="text-xl text-gray-600 font-body max-w-2xl mx-auto">
              Real stories from students who have transformed their mental health journey
            </p>
          </AnimatedText>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                className="p-6 bg-white/90 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl"
                initial={{ opacity: 0, y: 60 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ 
                  duration: 0.8, 
                  delay: index * 0.2,
                  ease: "easeOut"
                }}
                whileHover={{ 
                  y: -5, 
                  scale: 1.02,
                  transition: { duration: 0.3 }
                }}
              >
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-amber-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-700 font-body mb-4 italic">
                  "{testimonial.content}"
                </p>
                <div className="border-t pt-4">
                  <div className="font-semibold text-gray-900 font-heading">{testimonial.name}</div>
                  <div className="text-sm text-gray-500 font-body">{testimonial.role}</div>
                </div>
              </motion.div>
            ))}
          </div>
              </div>
      </motion.section>

      {/* Features Grid */}
      <motion.section 
        id="everything-you-need"
        className="py-20 bg-gradient-to-r from-gray-50 via-amber-50 to-orange-50 relative overflow-hidden"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
      >
        {/* Animated grid background */}
        <motion.div
          className="absolute inset-0 opacity-30"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 0.3 }}
          transition={{ duration: 1 }}
        >
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, rgba(0,0,0,0.1) 1px, transparent 0)`,
            backgroundSize: '50px 50px'
          }} />
        </motion.div>
        
        <div className="container mx-auto px-4 relative z-10">
          <AnimatedText className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 font-heading text-gray-900">
              Everything You Need
            </h2>
            <p className="text-xl text-gray-600 font-body max-w-2xl mx-auto">
              Comprehensive tools and resources to support every aspect of your mental health journey
            </p>
          </AnimatedText>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 max-w-7xl mx-auto">
            {features.map((feature, index) => (
              <StaggeredCard key={feature.to} index={index}>
                <Link to={feature.to} className="flex h-full">
                  <Card className="feature-card w-full flex flex-col group bg-white/90 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 h-full">
                    <CardHeader className="flex-grow p-6">
                      <div className={`w-12 h-12 rounded-xl ${feature.bgColor} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    <feature.icon className={`h-6 w-6 ${feature.color}`} />
                  </div>
                      <CardTitle className="font-heading text-lg mb-2">{feature.title}</CardTitle>
                      <CardDescription className="font-body text-gray-600">{feature.description}</CardDescription>
                </CardHeader>
                    <CardContent className="p-6 pt-0">
                      <div className="text-amber-600 group-hover:text-amber-700 font-medium font-body flex items-center">
                        Explore
                        <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform duration-300" />
                  </div>
                </CardContent>
              </Card>
            </Link>
              </StaggeredCard>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Call to Action */}
      <motion.section 
        className="py-20 bg-gradient-to-r from-amber-500 via-orange-600 to-rose-600 relative overflow-hidden"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
      >
        {/* Animated background particles */}
        <motion.div
          className="absolute inset-0"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 1 }}
        >
          {Array.from({ length: 20 }, (_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-white/20 rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [0, -30, 0],
                opacity: [0.2, 0.8, 0.2],
                scale: [1, 1.5, 1],
              }}
              transition={{
                duration: 3 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 2,
                ease: "easeInOut"
              }}
            />
          ))}
        </motion.div>
        
        <div className="container mx-auto px-4 text-center relative z-10">
          <motion.h2 
            className="text-5xl md:text-6xl font-bold text-white mb-8 font-heading"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            Ready to Begin?
          </motion.h2>
          
          <motion.p 
            className="text-xl text-amber-100 mb-12 font-body max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Join thousands of users who have found support, growth, and community through SoulSpace
          </motion.p>
          
          <motion.div 
            className="flex flex-col sm:flex-row gap-6 justify-center"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link to="/auth">
                <Button 
                  size="lg" 
                  className="bg-white text-amber-600 hover:bg-amber-50 px-10 py-4 text-lg font-body shadow-2xl hover:shadow-3xl transition-all duration-300 relative overflow-hidden group"
                >
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-amber-100/50 to-transparent"
                    initial={{ x: "-100%" }}
                    whileHover={{ x: "100%" }}
                    transition={{ duration: 0.6 }}
                  />
                  <span className="relative z-10">Get Started Today</span>
                </Button>
              </Link>
            </motion.div>
            
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link to="/settings">
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="border-2 border-white text-white hover:bg-white/10 px-10 py-4 text-lg font-body shadow-xl hover:shadow-2xl transition-all duration-300 relative overflow-hidden group"
                >
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent"
                    initial={{ x: "-100%" }}
                    whileHover={{ x: "100%" }}
                    transition={{ duration: 0.6 }}
                  />
                  <span className="relative z-10 flex items-center">
                    <Accessibility className="mr-2 h-5 w-5" />
                    Accessibility Settings
                  </span>
                </Button>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </motion.section>
    </div>
  );
};

export default Home;