import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { 
  Video, 
  Phone, 
  User, 
  MessageCircle, 
  Clock, 
  Star, 
  Heart, 
  Shield, 
  Zap, 
  Calendar,
  MapPin,
  Users,
  TrendingUp,
  Sparkles,
  Crown,
  Gift,
  CheckCircle,
  AlertCircle,
  Play,
  Mic,
  Camera,
  Headphones,
  Coffee,
  BookOpen,
  Brain,
  Target,
  ExternalLink
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAccessibility } from "@/hooks/AccessibilityContext";
import { useNavigate } from "react-router-dom";
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

const Consultation = () => {
  const { toast } = useToast();
  const { highContrast, adhdMode } = useAccessibility();
  const navigate = useNavigate();
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [selectedSpecialist, setSelectedSpecialist] = useState<string | null>(null);
  const [isBooking, setIsBooking] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [onlineSpecialists, setOnlineSpecialists] = useState(12);
  const [avgWaitTime, setAvgWaitTime] = useState(3);

  // Update time every second for real-time feel
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
      // Simulate dynamic online specialists count
      setOnlineSpecialists(Math.floor(Math.random() * 5) + 10);
      setAvgWaitTime(Math.floor(Math.random() * 3) + 2);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Advanced GSAP animations
  useEffect(() => {
    // Ensure elements are visible by default
    gsap.set(".consultation-header", { opacity: 1, y: 0 });
    gsap.set(".consultation-stats", { opacity: 1, y: 0 });
    gsap.set(".consultation-content", { opacity: 1, y: 0 });

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

  }, []);

  const specialists = [
    {
      id: "dr-sarah",
      name: "Dr. Sarah Chen",
      specialty: "Anxiety & Stress",
      rating: 4.9,
      experience: "8 years",
      availability: "Available Now",
      avatar: "👩‍⚕️",
      price: "$120/hour",
      nextAvailable: "2:30 PM",
      languages: ["English", "Mandarin"],
      focus: ["Cognitive Behavioral Therapy", "Mindfulness", "Stress Management"]
    },
    {
      id: "dr-michael",
      name: "Dr. Michael Rodriguez",
      specialty: "Depression & Mood",
      rating: 4.8,
      experience: "12 years",
      availability: "Available Now",
      avatar: "👨‍⚕️",
      price: "$140/hour",
      nextAvailable: "3:00 PM",
      languages: ["English", "Spanish"],
      focus: ["Psychotherapy", "Medication Management", "Life Transitions"]
    },
    {
      id: "dr-emma",
      name: "Dr. Emma Thompson",
      specialty: "Trauma & PTSD",
      rating: 4.9,
      experience: "6 years",
      availability: "Available Now",
      avatar: "👩‍⚕️",
      price: "$130/hour",
      nextAvailable: "4:15 PM",
      languages: ["English"],
      focus: ["EMDR", "Trauma Therapy", "Crisis Intervention"]
    },
    {
      id: "dr-james",
      name: "Dr. James Wilson",
      specialty: "Relationships & Family",
      rating: 4.7,
      experience: "10 years",
      availability: "Available Now",
      avatar: "👨‍⚕️",
      price: "$110/hour",
      nextAvailable: "5:30 PM",
      languages: ["English", "French"],
      focus: ["Couples Therapy", "Family Counseling", "Communication Skills"]
    }
  ];

  const consultationTypes = [
    {
      id: "video",
      title: "Video Consultation",
      icon: Video,
      description: "Face-to-face video call with your specialist",
      duration: "50-60 minutes",
      price: "From $110",
      features: ["HD Video", "Screen Sharing", "Recording Available", "Chat Support"],
      color: "from-blue-500 to-blue-600",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200",
      popular: true
    },
    {
      id: "phone",
      title: "Phone Consultation",
      icon: Phone,
      description: "Private phone call with your specialist",
      duration: "45-50 minutes",
      price: "From $90",
      features: ["Crystal Clear Audio", "Call Recording", "Follow-up Notes", "Flexible Timing"],
      color: "from-green-500 to-green-600",
      bgColor: "bg-green-50",
      borderColor: "border-green-200"
    },
    {
      id: "in-person",
      title: "In-Person Session",
      icon: User,
      description: "Traditional face-to-face consultation",
      duration: "60 minutes",
      price: "From $150",
      features: ["Private Office", "Comfortable Setting", "In-Person Connection", "Full Assessment"],
      color: "from-purple-500 to-purple-600",
      bgColor: "bg-purple-50",
      borderColor: "border-purple-200"
    },
    {
      id: "chat",
      title: "Text Consultation",
      icon: MessageCircle,
      description: "Secure messaging with your specialist",
      duration: "Ongoing",
      price: "From $50",
      features: ["24/7 Access", "Quick Responses", "Message History", "Flexible Communication"],
      color: "from-orange-500 to-orange-600",
      bgColor: "bg-orange-50",
      borderColor: "border-orange-200"
    }
  ];

  const handleBookConsultation = (type: string) => {
    setIsBooking(true);
    
    // Simulate booking process
    setTimeout(() => {
    toast({
      title: "Consultation Booked! 🎉",
        description: `Your ${type} consultation has been scheduled successfully.`,
      duration: 5000,
    });
    setIsBooking(false);
    }, 2000);
  };

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
            className="text-center max-w-4xl mx-auto consultation-header"
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
                <Heart className="h-4 w-4" />
              </motion.div>
              Professional Mental Health Support
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
                Consultation
              </motion.span>
            </motion.h1>
            
            {/* Animated subtitle */}
            <motion.p 
              className="text-xl md:text-2xl text-gray-600 mb-12 font-body leading-relaxed max-w-3xl mx-auto"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
            Connect with licensed professionals for personalized mental health support
            </motion.p>
          
          {/* Real-time Stats */}
            <motion.div 
              className="grid grid-cols-3 gap-4 max-w-md mx-auto mb-8 consultation-stats animate-fade-in-up"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
            >
              <motion.div 
                className="bg-white/80 backdrop-blur-sm rounded-xl p-4 shadow-lg hover:shadow-xl transition-all duration-300"
                whileHover={{ y: -5, scale: 1.05 }}
                transition={{ duration: 0.3 }}
              >
              <div className="flex items-center gap-2">
                  <motion.div
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <Users className="h-5 w-5 text-green-500" />
                  </motion.div>
                  <span className="text-sm font-medium font-body text-gray-700">{onlineSpecialists} Online</span>
              </div>
              </motion.div>
              <motion.div 
                className="bg-white/80 backdrop-blur-sm rounded-xl p-4 shadow-lg hover:shadow-xl transition-all duration-300"
                whileHover={{ y: -5, scale: 1.05 }}
                transition={{ duration: 0.3 }}
              >
              <div className="flex items-center gap-2">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  >
                    <Clock className="h-5 w-5 text-blue-500" />
                  </motion.div>
                  <span className="text-sm font-medium font-body text-gray-700">{avgWaitTime}min Wait</span>
              </div>
              </motion.div>
              <motion.div 
                className="bg-white/80 backdrop-blur-sm rounded-xl p-4 shadow-lg hover:shadow-xl transition-all duration-300"
                whileHover={{ y: -5, scale: 1.05 }}
                transition={{ duration: 0.3 }}
              >
              <div className="flex items-center gap-2">
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    <TrendingUp className="h-5 w-5 text-purple-500" />
                  </motion.div>
                  <span className="text-sm font-medium font-body text-gray-700">4.8★ Rating</span>
              </div>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-20 relative z-10">
        <div className="max-w-6xl mx-auto consultation-content">

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
        <Tabs defaultValue="book" className="space-y-6">
              <TabsList className="grid w-full grid-cols-4 bg-white/80 backdrop-blur-sm shadow-lg border-0 rounded-xl p-1">
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <TabsTrigger value="book" className="flex items-center gap-2 font-body data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-500 data-[state=active]:to-orange-600 data-[state=active]:text-white rounded-lg">
              <Calendar className="h-4 w-4" />
              Book Session
            </TabsTrigger>
                </motion.div>
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <TabsTrigger value="specialists" className="flex items-center gap-2 font-body data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-indigo-600 data-[state=active]:text-white rounded-lg">
              <Users className="h-4 w-4" />
              Our Specialists
            </TabsTrigger>
                </motion.div>
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <TabsTrigger value="instant" className="flex items-center gap-2 font-body data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-emerald-600 data-[state=active]:text-white rounded-lg">
              <Zap className="h-4 w-4" />
              Instant Support
            </TabsTrigger>
                </motion.div>
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <TabsTrigger value="resources" className="flex items-center gap-2 font-body data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-violet-600 data-[state=active]:text-white rounded-lg">
              <BookOpen className="h-4 w-4" />
              Resources
            </TabsTrigger>
                </motion.div>
          </TabsList>

          <TabsContent value="book" className="space-y-6">
            {/* Consultation Types */}
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                >
                  <Card className="bg-white/80 backdrop-blur-sm shadow-xl border-0 overflow-hidden">
                    <CardHeader className="bg-gradient-to-r from-amber-50 to-orange-50 border-b border-amber-100">
                      <CardTitle className="flex items-center gap-3 font-heading text-2xl">
                        <motion.div
                          className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center"
                          whileHover={{ rotate: 360, scale: 1.1 }}
                          transition={{ duration: 0.6 }}
                        >
                          <Target className="h-5 w-5 text-white" />
                        </motion.div>
                  Choose Your Consultation Type
                </CardTitle>
                      <CardDescription className="font-body text-gray-600">
                  Select the format that works best for you
                </CardDescription>
              </CardHeader>
                    <CardContent className="p-6">
                      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {consultationTypes.map((type, index) => {
                    const IconComponent = type.icon;
                    return (
                            <StaggeredCard key={type.id} index={index}>
                              <motion.div
                                className={`cursor-pointer rounded-xl p-6 bg-white/50 backdrop-blur-sm border transition-all duration-300 group ${
                          selectedType === type.id 
                                    ? `${type.bgColor} ${type.borderColor} border-2 shadow-lg` 
                                    : 'border-gray-200 hover:shadow-lg hover:border-amber-300'
                        }`}
                        onClick={() => setSelectedType(type.id)}
                                whileHover={{ y: -5, scale: 1.02 }}
                                transition={{ duration: 0.3 }}
                              >
                                <div className="text-center">
                                  <div className="relative mb-4">
                                    <motion.div
                                      whileHover={{ scale: 1.1, rotate: 5 }}
                                      transition={{ duration: 0.3 }}
                                    >
                                      <IconComponent className="mx-auto h-12 w-12 text-amber-600 mb-2" />
                                    </motion.div>
                            {type.popular && (
                                      <motion.div
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        transition={{ duration: 0.5, delay: 0.2 }}
                                      >
                                        <Badge className="absolute -top-2 -right-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white font-body">
                                Popular
                              </Badge>
                                      </motion.div>
                            )}
                          </div>
                                  <CardTitle className="text-lg font-heading text-gray-900 mb-2">{type.title}</CardTitle>
                                  <CardDescription className="text-sm font-body text-gray-600 mb-4">
                            {type.description}
                          </CardDescription>
                                  
                                  <div className="space-y-3">
                            <div className="flex justify-between text-sm">
                                      <span className="text-gray-500 font-body">Duration:</span>
                                      <span className="font-medium font-body text-gray-700">{type.duration}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                      <span className="text-gray-500 font-body">Price:</span>
                                      <span className="font-bold text-amber-600 font-body">{type.price}</span>
                            </div>
                            <div className="space-y-1">
                                      {type.features.slice(0, 2).map((feature, featureIndex) => (
                                        <div key={featureIndex} className="flex items-center gap-1 text-xs text-gray-600 font-body">
                                  <CheckCircle className="h-3 w-3 text-green-500" />
                                  {feature}
                                </div>
                              ))}
                            </div>
                          </div>
                                </div>
                              </motion.div>
                            </StaggeredCard>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
                </motion.div>

            {/* Quick Actions */}
            {selectedType && (
                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                  >
                    <Card className="bg-white/80 backdrop-blur-sm shadow-xl border-0 overflow-hidden">
                      <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 border-b border-green-100">
                        <CardTitle className="flex items-center gap-3 font-heading text-xl">
                          <motion.div
                            className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center"
                            whileHover={{ rotate: 360, scale: 1.1 }}
                            transition={{ duration: 0.6 }}
                          >
                            <Sparkles className="h-5 w-5 text-white" />
                          </motion.div>
                    Quick Actions
                  </CardTitle>
                        <CardDescription className="font-body text-gray-600">
                          Choose how you'd like to proceed with your consultation
                        </CardDescription>
                </CardHeader>
                      <CardContent className="p-6">
                        <div className="grid md:grid-cols-3 gap-6">
                    <Dialog>
                      <DialogTrigger asChild>
                              <motion.div
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                              >
                                <Button className="h-24 w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 magnetic-button">
                          <div className="text-center">
                                    <motion.div
                                      animate={{ scale: [1, 1.1, 1] }}
                                      transition={{ duration: 2, repeat: Infinity }}
                                    >
                                      <Play className="h-6 w-6 mx-auto mb-2" />
                                    </motion.div>
                                    <div className="text-sm font-medium font-body">Start Now</div>
                                    <div className="text-xs opacity-90 font-body">Available</div>
                          </div>
                        </Button>
                              </motion.div>
                      </DialogTrigger>
                            <DialogContent className="bg-white/95 backdrop-blur-sm border-0 shadow-2xl">
                              <DialogHeader className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-t-lg">
                                <DialogTitle className="font-heading text-xl">Start Instant Consultation</DialogTitle>
                        </DialogHeader>
                              <div className="p-6 space-y-4">
                                <p className="font-body text-gray-600">Connect with an available specialist right now!</p>
                                <motion.div
                                  whileHover={{ scale: 1.02 }}
                                  whileTap={{ scale: 0.98 }}
                                >
                          <Button 
                                    className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-body font-medium py-3 rounded-xl magnetic-button"
                            onClick={() => handleBookConsultation(selectedType)}
                          >
                            Connect Now
                          </Button>
                                </motion.div>
                        </div>
                      </DialogContent>
                    </Dialog>

                    <Dialog>
                      <DialogTrigger asChild>
                              <motion.div
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                              >
                                <Button variant="outline" className="h-24 w-full border-amber-300 text-amber-700 hover:bg-amber-50 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
                          <div className="text-center">
                                    <motion.div
                                      animate={{ rotate: [0, 5, -5, 0] }}
                                      transition={{ duration: 2, repeat: Infinity }}
                                    >
                                      <Calendar className="h-6 w-6 mx-auto mb-2" />
                                    </motion.div>
                                    <div className="text-sm font-medium font-body">Schedule</div>
                                    <div className="text-xs text-gray-500 font-body">Pick Time</div>
                          </div>
                        </Button>
                              </motion.div>
                      </DialogTrigger>
                            <DialogContent className="bg-white/95 backdrop-blur-sm border-0 shadow-2xl">
                              <DialogHeader className="bg-gradient-to-r from-amber-50 to-orange-50 p-6 rounded-t-lg">
                                <DialogTitle className="font-heading text-xl">Schedule Consultation</DialogTitle>
                        </DialogHeader>
                              <div className="p-6 space-y-4">
                          <div>
                                  <label className="text-sm font-medium font-body text-gray-700">Preferred Date</label>
                                  <Input type="date" className="mt-1 border-gray-300 focus:border-amber-500 focus:ring-amber-500 font-body" />
                          </div>
                          <div>
                                  <label className="text-sm font-medium font-body text-gray-700">Preferred Time</label>
                                  <Input type="time" className="mt-1 border-gray-300 focus:border-amber-500 focus:ring-amber-500 font-body" />
                          </div>
                          <div>
                                  <label className="text-sm font-medium font-body text-gray-700">Specialist Preference</label>
                                  <select className="w-full p-3 border border-gray-300 rounded-lg mt-1 focus:border-amber-500 focus:ring-amber-500 font-body">
                              <option>Any Available Specialist</option>
                              {specialists.map(s => (
                                <option key={s.id} value={s.id}>{s.name} - {s.specialty}</option>
                              ))}
                            </select>
                          </div>
                                <motion.div
                                  whileHover={{ scale: 1.02 }}
                                  whileTap={{ scale: 0.98 }}
                                >
                          <Button 
                                    className="w-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-body font-medium py-3 rounded-xl magnetic-button"
                            onClick={() => handleBookConsultation(selectedType)}
                          >
                            Schedule Consultation
                          </Button>
                                </motion.div>
                        </div>
                      </DialogContent>
                    </Dialog>

                          <motion.div
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <Button variant="outline" className="h-24 w-full border-blue-300 text-blue-700 hover:bg-blue-50 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
                      <div className="text-center">
                                <motion.div
                                  animate={{ scale: [1, 1.1, 1] }}
                                  transition={{ duration: 1.5, repeat: Infinity }}
                                >
                                  <MessageCircle className="h-6 w-6 mx-auto mb-2" />
                                </motion.div>
                                <div className="text-sm font-medium font-body">Chat First</div>
                                <div className="text-xs text-gray-500 font-body">Ask Questions</div>
                      </div>
                    </Button>
                          </motion.div>
                  </div>
                </CardContent>
              </Card>
                  </motion.div>
            )}
          </TabsContent>

          <TabsContent value="specialists" className="space-y-6">
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
                          <Users className="h-5 w-5 text-white" />
                        </motion.div>
                        Our Specialists
                </CardTitle>
                      <CardDescription className="font-body text-gray-600">
                        Meet our team of licensed mental health professionals
                </CardDescription>
              </CardHeader>
                    <CardContent className="p-6">
                <div className="grid md:grid-cols-2 gap-6">
                        {specialists.map((specialist, index) => (
                          <StaggeredCard key={specialist.id} index={index}>
                            <motion.div
                              className="rounded-xl p-6 bg-white/50 backdrop-blur-sm border border-gray-200 hover:shadow-lg transition-all duration-300 group"
                              whileHover={{ y: -5, scale: 1.02 }}
                              transition={{ duration: 0.3 }}
                            >
                        <div className="flex items-start gap-4">
                                <motion.div
                                  className="text-4xl"
                                  whileHover={{ scale: 1.2, rotate: 10 }}
                                  transition={{ duration: 0.3 }}
                                >
                                  {specialist.avatar}
                                </motion.div>
                          <div className="flex-1">
                                  <h3 className="font-semibold text-lg font-heading text-gray-900 mb-1">{specialist.name}</h3>
                                  <p className="text-sm text-gray-600 font-body mb-2">{specialist.specialty}</p>
                                  <div className="flex items-center gap-2 mb-3">
                                    <Star className="h-4 w-4 text-yellow-500 fill-current" />
                                    <span className="text-sm font-body text-gray-700">{specialist.rating}</span>
                                    <span className="text-sm text-gray-500 font-body">• {specialist.experience}</span>
                            </div>
                                  <div className="flex items-center gap-2 mb-3">
                                    <Badge className="bg-green-100 text-green-800 font-body">{specialist.availability}</Badge>
                                    <span className="text-sm font-body text-gray-600">{specialist.price}</span>
                              </div>
                                  <div className="space-y-1">
                                    <p className="text-xs text-gray-500 font-body">Languages: {specialist.languages.join(", ")}</p>
                                    <p className="text-xs text-gray-500 font-body">Focus: {specialist.focus.join(", ")}</p>
                            </div>
                              </div>
                              </div>
                            </motion.div>
                          </StaggeredCard>
                  ))}
                </div>
              </CardContent>
            </Card>
                </motion.div>
          </TabsContent>

          <TabsContent value="instant" className="space-y-6">
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
                          <Zap className="h-5 w-5 text-white" />
                        </motion.div>
                        Instant Support
                  </CardTitle>
                      <CardDescription className="font-body text-gray-600">
                        Get immediate help when you need it most
                  </CardDescription>
                </CardHeader>
                    <CardContent className="p-6">
                      <div className="text-center py-12">
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
                          <Zap className="h-12 w-12 text-gray-400" />
                        </motion.div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-2 font-heading">Instant Support Available</h3>
                        <p className="text-gray-600 font-body mb-6">Connect with a specialist immediately for urgent support</p>
                        <motion.div
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <Button className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-body font-medium py-3 px-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 magnetic-button">
                            Get Instant Help
                      </Button>
                        </motion.div>
                  </div>
                </CardContent>
              </Card>
                </motion.div>
              </TabsContent>

              <TabsContent value="resources" className="space-y-6">
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                >
                  <Card className="bg-white/80 backdrop-blur-sm shadow-xl border-0 overflow-hidden">
                    <CardHeader className="bg-gradient-to-r from-purple-50 to-violet-50 border-b border-purple-100">
                      <CardTitle className="flex items-center gap-3 font-heading text-xl">
                        <motion.div
                          className="w-10 h-10 bg-gradient-to-br from-purple-500 to-violet-600 rounded-xl flex items-center justify-center"
                          whileHover={{ rotate: 360, scale: 1.1 }}
                          transition={{ duration: 0.6 }}
                        >
                          <BookOpen className="h-5 w-5 text-white" />
                        </motion.div>
                        Resources
                  </CardTitle>
                      <CardDescription className="font-body text-gray-600">
                        Helpful resources and information for your mental health journey
                  </CardDescription>
                </CardHeader>
                    <CardContent className="p-6">
                      <div className="text-center py-12">
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
                          <BookOpen className="h-12 w-12 text-gray-400" />
                        </motion.div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-2 font-heading">Resources Coming Soon</h3>
                        <p className="text-gray-600 font-body mb-6">We're preparing helpful resources for your mental health journey</p>
                        <motion.div
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <Button className="bg-gradient-to-r from-purple-500 to-violet-600 hover:from-purple-600 hover:to-violet-700 text-white font-body font-medium py-3 px-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 magnetic-button">
                            Explore Resources
                    </Button>
                        </motion.div>
                  </div>
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

export default Consultation;