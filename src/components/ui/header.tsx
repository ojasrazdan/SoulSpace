import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Navigation from "@/components/ui/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Menu, Settings, LogOut } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAuth } from "@/hooks/useAuth";
import { getProfile, type Profile } from "@/lib/profiles";
import { signOut } from "@/lib/auth";
import { useEffect, useState } from "react";

const Header = () => {
  const isMobile = useIsMobile();
  const { user, isAuthenticated } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => {
    if (isAuthenticated && user) {
      getProfile(user.id).then(setProfile).catch(console.error);
    }
  }, [isAuthenticated, user?.id]);

  // Listen for avatar updates
  useEffect(() => {
    const handleAvatarUpdate = (event: CustomEvent) => {
      if (profile) {
        setProfile({ ...profile, avatar_url: event.detail.avatarUrl });
      }
    };

    window.addEventListener('avatarUpdated', handleAvatarUpdate as EventListener);
    return () => {
      window.removeEventListener('avatarUpdated', handleAvatarUpdate as EventListener);
    };
  }, [profile]);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <div className="mr-4 flex items-center">
          <Link to="/" className="mr-6 flex items-center space-x-2">
            <img src="/logo.png" alt="SoulSpace Logo" className="h-8 w-auto" />
          </Link>
          {!isMobile && <Navigation />}
        </div>
        <div className="flex flex-1 items-center justify-end space-x-2">
          {isMobile && (
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu />
                </Button>
              </SheetTrigger>
              <SheetContent side="left">
                <SheetHeader>
                  <SheetTitle>Menu</SheetTitle>
                </SheetHeader>
                <Navigation />
              </SheetContent>
            </Sheet>
          )}
          <Button variant="ghost" size="icon" asChild>
            <Link to="/settings">
              <Settings />
            </Link>
          </Button>
          {isAuthenticated ? (
            <>
              <Link to="/profile">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={profile?.avatar_url || undefined} alt="Profile" />
                  <AvatarFallback className="text-xs">
                    {profile?.first_name?.charAt(0) || 'U'}{profile?.last_name?.charAt(0) || ''}
                  </AvatarFallback>
                </Avatar>
              </Link>
              <Button variant="outline" size="sm" onClick={async () => { 
                await signOut(); 
                window.location.href = '/';
              }}>
                <LogOut className="mr-2 h-4 w-4" /> Sign out
              </Button>
            </>
          ) : (
            <Button asChild>
              <Link to="/auth">Sign in / Sign up</Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;