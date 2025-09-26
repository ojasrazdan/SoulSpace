// src/pages/DisabilityCheck.tsx
import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useAccessibility } from "@/hooks/AccessibilityContext";
import { useToast } from "@/hooks/use-toast";
import { Headphones, Zap, Eye } from "lucide-react";

const DisabilityCheck = () => {
  const { 
    ttsEnabled, toggleTTS, 
    adhdMode, toggleADHDMode, 
    highContrast, toggleHighContrast 
  } = useAccessibility();
  const { toast } = useToast();

  const handleToggle = (name: string, enabled: boolean) => {
    toast({
      title: `${name} ${enabled ? "Enabled" : "Disabled"}`,
      description: `You have ${enabled ? "turned on" : "turned off"} ${name}.`,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-soft p-4">
      <div className="container mx-auto max-w-4xl">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold mb-2">Accessibility & Disability Check</h1>
          <p className="text-muted-foreground">
            Enable features to improve your experience based on your needs
          </p>
        </div>

        <div className="space-y-6">
          {/* Text-to-Speech */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Headphones className="h-5 w-5" />
                Text-to-Speech
              </CardTitle>
              <CardDescription>
                Enable voice guidance and audio feedback throughout the app
              </CardDescription>
            </CardHeader>
            <CardContent className="flex items-center justify-between">
              <Label htmlFor="tts" className="flex-1">
                Text-to-Speech
                <span className="block text-sm text-muted-foreground">
                  Hear content read aloud for better accessibility
                </span>
              </Label>
              <Switch
                id="tts"
                checked={ttsEnabled}
                onCheckedChange={(val) => {
                  toggleTTS();
                  handleToggle("Text-to-Speech", val);
                }}
              />
            </CardContent>
          </Card>

          {/* ADHD Mode */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                ADHD Mode
              </CardTitle>
              <CardDescription>
                Simplified UI, reduced distractions, and guided focus features
              </CardDescription>
            </CardHeader>
            <CardContent className="flex items-center justify-between">
              <Label htmlFor="adhdMode" className="flex-1">
                ADHD Mode
                <span className="block text-sm text-muted-foreground">
                  Reduce cognitive load and improve focus
                </span>
              </Label>
              <Switch
                id="adhdMode"
                checked={adhdMode}
                onCheckedChange={(val) => {
                  toggleADHDMode();
                  handleToggle("ADHD Mode", val);
                }}
              />
            </CardContent>
          </Card>

          {/* High Contrast */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                High Contrast Mode
              </CardTitle>
              <CardDescription>
                Improve readability with high contrast colors
              </CardDescription>
            </CardHeader>
            <CardContent className="flex items-center justify-between">
              <Label htmlFor="highContrast" className="flex-1">
                High Contrast
                <span className="block text-sm text-muted-foreground">
                  Enhance visibility for better reading
                </span>
              </Label>
              <Switch
                id="highContrast"
                checked={highContrast}
                onCheckedChange={(val) => {
                  toggleHighContrast();
                  handleToggle("High Contrast", val);
                }}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DisabilityCheck;
