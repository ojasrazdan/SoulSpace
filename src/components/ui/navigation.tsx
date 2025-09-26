import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Heart, Brain, FileText, Calendar, Gamepad2, AlertTriangle, Target, Lock, Award, Users, Briefcase, MoreHorizontal, UserPlus
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useIsMobile } from "@/hooks/use-mobile"; // Corrected import

const mainNavItems = [
  { to: "/", icon: Heart, label: "Home" },
  { to: "/goals", icon: Target, label: "Goals" },
  { to: "/vault", icon: Lock, label: "Vault" },
  { to: "/games", icon: Gamepad2, label: "Games" },
  { to: "/community", icon: Users, label: "Community" },
  { to: "/student-companion", icon: UserPlus, label: "Companion" },
];

const moreNavItems = [
  { to: "/assessment", icon: Brain, label: "Assessment" },
  { to: "/rewards", icon: Award, label: "Rewards" },
  { to: "/consultation", icon: Briefcase, label: "Consult" },
  { to: "/resources", icon: FileText, label: "Resources" },
  { to: "/daily-checkin", icon: Calendar, label: "Daily Check-in" },
  { to: "/sos", icon: AlertTriangle, label: "SOS" },
];

const Navigation = ({ className }: { className?: string }) => {
  const location = useLocation();
  const isMobile = useIsMobile(); // Corrected function call

  const renderNavItem = (item: { to: string; icon: React.ElementType; label: string }) => {
    const isActive = location.pathname === item.to;
    return (
      <Button
        key={item.to}
        variant={isActive ? "default" : "ghost"}
        size="sm"
        asChild
        className={cn(
          "h-9 px-3 rounded-lg transition-smooth w-full justify-start",
          isActive
            ? "bg-primary text-primary-foreground shadow-gentle"
            : "hover:bg-accent hover:text-accent-foreground"
        )}
      >
        <Link to={item.to} className="flex items-center gap-2">
          <item.icon size={16} />
          <span>{item.label}</span>
        </Link>
      </Button>
    );
  };

  if (isMobile) {
    return (
      <nav className={cn("flex flex-col space-y-1 p-2", className)}>
        {mainNavItems.map(renderNavItem)}
        {moreNavItems.map(renderNavItem)}
      </nav>
    );
  }

  return (
    <nav className={cn("flex items-center space-x-1", className)}>
      {mainNavItems.map((item) => {
        const isActive = location.pathname === item.to;
        return (
          <Button
            key={item.to}
            variant={isActive ? "default" : "ghost"}
            size="sm"
            asChild
            className={cn(
              "h-9 px-3 rounded-lg transition-smooth",
              isActive
                ? "bg-primary text-primary-foreground shadow-gentle"
                : "hover:bg-accent hover:text-accent-foreground"
            )}
          >
            <Link to={item.to} className="flex items-center gap-2">
              <item.icon size={16} />
              <span className="hidden sm:inline">{item.label}</span>
            </Link>
          </Button>
        );
      })}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="h-9 px-3 rounded-lg">
            <MoreHorizontal size={16} />
            <span className="hidden sm:inline ml-2">More</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          {moreNavItems.map((item) => (
            <DropdownMenuItem key={item.to} asChild>
              <Link to={item.to} className="flex items-center gap-2">
                <item.icon size={16} />
                <span>{item.label}</span>
              </Link>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </nav>
  );
};

export default Navigation;