import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Calendar, User, Mail, Phone, MapPin, GraduationCap, Heart, Upload, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAccessibility } from "@/hooks/AccessibilityContext";
import { useAuth } from "@/hooks/useAuth";
import { 
  getProfile, 
  updateProfile, 
  uploadAvatar, 
  getRecentActivity, 
  getUserStats,
  type Profile,
  type ActivityItem,
  type UserStats
} from "@/lib/profiles";
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

const Profile = () => {
  const { ttsEnabled, speakText, highContrast, adhdMode } = useAccessibility();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const { toast } = useToast();

  // State management
  const [profile, setProfile] = useState<Profile | null>(null);
  const [recentActivity, setRecentActivity] = useState<ActivityItem[]>([]);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load profile data on component mount - only when user changes
  useEffect(() => {
    if (isAuthenticated && user && !profile) {
      loadProfileData();
    } else if (!authLoading && !isAuthenticated) {
      setLoading(false);
    }
  }, [isAuthenticated, user?.id, authLoading]);

  // Advanced GSAP animations with fallbacks
  useEffect(() => {
    // Ensure elements are visible by default
    gsap.set(".profile-header", { opacity: 1, y: 0 });
    gsap.set(".profile-content", { opacity: 1, y: 0 });

    // Add CSS fallback classes
    const headerElement = document.querySelector(".profile-header");
    const contentElement = document.querySelector(".profile-content");
    
    if (headerElement) {
      headerElement.classList.add('animate-fade-in-up');
    }
    if (contentElement) {
      contentElement.classList.add('animate-fade-in-up');
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

  const loadProfileData = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      // Load profile data
      const profileData = await getProfile(user.id);
      setProfile(profileData);
      
      // Load recent activity
      const activity = await getRecentActivity(user.id, 5);
      setRecentActivity(activity);
      
      // Load user stats
      const stats = await getUserStats(user.id);
      setUserStats(stats);
      
    } catch (error) {
      console.error('Error loading profile data:', error);
      toast({
        title: "Error",
        description: "Failed to load profile data.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!user || !profile) return;
    
    try {
      setSaving(true);
      
      const updatedProfile = await updateProfile(user.id, profile);
      setProfile(updatedProfile);
      
    toast({
      title: "Profile Updated",
        description: "Your profile has been updated successfully.",
      });
      
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Error",
        description: "Failed to update profile.",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    try {
      setUploadingAvatar(true);
      
      // Create preview URL immediately
      const previewUrl = URL.createObjectURL(file);
      setProfile(prev => prev ? { ...prev, avatar_url: previewUrl } : null);
      
      // Upload to Supabase
      const avatarUrl = await uploadAvatar(user.id, file);
      setProfile(prev => prev ? { ...prev, avatar_url: avatarUrl } : null);
      
      // Dispatch custom event for header update
      window.dispatchEvent(new CustomEvent('avatarUpdated', { 
        detail: { avatarUrl } 
      }));
      
      toast({
        title: "Avatar Updated",
        description: "Your profile picture has been updated successfully.",
      });
      
    } catch (error) {
      console.error('Error uploading avatar:', error);
      toast({
        title: "Error",
        description: "Failed to upload avatar.",
        variant: "destructive"
      });
    } finally {
      setUploadingAvatar(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-amber-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-body">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-amber-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4 font-heading">Please sign in</h1>
          <p className="text-gray-600 font-body">You need to be signed in to view your profile.</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-amber-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4 font-heading">Profile not found</h1>
          <p className="text-gray-600 font-body">Unable to load your profile information.</p>
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
            className="text-center max-w-4xl mx-auto profile-header"
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
                <User className="h-4 w-4" />
              </motion.div>
              Personal Profile & Wellness Journey
            </motion.div>
            
            {/* Animated title */}
            <motion.h1 
              className="text-5xl md:text-6xl lg:text-7xl font-bold mb-8 font-heading text-gray-900"
              initial={{ opacity: 1, y: 0 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.2, ease: "easeOut" }}
            >
              <motion.span
                className="inline-block bg-gradient-to-r from-gray-900 via-amber-600 to-rose-600 bg-clip-text text-transparent"
                whileHover={{ scale: 1.1, rotate: 2 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                My Profile
              </motion.span>
            </motion.h1>
            
            {/* Animated subtitle */}
            <motion.p 
              className="text-xl md:text-2xl text-gray-600 mb-12 font-body leading-relaxed max-w-3xl mx-auto"
              initial={{ opacity: 1, y: 0 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
            Manage your personal information and view your wellness journey
            </motion.p>
          </motion.div>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-20 relative z-10">
        <div className="max-w-6xl mx-auto profile-content animate-fade-in-up">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Profile Information */}
          <div className="lg:col-span-2 space-y-6">
              <StaggeredCard index={0}>
                <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm hover:shadow-2xl transition-all duration-300 rounded-xl overflow-hidden">
                  <CardHeader className="bg-gradient-to-r from-amber-50 to-orange-50 p-6 border-b border-amber-100">
                    <CardTitle className="flex items-center gap-3 text-xl font-semibold text-gray-800 font-heading">
                      <motion.div 
                        className="p-2 bg-gradient-to-br from-amber-500 to-orange-600 rounded-lg"
                        whileHover={{ rotate: 360, scale: 1.1 }}
                        transition={{ duration: 0.6 }}
                      >
                        <User className="h-5 w-5 text-white" />
                      </motion.div>
                  Personal Information
                </CardTitle>
                    <CardDescription className="text-gray-600 mt-1 font-body">
                  Update your basic profile information
                </CardDescription>
              </CardHeader>
                  <CardContent className="p-6 space-y-6">
                    {/* Avatar Section */}
                    <div className="flex items-center gap-6 p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg border border-amber-200">
                      <div className="relative">
                        <Avatar className="h-24 w-24 ring-4 ring-white shadow-lg">
                          <AvatarImage src={profile.avatar_url || undefined} className="object-cover" />
                          <AvatarFallback className="text-xl bg-gradient-to-br from-amber-500 to-orange-600 text-white font-semibold">
                            {profile.first_name?.charAt(0) || 'U'}{profile.last_name?.charAt(0) || ''}
                    </AvatarFallback>
                  </Avatar>
                        {uploadingAvatar && (
                          <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
                            <Loader2 className="h-6 w-6 animate-spin text-white" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2 font-heading">Profile Picture</h3>
                        <p className="text-sm text-gray-500 mb-3 font-body">
                          Upload a new profile picture to personalize your account
                        </p>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleAvatarUpload}
                          className="hidden"
                        />
                        <Button
                          onClick={() => fileInputRef.current?.click()}
                          disabled={uploadingAvatar}
                          className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-body"
                        >
                          <Upload className="h-4 w-4 mr-2" />
                          {uploadingAvatar ? 'Uploading...' : 'Upload Photo'}
                    </Button>
                  </div>
                </div>

                    {/* Form Fields */}
                <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="first_name" className="font-body text-gray-700">First Name</Label>
                    <Input
                          id="first_name"
                          value={profile.first_name || ''}
                          onChange={(e) => setProfile(prev => prev ? { ...prev, first_name: e.target.value } : null)}
                          className="border-gray-300 focus:border-amber-500 focus:ring-amber-500 font-body"
                    />
                  </div>
                      <div>
                        <Label htmlFor="last_name" className="font-body text-gray-700">Last Name</Label>
                    <Input
                          id="last_name"
                          value={profile.last_name || ''}
                          onChange={(e) => setProfile(prev => prev ? { ...prev, last_name: e.target.value } : null)}
                          className="border-gray-300 focus:border-amber-500 focus:ring-amber-500 font-body"
                    />
                  </div>
                </div>

                    <div>
                      <Label htmlFor="email" className="font-body text-gray-700">Email</Label>
                  <Input
                    id="email"
                    type="email"
                        value={profile.email || ''}
                        disabled
                        className="bg-gray-100 border-gray-300 font-body"
                  />
                      <p className="text-xs text-gray-500 mt-1 font-body">
                        Email cannot be changed. Contact support if needed.
                      </p>
                </div>

                    <div>
                      <Label htmlFor="phone" className="font-body text-gray-700">Phone Number</Label>
                    <Input
                      id="phone"
                        value={profile.phone || ''}
                        onChange={(e) => setProfile(prev => prev ? { ...prev, phone: e.target.value } : null)}
                        className="border-gray-300 focus:border-amber-500 focus:ring-amber-500 font-body"
                      />
                </div>

                    <div>
                      <Label htmlFor="bio" className="font-body text-gray-700">Bio</Label>
                  <Textarea
                    id="bio"
                        value={profile.bio || ''}
                        onChange={(e) => setProfile(prev => prev ? { ...prev, bio: e.target.value } : null)}
                        placeholder="Tell us about yourself..."
                        className="border-gray-300 focus:border-amber-500 focus:ring-amber-500 font-body"
                    rows={3}
                  />
                </div>

                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
              <Button
                onClick={handleSaveProfile}
                        disabled={saving}
                        className="magnetic-button w-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-body"
                      >
                        {saving ? (
                          <>
                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          'Save Profile'
                        )}
              </Button>
                    </motion.div>
                  </CardContent>
                </Card>
              </StaggeredCard>
          </div>

            {/* Sidebar */}
          <div className="space-y-6">
              {/* Recent Activity */}
              <StaggeredCard index={1}>
                <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm hover:shadow-2xl transition-all duration-300 rounded-xl overflow-hidden">
                  <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 border-b border-blue-100">
                    <CardTitle className="text-lg flex items-center gap-3 font-heading">
                      <motion.div 
                        className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg"
                        whileHover={{ rotate: 360, scale: 1.1 }}
                        transition={{ duration: 0.6 }}
                      >
                        <Calendar className="h-4 w-4 text-white" />
                      </motion.div>
                      Recent Activity
                    </CardTitle>
                    <CardDescription className="text-gray-600 font-body">
                  Your latest wellness activities
                </CardDescription>
              </CardHeader>
                  <CardContent className="p-6 space-y-3">
                    {recentActivity.length > 0 ? (
                      recentActivity.map((activity) => (
                        <div key={activity.id} className="p-3 bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg border border-gray-200 hover:shadow-md transition-all duration-200">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <div className={`w-2 h-2 rounded-full ${
                                activity.type === 'assessment' ? 'bg-blue-500' :
                                activity.type === 'checkin' ? 'bg-green-500' :
                                activity.type === 'goal' ? 'bg-purple-500' :
                                activity.type === 'game' ? 'bg-orange-500' :
                                'bg-gray-500'
                              }`} />
                              <span className="text-sm font-medium text-gray-900 font-body">{activity.name}</span>
                            </div>
                            <span className="text-xs text-gray-500 font-body">{activity.date}</span>
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {activity.score !== undefined && (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                Score: {activity.score}
                              </span>
                            )}
                            {activity.mood && (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                Mood: {activity.mood}
                              </span>
                            )}
                            {activity.duration && (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                Duration: {activity.duration}
                              </span>
                            )}
                            {activity.progress !== undefined && (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                                Progress: {activity.progress}%
                      </span>
                            )}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                          <Calendar className="h-8 w-8 text-gray-400" />
                    </div>
                        <h3 className="text-sm font-medium text-gray-900 mb-2 font-heading">No Recent Activity</h3>
                        <p className="text-sm text-gray-500 mb-4 font-body">
                          Start using the app to see your progress here!
                        </p>
                        <div className="space-y-2 text-xs text-gray-400 font-body">
                          <p>• Complete assessments</p>
                          <p>• Check in daily</p>
                          <p>• Set and achieve goals</p>
                    </div>
                  </div>
                    )}
              </CardContent>
            </Card>
              </StaggeredCard>

              {/* Quick Stats */}
              <StaggeredCard index={2}>
                <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm hover:shadow-2xl transition-all duration-300 rounded-xl overflow-hidden">
                  <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 border-b border-green-100">
                    <CardTitle className="text-lg flex items-center gap-3 font-heading">
                      <motion.div 
                        className="p-2 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg"
                        whileHover={{ rotate: 360, scale: 1.1 }}
                        transition={{ duration: 0.6 }}
                      >
                        <Heart className="h-4 w-4 text-white" />
                      </motion.div>
                      Quick Stats
                    </CardTitle>
                    <CardDescription className="text-gray-600 font-body">
                      Your wellness progress
                    </CardDescription>
              </CardHeader>
                  <CardContent className="p-6 space-y-3">
                    {userStats ? (
                      <>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                                <Calendar className="h-4 w-4 text-white" />
                              </div>
                              <span className="text-sm font-medium text-gray-700 font-body">Total Check-ins</span>
                            </div>
                            <span className="text-lg font-bold text-blue-600 font-heading">{userStats.totalCheckins}</span>
                          </div>
                          <div className="flex items-center justify-between p-3 bg-gradient-to-r from-green-50 to-green-100 rounded-lg">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                                <Heart className="h-4 w-4 text-white" />
                              </div>
                              <span className="text-sm font-medium text-gray-700 font-body">Avg Mood</span>
                            </div>
                            <span className="text-lg font-bold text-green-600 font-heading">{userStats.averageMood?.toFixed(1) || 'N/A'}</span>
                  </div>
                          <div className="flex items-center justify-between p-3 bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                                <GraduationCap className="h-4 w-4 text-white" />
                  </div>
                              <span className="text-sm font-medium text-gray-700 font-body">Goals Completed</span>
                  </div>
                            <span className="text-lg font-bold text-purple-600 font-heading">{userStats.completedGoals}</span>
                  </div>
                </div>
                      </>
                    ) : (
                      <div className="text-center py-8">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                          <Heart className="h-8 w-8 text-gray-400" />
                        </div>
                        <h3 className="text-sm font-medium text-gray-900 mb-2 font-heading">Loading Stats...</h3>
                        <p className="text-sm text-gray-500 font-body">
                          Please wait while we fetch your statistics
                        </p>
                      </div>
                    )}
              </CardContent>
            </Card>
              </StaggeredCard>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;