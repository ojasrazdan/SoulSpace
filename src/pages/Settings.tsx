import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useAccessibility } from "@/hooks/AccessibilityContext";
import { Contrast, BrainCircuit, Mic, User, Bell, Shield, Save, Eye, EyeOff, Globe, Languages } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabaseClient";
import { getUserSettings, updateUserSettings, getUserProfile, updateUserProfile, updateUserPassword, UserSettings, UserProfile } from "@/lib/settings";
import { motion, useScroll, useTransform, useSpring, useInView } from "framer-motion";
import { useInView as useInViewSpring, animated, useSprings } from "@react-spring/web";
import { gsap } from "gsap";
import { useLanguage, LANGUAGE_OPTIONS } from "@/hooks/LanguageContext";

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

const Settings = () => {
  
  // --- CORRECTED DESTRUCTURING ---
  const {
    highContrast,
    toggleHighContrast,
    adhdMode,
    toggleADHDMode, // Corrected: Was toggleAdhdMode
    ttsEnabled,       // Corrected: Was tts
    toggleTTS,        // Corrected: Was toggleTts
  } = useAccessibility();

  const { toast } = useToast();
  const { currentLanguage, setCurrentLanguage, getLanguageLabel } = useLanguage();
  
  // State management
  const [user, setUser] = useState<any>(null);
  const [userSettings, setUserSettings] = useState<UserSettings | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Profile form state
  const [profileForm, setProfileForm] = useState({
    full_name: '',
    email: ''
  });
  
  // Password form state
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });

  // Language settings state (synced with context)
  const [selectedLanguage, setSelectedLanguage] = useState(currentLanguage || 'en');

  // Load user data on component mount
  useEffect(() => {
    loadUserData();
  }, []);

  // Sync selected language with context
  useEffect(() => {
    if (currentLanguage) {
      setSelectedLanguage(currentLanguage);
    }
  }, [currentLanguage]);

  // Advanced GSAP animations with fallbacks
  useEffect(() => {
    // Ensure elements are visible by default - no initial hiding
    gsap.set(".settings-header", { opacity: 1, y: 0 });
    gsap.set(".settings-content", { opacity: 1, y: 0 });

    // Add CSS fallback classes immediately
    const headerElement = document.querySelector(".settings-header");
    const contentElement = document.querySelector(".settings-content");
    
    if (headerElement) {
      headerElement.classList.add('animate-fade-in-up');
    }
    if (contentElement) {
      contentElement.classList.add('animate-fade-in-up');
    }

    // Magnetic effect for buttons - only after a delay to ensure elements exist
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

  const loadUserData = async () => {
    try {
      setLoading(true);
      
      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;
      
      if (!user) {
        toast({
          title: "Not signed in",
          description: "Please sign in to access settings.",
          variant: "destructive"
        });
        return;
      }
      
      setUser(user);
      
      // Load user settings
      const settings = await getUserSettings(user.id);
      setUserSettings(settings);
      
      // Load user profile
      const profile = await getUserProfile(user.id);
      setUserProfile(profile);
      
      // Set form data
      setProfileForm({
        full_name: profile?.full_name || '',
        email: user.email || ''
      });

      // Set language preference
      const savedLanguage = settings?.language || localStorage.getItem('preferred-language') || 'en';
      setSelectedLanguage(savedLanguage);
      
    } catch (error) {
      console.error('Error loading user data:', error);
      toast({
        title: "Error",
        description: "Failed to load user data.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async () => {
    if (!user) return;
    
    try {
      setSaving(true);
      
      const updatedProfile = await updateUserProfile(user.id, {
        full_name: profileForm.full_name
      });
      
      if (updatedProfile) {
        setUserProfile(updatedProfile);
        toast({
          title: "Profile Updated",
          description: "Your profile has been updated successfully.",
        });
      }
      
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

  const handleUpdatePassword = async () => {
    if (!user) return;
    
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast({
        title: "Password Mismatch",
        description: "New password and confirmation don't match.",
        variant: "destructive"
      });
      return;
    }
    
    if (passwordForm.newPassword.length < 6) {
      toast({
        title: "Password Too Short",
        description: "Password must be at least 6 characters long.",
        variant: "destructive"
      });
      return;
    }
    
    try {
      setSaving(true);
      
      const success = await updateUserPassword(passwordForm.newPassword);
      
      if (success) {
        setPasswordForm({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
        toast({
          title: "Password Updated",
          description: "Your password has been updated successfully.",
        });
      }
      
    } catch (error) {
      console.error('Error updating password:', error);
      toast({
        title: "Error",
        description: "Failed to update password.",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const handleNotificationToggle = async (enabled: boolean) => {
    if (!user) return;
    
    try {
      const updatedSettings = await updateUserSettings(user.id, {
        notifications_enabled: enabled
      });
      
      if (updatedSettings) {
        setUserSettings(updatedSettings);
        toast({
          title: "Notifications Updated",
          description: `Notifications ${enabled ? 'enabled' : 'disabled'}.`,
        });
      }
      
    } catch (error) {
      console.error('Error updating notifications:', error);
      toast({
        title: "Error",
        description: "Failed to update notification settings.",
        variant: "destructive"
      });
    }
  };

  const handleLanguageChange = async (language: string) => {
    if (!user) return;
    
    try {
      setSelectedLanguage(language);
      setCurrentLanguage(language); // Update context
      
      const updatedSettings = await updateUserSettings(user.id, {
        language: language
      });
      
      if (updatedSettings) {
        setUserSettings(updatedSettings);
        toast({
          title: "Language Updated",
          description: `Language changed to ${getLanguageLabel(language)}.`,
        });
        
        // Dispatch custom event for language change
        window.dispatchEvent(new CustomEvent('languageChanged', { 
          detail: { language } 
        }));
      }
      
    } catch (error) {
      console.error('Error updating language:', error);
      toast({
        title: "Error",
        description: "Failed to update language preference.",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-amber-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-body">Loading settings...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen p-4 bg-gradient-soft flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Please Sign In</h1>
          <p className="text-muted-foreground">You need to be signed in to access settings.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-amber-50 overflow-hidden">
      {/* Hero Section */}
      <motion.div 
        className="relative overflow-hidden bg-gradient-to-br from-slate-50 via-white to-amber-50 py-20 settings-header"
        initial={{ opacity: 1, y: 0 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Animated Background */}
        <MorphingBackground />
        <FloatingParticles />
        
        <div className="container mx-auto px-4 relative z-10">
          <motion.div 
            className="text-center max-w-4xl mx-auto settings-header"
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
                <Shield className="h-4 w-4" />
              </motion.div>
              Personal Settings & Preferences
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
                Settings
              </motion.span>
            </motion.h1>
            
            {/* Animated subtitle */}
            <motion.p 
              className="text-xl md:text-2xl text-gray-600 mb-12 font-body leading-relaxed max-w-3xl mx-auto"
              initial={{ opacity: 1, y: 0 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              Customize your experience and manage your account preferences
            </motion.p>
          </motion.div>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-20 relative z-10">
        <div className="max-w-4xl mx-auto settings-content animate-fade-in-up" style={{ opacity: 1, transform: 'translateY(0)' }}>

          {/* --- ACCESSIBILITY SETTINGS (HIGHLIGHTED) --- */}
          <StaggeredCard index={0}>
            <Card className="mb-8 bg-white/80 backdrop-blur-sm shadow-xl border-0 overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100">
                <CardTitle className="flex items-center gap-3 font-heading text-xl">
                  <motion.div
                    className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center"
                    whileHover={{ rotate: 360, scale: 1.1 }}
                    transition={{ duration: 0.6 }}
                  >
                    <Contrast className="h-5 w-5 text-white" />
                  </motion.div>
                  Accessibility Hub
                </CardTitle>
                <CardDescription className="font-body text-gray-600">
                  Customize the app's appearance and behavior to suit your needs. Your comfort is our priority.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-8">
                <motion.div 
                  className="flex items-start space-x-4 p-4 rounded-xl bg-gradient-to-r from-red-50 to-pink-50 border border-red-100"
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.3 }}
                >
                  <motion.div
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.6 }}
                  >
                    <Contrast className="h-6 w-6 mt-1 text-red-600" />
                  </motion.div>
                  <div className="flex-1">
                    <Label htmlFor="high-contrast-mode" className="text-lg font-medium font-body text-gray-900">
                      High Contrast Mode
                    </Label>
                    <p className="text-sm text-gray-600 mt-1 font-body">
                      Increases text readability and reduces eye strain. Ideal for users with visual impairments.
                    </p>
                  </div>
                  <Switch
                    id="high-contrast-mode"
                    checked={highContrast}
                    onCheckedChange={toggleHighContrast}
                    className="data-[state=checked]:bg-red-600"
                  />
                </motion.div>

                <motion.div 
                  className="flex items-start space-x-4 p-4 rounded-xl bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-100"
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.3 }}
                >
                  <motion.div
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.6 }}
                  >
                    <BrainCircuit className="h-6 w-6 mt-1 text-purple-600" />
                  </motion.div>
                  <div className="flex-1">
                    <Label htmlFor="adhd-mode" className="text-lg font-medium font-body text-gray-900">
                      ADHD-Friendly Mode
                    </Label>
                    <p className="text-sm text-gray-600 mt-1 font-body">
                      Uses larger, simpler fonts to improve focus and make reading feel less overwhelming.
                    </p>
                  </div>
                  <Switch
                    id="adhd-mode"
                    checked={adhdMode}
                    onCheckedChange={toggleADHDMode}
                    className="data-[state=checked]:bg-purple-600"
                  />
                </motion.div>

                <motion.div 
                  className="flex items-start space-x-4 p-4 rounded-xl bg-gradient-to-r from-green-50 to-emerald-50 border border-green-100"
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.3 }}
                >
                  <motion.div
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.6 }}
                  >
                    <Mic className="h-6 w-6 mt-1 text-green-600" />
                  </motion.div>
                  <div className="flex-1">
                    <Label htmlFor="tts-mode" className="text-lg font-medium font-body text-gray-900">
                      Enable Text-to-Speech
                    </Label>
                    <p className="text-sm text-gray-600 mt-1 font-body">
                      Allows the app to read on-screen text aloud. Useful for users with visual impairments or reading difficulties.
                    </p>
                  </div>
                  <Switch
                    id="tts-mode"
                    checked={ttsEnabled}
                    onCheckedChange={toggleTTS}
                    className="data-[state=checked]:bg-green-600"
                  />
                </motion.div>
              </CardContent>
            </Card>
          </StaggeredCard>

          {/* --- ORIGINAL SETTINGS (RESTORED) --- */}
          <div className="space-y-8">
            {/* Profile Settings */}
            <StaggeredCard index={1}>
              <Card className="bg-white/80 backdrop-blur-sm shadow-xl border-0 overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-amber-50 to-orange-50 border-b border-amber-100">
                  <CardTitle className="flex items-center gap-3 font-heading text-xl">
                    <motion.div
                      className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center"
                      whileHover={{ rotate: 360, scale: 1.1 }}
                      transition={{ duration: 0.6 }}
                    >
                      <User className="h-5 w-5 text-white" />
                    </motion.div>
                    Profile Settings
                  </CardTitle>
                  <CardDescription className="font-body text-gray-600">
                    Update your personal information and account details.
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Label htmlFor="name" className="font-body text-gray-700">Full Name</Label>
                    <Input 
                      id="name" 
                      value={profileForm.full_name}
                      onChange={(e) => setProfileForm(prev => ({ ...prev, full_name: e.target.value }))}
                      placeholder="Enter your full name"
                      className="border-gray-300 focus:border-amber-500 focus:ring-amber-500 font-body"
                    />
                  </motion.div>
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Label htmlFor="email" className="font-body text-gray-700">Email</Label>
                    <Input 
                      id="email" 
                      type="email" 
                      value={profileForm.email}
                      disabled
                      className="bg-gray-100 border-gray-300 font-body"
                    />
                    <p className="text-xs text-gray-500 mt-1 font-body">
                      Email cannot be changed. Contact support if needed.
                    </p>
                  </motion.div>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button 
                      onClick={handleUpdateProfile}
                      disabled={saving}
                      className="magnetic-button w-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-body"
                    >
                      {saving ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Updating...
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4 mr-2" />
                          Update Profile
                        </>
                      )}
                    </Button>
                  </motion.div>
                </CardContent>
              </Card>
            </StaggeredCard>

            {/* Notification Settings */}
            <StaggeredCard index={2}>
              <Card className="bg-white/80 backdrop-blur-sm shadow-xl border-0 overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 border-b border-green-100">
                  <CardTitle className="flex items-center gap-3 font-heading text-xl">
                    <motion.div
                      className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center"
                      whileHover={{ rotate: 360, scale: 1.1 }}
                      transition={{ duration: 0.6 }}
                    >
                      <Bell className="h-5 w-5 text-white" />
                    </motion.div>
                    Notification Settings
                  </CardTitle>
                  <CardDescription className="font-body text-gray-600">
                    Manage your notification preferences and alerts.
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                  <motion.div 
                    className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-green-50 to-emerald-50 border border-green-100"
                    whileHover={{ scale: 1.02 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div>
                      <Label htmlFor="push-notifications" className="font-body text-gray-900">Push Notifications</Label>
                      <p className="text-sm text-gray-600 font-body">
                        Receive notifications for daily check-ins, goals, and achievements
                      </p>
                    </div>
                    <Switch 
                      id="push-notifications" 
                      checked={userSettings?.notifications_enabled ?? true}
                      onCheckedChange={handleNotificationToggle}
                      className="data-[state=checked]:bg-green-600"
                    />
                  </motion.div>
                  <motion.div 
                    className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100"
                    whileHover={{ scale: 1.02 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div>
                      <Label htmlFor="email-notifications" className="font-body text-gray-900">Email Notifications</Label>
                      <p className="text-sm text-gray-600 font-body">
                        Receive email updates about your progress and app features
                      </p>
                    </div>
                    <Switch 
                      id="email-notifications" 
                      checked={userSettings?.notifications_enabled ?? true}
                      onCheckedChange={handleNotificationToggle}
                      className="data-[state=checked]:bg-blue-600"
                    />
                  </motion.div>
                </CardContent>
              </Card>
            </StaggeredCard>

            {/* Language Settings */}
            <StaggeredCard index={3}>
              <Card className="bg-white/80 backdrop-blur-sm shadow-xl border-0 overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-purple-50 to-violet-50 border-b border-purple-100">
                  <CardTitle className="flex items-center gap-3 font-heading text-xl">
                    <motion.div
                      className="w-10 h-10 bg-gradient-to-br from-purple-500 to-violet-600 rounded-xl flex items-center justify-center"
                      whileHover={{ rotate: 360, scale: 1.1 }}
                      transition={{ duration: 0.6 }}
                    >
                      <Languages className="h-5 w-5 text-white" />
                    </motion.div>
                    Language & Region
                  </CardTitle>
                  <CardDescription className="font-body text-gray-600">
                    Choose your preferred language and regional settings for India.
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Label htmlFor="language-select" className="font-body text-gray-700 mb-3 block">
                      Preferred Language
                    </Label>
                    <Select value={selectedLanguage} onValueChange={handleLanguageChange}>
                      <SelectTrigger className="w-full border-gray-300 focus:border-purple-500 focus:ring-purple-500 font-body">
                        <SelectValue placeholder="Select your language" />
                      </SelectTrigger>
                      <SelectContent className="max-h-60">
                        {LANGUAGE_OPTIONS.map((language) => (
                          <SelectItem key={language.value} value={language.value} className="font-body">
                            <div className="flex items-center gap-3">
                              <span className="text-lg">{language.flag}</span>
                              <div className="flex flex-col">
                                <span className="font-medium">{language.label}</span>
                                <span className="text-sm text-gray-500">{language.native}</span>
                              </div>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-gray-500 mt-2 font-body">
                      This will change the language for the entire application interface.
                    </p>
                  </motion.div>

                  <motion.div 
                    className="p-4 rounded-xl bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-100"
                    whileHover={{ scale: 1.02 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <Globe className="h-5 w-5 text-indigo-600" />
                      <span className="font-medium text-gray-900 font-body">Regional Features</span>
                    </div>
                    <p className="text-sm text-gray-600 font-body">
                      Language selection includes regional formatting for dates, numbers, and cultural preferences.
                    </p>
                  </motion.div>
                </CardContent>
              </Card>
            </StaggeredCard>

            {/* Security Settings */}
            <StaggeredCard index={4}>
              <Card className="bg-white/80 backdrop-blur-sm shadow-xl border-0 overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-red-50 to-pink-50 border-b border-red-100">
                  <CardTitle className="flex items-center gap-3 font-heading text-xl">
                    <motion.div
                      className="w-10 h-10 bg-gradient-to-br from-red-500 to-pink-600 rounded-xl flex items-center justify-center"
                      whileHover={{ rotate: 360, scale: 1.1 }}
                      transition={{ duration: 0.6 }}
                    >
                      <Shield className="h-5 w-5 text-white" />
                    </motion.div>
                    Security Settings
                  </CardTitle>
                  <CardDescription className="font-body text-gray-600">
                    Manage your password and security preferences.
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
              <div>
                <Label htmlFor="current-password">Current Password</Label>
                <div className="relative">
                  <Input 
                    id="current-password"
                    type={showPasswords.current ? "text" : "password"}
                    value={passwordForm.currentPassword}
                    onChange={(e) => setPasswordForm(prev => ({ ...prev, currentPassword: e.target.value }))}
                    placeholder="Enter current password"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPasswords(prev => ({ ...prev, current: !prev.current }))}
                  >
                    {showPasswords.current ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
              <div>
                <Label htmlFor="new-password">New Password</Label>
                <div className="relative">
                  <Input 
                    id="new-password"
                    type={showPasswords.new ? "text" : "password"}
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                    placeholder="Enter new password"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPasswords(prev => ({ ...prev, new: !prev.new }))}
                  >
                    {showPasswords.new ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
              <div>
                <Label htmlFor="confirm-password">Confirm New Password</Label>
                <div className="relative">
                  <Input 
                    id="confirm-password"
                    type={showPasswords.confirm ? "text" : "password"}
                    value={passwordForm.confirmPassword}
                    onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    placeholder="Confirm new password"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPasswords(prev => ({ ...prev, confirm: !prev.confirm }))}
                  >
                    {showPasswords.confirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
              <Button 
                onClick={handleUpdatePassword}
                disabled={saving || !passwordForm.newPassword || !passwordForm.confirmPassword}
                className="w-full"
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Updating...
                  </>
                ) : (
                  <>
                    <Shield className="h-4 w-4 mr-2" />
                    Change Password
                  </>
                )}
              </Button>
                </CardContent>
              </Card>
            </StaggeredCard>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;