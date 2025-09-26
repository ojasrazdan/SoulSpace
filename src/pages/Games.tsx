import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Leaf, Droplet, Wind } from "lucide-react"; // Example icons
import { useAccessibility } from "@/hooks/AccessibilityContext";
import { useNavigate } from "react-router-dom";
import { useEffect, useRef } from "react";

const GAMES = [
  {
    id: "zen-garden",
    icon: Leaf,
    title: "Zen Garden",
    description: "For quiet meditation and calm.",
    tag: "#Relaxation",
    color: "text-secondary",
    bgColor: "bg-secondary/10"
  },
  {
    id: "focus-flow",
    icon: Droplet,
    title: "Focus Flow",
    description: "Guide a stream through obstacles with mindful attention.",
    tag: "#Focus",
    color: "text-primary",
    bgColor: "bg-primary/10"
  },
  {
    id: "breathing-orb",
    icon: Wind,
    title: "Breathing Orb",
    description: "Sync your breath with a calming visual guide.",
    tag: "#Breathing",
    color: "text-wellness",
    bgColor: "bg-wellness/10"
  },
];

const Games = () => {
  const { highContrast, adhdMode } = useAccessibility();
  const navigate = useNavigate();
  const headerRef = useRef<HTMLDivElement>(null);
  const gamesRef = useRef<HTMLDivElement>(null);

  // Simple CSS animations
  useEffect(() => {
    // Add entrance animation classes
    if (headerRef.current) {
      headerRef.current.classList.add('animate-fade-in-up');
    }
    if (gamesRef.current) {
      gamesRef.current.classList.add('animate-fade-in-up');
    }
  }, []);

  return (
    <div
      className={`min-h-screen p-4 ${
        highContrast ? "bg-black text-white" : "bg-gradient-soft"
      } ${adhdMode ? "text-lg font-sans" : ""}`}
    >
      <div className="container mx-auto max-w-4xl">
        <div ref={headerRef} className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2 font-heading">Mindful Activities</h1>
          <p className="text-muted-foreground font-body">
            Take a break to relax, refocus, and build resilience through play.
          </p>
        </div>

        <div ref={gamesRef} className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {GAMES.map((game) => (
            <Card
              key={game.title}
              className="shadow-card hover:shadow-wellness transition-smooth group"
            >
              <CardHeader>
                <div
                  className={`w-12 h-12 rounded-lg ${game.bgColor} flex items-center justify-center mb-4`}
                >
                  <game.icon className={`h-6 w-6 ${game.color}`} />
                </div>
                <CardTitle className="text-xl mb-2 font-heading">{game.title}</CardTitle>
                <CardDescription className="text-base font-body">
                  {game.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex justify-between items-center">
                <Button
                  variant="outline"
                  className="group-hover:bg-primary group-hover:text-primary-foreground transition-smooth font-body"
                  onClick={() => navigate(`/games/${game.id}`)}
                >
                  Play
                </Button>
                <Badge variant="outline" className="font-body">{game.tag}</Badge>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Games;