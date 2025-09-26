import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { motion, useScroll, useTransform, useSpring, useInView } from "framer-motion";
import { useInView as useInViewSpring, animated, useSprings } from "@react-spring/web";
import { gsap } from "gsap";
import { 
  Users, Heart, MessageCircle, Star, Clock, MapPin, 
  Globe, Shield, Sparkles, Zap, Crown, Gift, 
  CheckCircle, AlertCircle, Send, UserPlus, 
  Calendar, Phone, Video, MessageSquare,
  TrendingUp, Award, Target, Coffee
} from "lucide-react";
import { 
  getCompanionProfile, createCompanionProfile, updateCompanionProfile,
  getAvailableMentors, getAvailableMentees, createBuddyMatch,
  getUserBuddyMatches, updateBuddyMatchStatus, getCompanionStats,
  CompanionProfile, BuddyMatch
} from "@/lib/studentCompanion";
import { useAuth } from "@/hooks/useAuth";

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
  return (
    <div className="absolute inset-0 overflow-hidden">
      <motion.div
        className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-amber-200 to-orange-300 rounded-full opacity-20"
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
        className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-br from-orange-200 to-amber-300 rounded-full opacity-20"
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

// Staggered Card Component
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

const StudentCompanion = () => {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  
  // State management
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<CompanionProfile | null>(null);
  const [availableMentors, setAvailableMentors] = useState<CompanionProfile[]>([]);
  const [availableMentees, setAvailableMentees] = useState<CompanionProfile[]>([]);
  const [buddyMatches, setBuddyMatches] = useState<BuddyMatch[]>([]);
  const [stats, setStats] = useState({
    totalMatches: 0,
    activeMatches: 0,
    completedSessions: 0,
    averageRating: 0,
    totalHelpProvided: 0
  });

  // Form states
  const [profileForm, setProfileForm] = useState({
    display_name: '',
    bio: '',
    interests: [] as string[],
    experience_level: 'beginner' as 'beginner' | 'intermediate' | 'experienced',
    preferred_communication: 'text' as 'text' | 'voice' | 'video' | 'any',
    is_mentor: false,
    is_seeking_help: true
  });

  const [newInterest, setNewInterest] = useState('');

  // Load data on component mount
  useEffect(() => {
    if (isAuthenticated && user?.id) {
      loadCompanionData();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated, user?.id]);

  // GSAP animations
  useEffect(() => {
    // Ensure elements are visible by default
    gsap.set(".companion-header", { opacity: 1, y: 0 });
    gsap.set(".companion-stats", { opacity: 1, y: 0 });
    gsap.set(".companion-content", { opacity: 1, y: 0 });

    // Add CSS fallback classes
    const headerElement = document.querySelector(".companion-header");
    const statsElement = document.querySelector(".companion-stats");
    const contentElement = document.querySelector(".companion-content");
    
    if (headerElement) {
      headerElement.classList.add('animate-fade-in-up');
    }
    if (statsElement) {
      statsElement.classList.add('animate-fade-in-up');
    }
    if (contentElement) {
      contentElement.classList.add('animate-fade-in-up');
    }

    // Magnetic effect for buttons
    setTimeout(() => {
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
    }, 100);

  }, []);

  const loadCompanionData = async () => {
    if (!user) return;
    
    // Prevent re-fetching if data is already loaded
    if (profile) return;
    
    try {
      setLoading(true);
      
      // Load or create profile
      let userProfile = await getCompanionProfile(user.id);
      if (!userProfile) {
        // Create default profile
        userProfile = await createCompanionProfile({
          user_id: user.id,
          display_name: user.email?.split('@')[0] || 'Student',
          bio: '',
          interests: [],
          is_mentor: false,
          is_seeking_help: true
        });
      }
      
      if (userProfile) {
        setProfile(userProfile);
        setProfileForm({
          display_name: userProfile.display_name,
          bio: userProfile.bio || '',
          interests: userProfile.interests,
          experience_level: userProfile.experience_level,
          preferred_communication: userProfile.preferred_communication,
          is_mentor: userProfile.is_mentor,
          is_seeking_help: userProfile.is_seeking_help
        });
      }

      // Load available mentors and mentees
      const mentors = await getAvailableMentors(user.id);
      const mentees = await getAvailableMentees(user.id);
      setAvailableMentors(mentors);
      setAvailableMentees(mentees);

      // Load buddy matches
      const matches = await getUserBuddyMatches(user.id);
      setBuddyMatches(matches);

      // Load stats
      const userStats = await getCompanionStats(user.id);
      setStats(userStats);
      
    } catch (error) {
      console.error('Error loading companion data:', error);
      toast({
        title: "Error",
        description: "Failed to load companion data.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!profile) return;
    
    try {
      const updatedProfile = await updateCompanionProfile(profile.id, profileForm);
      if (updatedProfile) {
        setProfile(updatedProfile);
        toast({
          title: "Profile Created! 🎉",
          description: "We'll notify you when we find your perfect buddy match.",
        });
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Error",
        description: "Failed to update profile.",
        variant: "destructive"
      });
    }
  };

  const handleAddInterest = () => {
    if (newInterest.trim() && !profileForm.interests.includes(newInterest.trim())) {
      setProfileForm(prev => ({
        ...prev,
        interests: [...prev.interests, newInterest.trim()]
      }));
      setNewInterest('');
    }
  };

  const handleRemoveInterest = (interest: string) => {
    setProfileForm(prev => ({
      ...prev,
      interests: prev.interests.filter(i => i !== interest)
    }));
  };

  const handleRequestBuddy = async (mentorId: string) => {
    if (!profile) return;
    
    try {
      const match = await createBuddyMatch(profile.id, mentorId);
      if (match) {
        toast({
          title: "Buddy Request Sent",
          description: "Your request has been sent to the mentor.",
        });
        loadCompanionData(); // Refresh data
      }
    } catch (error) {
      console.error('Error creating buddy match:', error);
      toast({
        title: "Error",
        description: "Failed to send buddy request.",
        variant: "destructive"
      });
    }
  };

  const handleAcceptMatch = async (matchId: string) => {
    try {
      const updatedMatch = await updateBuddyMatchStatus(matchId, 'accepted');
      if (updatedMatch) {
        toast({
          title: "Match Accepted",
          description: "You are now connected with your buddy!",
        });
        loadCompanionData(); // Refresh data
      }
    } catch (error) {
      console.error('Error accepting match:', error);
      toast({
        title: "Error",
        description: "Failed to accept match.",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-amber-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-body">Loading companion data...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-amber-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4 font-heading">Please Sign In</h1>
          <p className="text-gray-600 font-body">You need to be signed in to access Student Companion.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-amber-50 overflow-hidden">
      {/* Hero Section */}
      <motion.div 
        className="relative overflow-hidden bg-gradient-to-br from-slate-50 via-white to-amber-50 py-20 companion-header"
        initial={{ opacity: 1, y: 0 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Animated Background */}
        <MorphingBackground />
        <FloatingParticles />
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <motion.div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-amber-100 to-orange-100 border border-amber-200 mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              >
                <Users className="h-4 w-4 text-amber-600" />
              </motion.div>
              <span className="text-amber-700 font-body text-sm font-medium">Student Companion</span>
            </motion.div>

            <motion.h1 
              className="text-5xl md:text-6xl font-bold mb-6 font-heading"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.8 }}
            >
              <motion.span
                className="bg-gradient-to-r from-gray-900 via-amber-600 to-rose-600 bg-clip-text text-transparent"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.3 }}
              >
                Find Your
              </motion.span>
              <br />
              <motion.span
                className="bg-gradient-to-r from-amber-600 via-orange-600 to-rose-600 bg-clip-text text-transparent"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.3 }}
              >
                Perfect Buddy
              </motion.span>
            </motion.h1>

            <motion.p 
              className="text-xl text-gray-600 mb-8 font-body max-w-2xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
            >
              Connect with fellow students who understand your journey. Get support, share experiences, and grow together in a safe, supportive community.
            </motion.p>
          </div>
        </div>
      </motion.div>

      {/* Stats Section */}
      <motion.section 
        className="py-16 companion-stats animate-fade-in-up"
        initial={{ opacity: 1, y: 0 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="container mx-auto px-4">
          <AnimatedText className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4 font-heading">Your Companion Journey</h2>
            <p className="text-gray-600 font-body max-w-2xl mx-auto">
              Track your progress and see how you're making a difference in the community
            </p>
          </AnimatedText>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {[
              { label: 'Total Matches', value: stats.totalMatches, icon: Users, color: 'blue' },
              { label: 'Active Buddies', value: stats.activeMatches, icon: Heart, color: 'green' },
              { label: 'Sessions Completed', value: stats.completedSessions, icon: CheckCircle, color: 'purple' }
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                className="text-center p-6 bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                whileHover={{ y: -5, scale: 1.02 }}
                transition={{ duration: 0.3 }}
              >
                <motion.div
                  className={`w-12 h-12 mx-auto mb-4 rounded-xl flex items-center justify-center bg-gradient-to-br ${
                    stat.color === 'blue' ? 'from-blue-500 to-blue-600' :
                    stat.color === 'green' ? 'from-green-500 to-green-600' :
                    'from-purple-500 to-purple-600'
                  }`}
                  whileHover={{ rotate: 360, scale: 1.1 }}
                  transition={{ duration: 0.6 }}
                >
                  <stat.icon className="h-6 w-6 text-white" />
                </motion.div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2 font-heading">{stat.value}</h3>
                <p className="text-gray-600 font-body">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-20 relative z-10">
        <div className="max-w-6xl mx-auto companion-content animate-fade-in-up" style={{ opacity: 1, transform: 'translateY(0)' }}>

          <Tabs defaultValue="profile" className="space-y-8">
            <TabsList className="grid w-full grid-cols-4 bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              {[
                { value: 'profile', label: 'My Profile', icon: UserPlus },
                { value: 'find-buddy', label: 'Find Buddy', icon: Users },
                { value: 'my-matches', label: 'My Matches', icon: Heart },
                { value: 'help-others', label: 'Help Others', icon: Shield }
              ].map((tab, index) => (
                <motion.div key={tab.value} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <TabsTrigger 
                    value={tab.value} 
                    className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-500 data-[state=active]:to-orange-600 data-[state=active]:text-white font-body"
                  >
                    <tab.icon className="h-4 w-4 mr-2" />
                    {tab.label}
                  </TabsTrigger>
                </motion.div>
              ))}
            </TabsList>

            {/* Profile Tab */}
            <TabsContent value="profile">
              <StaggeredCard index={0}>
                <Card className="bg-white/80 backdrop-blur-sm shadow-xl border-0 overflow-hidden">
                  <CardHeader className="bg-gradient-to-r from-amber-50 to-orange-50 border-b border-amber-100">
                    <CardTitle className="flex items-center gap-3 font-heading text-xl">
                      <motion.div
                        className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center"
                        whileHover={{ rotate: 360, scale: 1.1 }}
                        transition={{ duration: 0.6 }}
                      >
                        <UserPlus className="h-5 w-5 text-white" />
                      </motion.div>
                      My Companion Profile
                    </CardTitle>
                    <CardDescription className="font-body text-gray-600">
                      Set up your profile to connect with the right people
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <Label htmlFor="display_name" className="font-body text-gray-700">Display Name</Label>
                        <Input 
                          id="display_name"
                          value={profileForm.display_name}
                          onChange={(e) => setProfileForm(prev => ({ ...prev, display_name: e.target.value }))}
                          className="font-body border-gray-300 focus:border-amber-500 focus:ring-amber-500"
                          placeholder="How should others call you?"
                        />
                      </div>
                      <div>
                        <Label htmlFor="experience_level" className="font-body text-gray-700">Experience Level</Label>
                        <Select 
                          value={profileForm.experience_level} 
                          onValueChange={(value: any) => setProfileForm(prev => ({ ...prev, experience_level: value }))}
                        >
                          <SelectTrigger className="font-body border-gray-300 focus:border-amber-500 focus:ring-amber-500">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="beginner">Beginner</SelectItem>
                            <SelectItem value="intermediate">Intermediate</SelectItem>
                            <SelectItem value="experienced">Experienced</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="bio" className="font-body text-gray-700">Bio</Label>
                      <Textarea 
                        id="bio"
                        value={profileForm.bio}
                        onChange={(e) => setProfileForm(prev => ({ ...prev, bio: e.target.value }))}
                        className="font-body border-gray-300 focus:border-amber-500 focus:ring-amber-500"
                        placeholder="Tell others about yourself, your interests, and how you can help or what you need help with..."
                        rows={4}
                      />
                    </div>

                    <div>
                      <Label className="font-body text-gray-700">Interests</Label>
                      <div className="flex gap-2 mb-3">
                        <Input 
                          value={newInterest}
                          onChange={(e) => setNewInterest(e.target.value)}
                          className="font-body border-gray-300 focus:border-amber-500 focus:ring-amber-500"
                          placeholder="Add an interest..."
                          onKeyPress={(e) => e.key === 'Enter' && handleAddInterest()}
                        />
                        <Button onClick={handleAddInterest} className="bg-amber-500 hover:bg-amber-600">
                          Add
                        </Button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {profileForm.interests.map((interest) => (
                          <Badge key={interest} variant="secondary" className="font-body">
                            {interest}
                            <button 
                              onClick={() => handleRemoveInterest(interest)}
                              className="ml-2 text-gray-500 hover:text-red-500"
                            >
                              ×
                            </button>
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <Label htmlFor="preferred_communication" className="font-body text-gray-700">Preferred Communication</Label>
                        <Select 
                          value={profileForm.preferred_communication} 
                          onValueChange={(value: any) => setProfileForm(prev => ({ ...prev, preferred_communication: value }))}
                        >
                          <SelectTrigger className="font-body border-gray-300 focus:border-amber-500 focus:ring-amber-500">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="text">Text</SelectItem>
                            <SelectItem value="voice">Voice</SelectItem>
                            <SelectItem value="video">Video</SelectItem>
                            <SelectItem value="any">Any</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-4">
                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id="is_mentor"
                            checked={profileForm.is_mentor}
                            onChange={(e) => setProfileForm(prev => ({ ...prev, is_mentor: e.target.checked }))}
                            className="rounded border-gray-300 text-amber-600 focus:ring-amber-500"
                          />
                          <Label htmlFor="is_mentor" className="font-body text-gray-700">I want to help others (Mentor)</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id="is_seeking_help"
                            checked={profileForm.is_seeking_help}
                            onChange={(e) => setProfileForm(prev => ({ ...prev, is_seeking_help: e.target.checked }))}
                            className="rounded border-gray-300 text-amber-600 focus:ring-amber-500"
                          />
                          <Label htmlFor="is_seeking_help" className="font-body text-gray-700">I need help (Mentee)</Label>
                        </div>
                      </div>
                    </div>

                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Button 
                        onClick={handleSaveProfile}
                        className="w-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-body magnetic-button"
                      >
                        <UserPlus className="h-4 w-4 mr-2" />
                        Create Profile & Find Buddy
                      </Button>
                    </motion.div>
                  </CardContent>
                </Card>
              </StaggeredCard>
            </TabsContent>

            {/* Find Buddy Tab */}
            <TabsContent value="find-buddy">
              <StaggeredCard index={0}>
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
                      Available Mentors
                    </CardTitle>
                    <CardDescription className="font-body text-gray-600">
                      Connect with experienced students who can help you on your journey
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {availableMentors.map((mentor, index) => (
                        <StaggeredCard key={mentor.id} index={index}>
                          <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 h-full">
                            <CardContent className="p-6">
                              <div className="text-center mb-4">
                                <Avatar className="w-16 h-16 mx-auto mb-3">
                                  <AvatarImage src="" />
                                  <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-heading">
                                    {mentor.display_name.charAt(0)}
                                  </AvatarFallback>
                                </Avatar>
                                <h3 className="font-bold text-lg font-heading">{mentor.display_name}</h3>
                                <div className="flex items-center justify-center gap-1 mb-2">
                                  {[...Array(5)].map((_, i) => (
                                    <Star 
                                      key={i} 
                                      className={`h-4 w-4 ${i < Math.floor(mentor.rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
                                    />
                                  ))}
                                  <span className="text-sm text-gray-600 font-body ml-1">({mentor.total_ratings})</span>
                                </div>
                              </div>
                              
                              <p className="text-gray-600 text-sm font-body mb-4 line-clamp-3">
                                {mentor.bio || 'No bio available'}
                              </p>
                              
                              <div className="flex flex-wrap gap-1 mb-4">
                                {mentor.interests.slice(0, 3).map((interest) => (
                                  <Badge key={interest} variant="secondary" className="text-xs font-body">
                                    {interest}
                                  </Badge>
                                ))}
                                {mentor.interests.length > 3 && (
                                  <Badge variant="secondary" className="text-xs font-body">
                                    +{mentor.interests.length - 3}
                                  </Badge>
                                )}
                              </div>
                              
                              <div className="flex items-center justify-between text-sm text-gray-500 font-body mb-4">
                                <span className="flex items-center gap-1">
                                  <Award className="h-4 w-4" />
                                  {mentor.experience_level}
                                </span>
                                <span className="flex items-center gap-1">
                                  <MessageCircle className="h-4 w-4" />
                                  {mentor.preferred_communication}
                                </span>
                              </div>
                              
                              <motion.div
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                              >
                                <Button 
                                  onClick={() => handleRequestBuddy(mentor.id)}
                                  className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-body magnetic-button"
                                >
                                  <UserPlus className="h-4 w-4 mr-2" />
                                  Request Buddy
                                </Button>
                              </motion.div>
                            </CardContent>
                          </Card>
                        </StaggeredCard>
                      ))}
                    </div>
                    
                    {availableMentors.length === 0 && (
                      <div className="text-center py-12">
                        <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 mb-2 font-heading">No mentors available yet</h3>
                        <p className="text-gray-600 font-body mb-4">
                          Be the first to help others! Set up your profile as a mentor to start supporting fellow students.
                        </p>
                        <Button 
                          onClick={() => {
                            setProfileForm(prev => ({ ...prev, is_mentor: true }));
                            // Scroll to profile tab
                            const profileTab = document.querySelector('[value="profile"]') as HTMLElement;
                            profileTab?.click();
                          }}
                          className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-body"
                        >
                          <UserPlus className="h-4 w-4 mr-2" />
                          Become a Mentor
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </StaggeredCard>
            </TabsContent>

            {/* My Matches Tab */}
            <TabsContent value="my-matches">
              <StaggeredCard index={0}>
                <Card className="bg-white/80 backdrop-blur-sm shadow-xl border-0 overflow-hidden">
                  <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 border-b border-green-100">
                    <CardTitle className="flex items-center gap-3 font-heading text-xl">
                      <motion.div
                        className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center"
                        whileHover={{ rotate: 360, scale: 1.1 }}
                        transition={{ duration: 0.6 }}
                      >
                        <Heart className="h-5 w-5 text-white" />
                      </motion.div>
                      My Buddy Matches
                    </CardTitle>
                    <CardDescription className="font-body text-gray-600">
                      Your connections and ongoing buddy relationships
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="space-y-6">
                      {buddyMatches.map((match, index) => (
                        <StaggeredCard key={match.id} index={index}>
                          <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                            <CardContent className="p-6">
                              <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-4">
                                  <Avatar className="w-12 h-12">
                                    <AvatarImage src="" />
                                    <AvatarFallback className="bg-gradient-to-br from-green-500 to-emerald-600 text-white font-heading">
                                      {match.mentor?.display_name.charAt(0) || 'M'}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div>
                                    <h3 className="font-bold font-heading">
                                      {match.mentor?.display_name || 'Unknown Mentor'}
                                    </h3>
                                    <p className="text-sm text-gray-600 font-body">
                                      Match Score: {match.match_score}%
                                    </p>
                                  </div>
                                </div>
                                <Badge 
                                  variant={
                                    match.status === 'active' ? 'default' :
                                    match.status === 'accepted' ? 'secondary' :
                                    match.status === 'pending' ? 'outline' : 'destructive'
                                  }
                                  className="font-body"
                                >
                                  {match.status}
                                </Badge>
                              </div>
                              
                              {match.mentor?.bio && (
                                <p className="text-gray-600 text-sm font-body mb-4">
                                  {match.mentor.bio}
                                </p>
                              )}
                              
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4 text-sm text-gray-500 font-body">
                                  <span className="flex items-center gap-1">
                                    <Calendar className="h-4 w-4" />
                                    {new Date(match.created_at).toLocaleDateString()}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <Star className="h-4 w-4" />
                                    {match.mentor?.rating || 0}/5
                                  </span>
                                </div>
                                
                                {match.status === 'pending' && profile?.id === match.mentor_id && (
                                  <motion.div
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                  >
                                    <Button 
                                      onClick={() => handleAcceptMatch(match.id)}
                                      className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-body magnetic-button"
                                    >
                                      <CheckCircle className="h-4 w-4 mr-2" />
                                      Accept
                                    </Button>
                                  </motion.div>
                                )}
                                
                                {match.status === 'active' && (
                                  <motion.div
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                  >
                                    <Button 
                                      className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-body magnetic-button"
                                    >
                                      <MessageCircle className="h-4 w-4 mr-2" />
                                      Chat
                                    </Button>
                                  </motion.div>
                                )}
                              </div>
                            </CardContent>
                          </Card>
                        </StaggeredCard>
                      ))}
                    </div>
                    
                    {buddyMatches.length === 0 && (
                      <div className="text-center py-12">
                        <Heart className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 mb-2 font-heading">No matches yet</h3>
                        <p className="text-gray-600 font-body">Start by finding a buddy or helping others to create matches.</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </StaggeredCard>
            </TabsContent>

            {/* Help Others Tab */}
            <TabsContent value="help-others">
              <StaggeredCard index={0}>
                <Card className="bg-white/80 backdrop-blur-sm shadow-xl border-0 overflow-hidden">
                  <CardHeader className="bg-gradient-to-r from-purple-50 to-violet-50 border-b border-purple-100">
                    <CardTitle className="flex items-center gap-3 font-heading text-xl">
                      <motion.div
                        className="w-10 h-10 bg-gradient-to-br from-purple-500 to-violet-600 rounded-xl flex items-center justify-center"
                        whileHover={{ rotate: 360, scale: 1.1 }}
                        transition={{ duration: 0.6 }}
                      >
                        <Shield className="h-5 w-5 text-white" />
                      </motion.div>
                      Help Other Students
                    </CardTitle>
                    <CardDescription className="font-body text-gray-600">
                      Students looking for support and guidance
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {availableMentees.map((mentee, index) => (
                        <StaggeredCard key={mentee.id} index={index}>
                          <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 h-full">
                            <CardContent className="p-6">
                              <div className="text-center mb-4">
                                <Avatar className="w-16 h-16 mx-auto mb-3">
                                  <AvatarImage src="" />
                                  <AvatarFallback className="bg-gradient-to-br from-purple-500 to-violet-600 text-white font-heading">
                                    {mentee.display_name.charAt(0)}
                                  </AvatarFallback>
                                </Avatar>
                                <h3 className="font-bold text-lg font-heading">{mentee.display_name}</h3>
                                <p className="text-sm text-gray-600 font-body">
                                  {mentee.experience_level} • {mentee.preferred_communication}
                                </p>
                              </div>
                              
                              <p className="text-gray-600 text-sm font-body mb-4 line-clamp-3">
                                {mentee.bio || 'No bio available'}
                              </p>
                              
                              <div className="flex flex-wrap gap-1 mb-4">
                                {mentee.interests.slice(0, 3).map((interest) => (
                                  <Badge key={interest} variant="secondary" className="text-xs font-body">
                                    {interest}
                                  </Badge>
                                ))}
                                {mentee.interests.length > 3 && (
                                  <Badge variant="secondary" className="text-xs font-body">
                                    +{mentee.interests.length - 3}
                                  </Badge>
                                )}
                              </div>
                              
                              <motion.div
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                              >
                                <Button 
                                  onClick={() => handleRequestBuddy(mentee.id)}
                                  className="w-full bg-gradient-to-r from-purple-500 to-violet-600 hover:from-purple-600 hover:to-violet-700 text-white font-body magnetic-button"
                                >
                                  <Shield className="h-4 w-4 mr-2" />
                                  Offer Help
                                </Button>
                              </motion.div>
                            </CardContent>
                          </Card>
                        </StaggeredCard>
                      ))}
                    </div>
                    
                    {availableMentees.length === 0 && (
                      <div className="text-center py-12">
                        <Shield className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 mb-2 font-heading">No students seeking help yet</h3>
                        <p className="text-gray-600 font-body mb-4">
                          Students will appear here when they need support. You can also help by encouraging others to join the community!
                        </p>
                        <Button 
                          onClick={() => {
                            // Scroll to profile tab
                            const profileTab = document.querySelector('[value="profile"]') as HTMLElement;
                            profileTab?.click();
                          }}
                          className="bg-gradient-to-r from-purple-500 to-violet-600 hover:from-purple-600 hover:to-violet-700 text-white font-body"
                        >
                          <Shield className="h-4 w-4 mr-2" />
                          Set Up Mentor Profile
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </StaggeredCard>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default StudentCompanion;
