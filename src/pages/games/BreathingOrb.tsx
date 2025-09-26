import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Play, Pause, RotateCcw, Volume2, VolumeX } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAccessibility } from "@/hooks/AccessibilityContext";

interface BreathingCycle {
  name: string;
  inhale: number;
  hold: number;
  exhale: number;
  pause: number;
  description: string;
}

const BREATHING_PATTERNS: BreathingCycle[] = [
  {
    name: "4-4-4-4",
    inhale: 4,
    hold: 4,
    exhale: 4,
    pause: 4,
    description: "Balanced breathing for relaxation"
  },
  {
    name: "4-7-8",
    inhale: 4,
    hold: 7,
    exhale: 8,
    pause: 0,
    description: "Calming technique for anxiety"
  },
  {
    name: "Box Breathing",
    inhale: 4,
    hold: 4,
    exhale: 4,
    pause: 4,
    description: "Military technique for focus"
  },
  {
    name: "Triangle",
    inhale: 4,
    hold: 4,
    exhale: 4,
    pause: 0,
    description: "Simple three-step pattern"
  }
];

const BreathingOrb = () => {
  const navigate = useNavigate();
  const { highContrast, adhdMode } = useAccessibility();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const audioContextRef = useRef<AudioContext | null>(null);
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedPattern, setSelectedPattern] = useState(0);
  const [currentPhase, setCurrentPhase] = useState<'inhale' | 'hold' | 'exhale' | 'pause'>('inhale');
  const [phaseProgress, setPhaseProgress] = useState(0);
  const [orbSize, setOrbSize] = useState(50);
  const [orbColor, setOrbColor] = useState('#4A90E2');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [sessionTime, setSessionTime] = useState(0);
  const [breathCount, setBreathCount] = useState(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = 600;
    canvas.height = 600;

    drawOrb(ctx);
  }, [orbSize, orbColor]);

  useEffect(() => {
    if (isPlaying) {
      const startTime = Date.now();
      const interval = setInterval(() => {
        setSessionTime(Math.floor((Date.now() - startTime) / 1000));
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [isPlaying]);

  useEffect(() => {
    if (isPlaying) {
      startBreathingCycle();
    } else {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isPlaying, selectedPattern]);

  const startBreathingCycle = () => {
    const pattern = BREATHING_PATTERNS[selectedPattern];
    let currentPhaseIndex = 0;
    const phases: ('inhale' | 'hold' | 'exhale' | 'pause')[] = ['inhale', 'hold', 'exhale', 'pause'];
    const durations = [pattern.inhale, pattern.hold, pattern.exhale, pattern.pause];
    
    let phaseStartTime = Date.now();
    let currentBreathCount = 0;

    const animate = () => {
      const now = Date.now();
      const elapsed = (now - phaseStartTime) / 1000;
      const currentDuration = durations[currentPhaseIndex];
      
      setPhaseProgress(elapsed / currentDuration);
      
      // Update orb size based on phase
      let targetSize = 50;
      switch (phases[currentPhaseIndex]) {
        case 'inhale':
          targetSize = 50 + (elapsed / currentDuration) * 100;
          break;
        case 'hold':
          targetSize = 150;
          break;
        case 'exhale':
          targetSize = 150 - (elapsed / currentDuration) * 100;
          break;
        case 'pause':
          targetSize = 50;
          break;
      }
      setOrbSize(targetSize);
      
      // Update orb color based on phase
      const colors = {
        inhale: '#4A90E2',
        hold: '#7B68EE',
        exhale: '#20B2AA',
        pause: '#32CD32'
      };
      setOrbColor(colors[phases[currentPhaseIndex]]);
      
      setCurrentPhase(phases[currentPhaseIndex]);
      
      if (elapsed >= currentDuration) {
        phaseStartTime = now;
        currentPhaseIndex = (currentPhaseIndex + 1) % phases.length;
        
        if (currentPhaseIndex === 0) {
          currentBreathCount++;
          setBreathCount(currentBreathCount);
        }
      }
      
      // Play sound if enabled
      if (soundEnabled && elapsed < 0.1) {
        playPhaseSound(phases[currentPhaseIndex]);
      }
      
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) drawOrb(ctx);
      }
      
      if (isPlaying) {
        animationRef.current = requestAnimationFrame(animate);
      }
    };
    
    animationRef.current = requestAnimationFrame(animate);
  };

  const playPhaseSound = (phase: string) => {
    if (!soundEnabled) return;
    
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      
      const audioContext = audioContextRef.current;
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      let frequency = 200;
      switch (phase) {
        case 'inhale':
          frequency = 300;
          break;
        case 'hold':
          frequency = 400;
          break;
        case 'exhale':
          frequency = 250;
          break;
        case 'pause':
          frequency = 150;
          break;
      }
      
      oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.5);
    } catch (error) {
      console.log('Audio not available');
    }
  };

  const drawOrb = (ctx: CanvasRenderingContext2D) => {
    ctx.clearRect(0, 0, 600, 600);
    
    // Background gradient
    const gradient = ctx.createRadialGradient(300, 300, 0, 300, 300, 300);
    gradient.addColorStop(0, '#1a1a2e');
    gradient.addColorStop(1, '#16213e');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 600, 600);
    
    // Orb
    const orbGradient = ctx.createRadialGradient(
      300 - orbSize * 0.3, 300 - orbSize * 0.3, 0,
      300, 300, orbSize
    );
    orbGradient.addColorStop(0, orbColor);
    orbGradient.addColorStop(0.7, orbColor + '80');
    orbGradient.addColorStop(1, orbColor + '20');
    
    ctx.fillStyle = orbGradient;
    ctx.beginPath();
    ctx.arc(300, 300, orbSize, 0, Math.PI * 2);
    ctx.fill();
    
    // Orb highlight
    ctx.fillStyle = '#FFFFFF40';
    ctx.beginPath();
    ctx.arc(300 - orbSize * 0.3, 300 - orbSize * 0.3, orbSize * 0.3, 0, Math.PI * 2);
    ctx.fill();
    
    // Breathing rings
    for (let i = 0; i < 3; i++) {
      const ringSize = orbSize + (i + 1) * 20;
      const alpha = 0.3 - i * 0.1;
      ctx.strokeStyle = orbColor + Math.floor(alpha * 255).toString(16).padStart(2, '0');
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(300, 300, ringSize, 0, Math.PI * 2);
      ctx.stroke();
    }
  };

  const startSession = () => {
    setIsPlaying(true);
    setSessionTime(0);
    setBreathCount(0);
  };

  const stopSession = () => {
    setIsPlaying(false);
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
  };

  const resetSession = () => {
    stopSession();
    setSessionTime(0);
    setBreathCount(0);
    setPhaseProgress(0);
    setOrbSize(50);
    setOrbColor('#4A90E2');
    setCurrentPhase('inhale');
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className={`min-h-screen p-4 ${
      highContrast ? "bg-black text-white" : "bg-gradient-soft"
    } ${adhdMode ? "text-lg font-sans" : ""}`}>
      <div className="container mx-auto max-w-6xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Button
            variant="outline"
            onClick={() => navigate('/games')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Games
          </Button>
          <div className="flex items-center gap-6">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setSoundEnabled(!soundEnabled)}
            >
              {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
            </Button>
            <div className="text-center">
              <div className="text-2xl font-mono">{formatTime(sessionTime)}</div>
              <div className="text-sm text-muted-foreground">Session Time</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{breathCount}</div>
              <div className="text-sm text-muted-foreground">Breaths</div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-4 gap-6">
          {/* Controls Panel */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle>Breathing Patterns</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Pattern Selection */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Choose Pattern</label>
                <div className="space-y-2">
                  {BREATHING_PATTERNS.map((pattern, index) => (
                    <Button
                      key={index}
                      variant={selectedPattern === index ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedPattern(index)}
                      className="w-full text-left justify-start"
                      disabled={isPlaying}
                    >
                      <div>
                        <div className="font-medium">{pattern.name}</div>
                        <div className="text-xs opacity-70">{pattern.description}</div>
                      </div>
                    </Button>
                  ))}
                </div>
              </div>

              {/* Current Pattern Info */}
              <div className="p-3 bg-muted rounded-lg">
                <div className="text-sm font-medium mb-2">Current Pattern</div>
                <div className="text-xs space-y-1">
                  <div>Inhale: {BREATHING_PATTERNS[selectedPattern].inhale}s</div>
                  <div>Hold: {BREATHING_PATTERNS[selectedPattern].hold}s</div>
                  <div>Exhale: {BREATHING_PATTERNS[selectedPattern].exhale}s</div>
                  {BREATHING_PATTERNS[selectedPattern].pause > 0 && (
                    <div>Pause: {BREATHING_PATTERNS[selectedPattern].pause}s</div>
                  )}
                </div>
              </div>

              {/* Controls */}
              <div className="space-y-2">
                <Button
                  onClick={isPlaying ? stopSession : startSession}
                  className="w-full"
                >
                  {isPlaying ? (
                    <>
                      <Pause className="h-4 w-4 mr-2" />
                      Pause Session
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4 mr-2" />
                      Start Session
                    </>
                  )}
                </Button>
                <Button
                  onClick={resetSession}
                  variant="outline"
                  className="w-full"
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Reset
                </Button>
              </div>

              {/* Current Phase */}
              {isPlaying && (
                <div className="p-3 bg-primary/10 rounded-lg">
                  <div className="text-sm font-medium mb-2">Current Phase</div>
                  <div className="text-lg capitalize">{currentPhase}</div>
                  <div className="w-full bg-muted rounded-full h-2 mt-2">
                    <div 
                      className="bg-primary h-2 rounded-full transition-all duration-100"
                      style={{ width: `${phaseProgress * 100}%` }}
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Breathing Orb */}
          <div className="lg:col-span-3">
            <Card>
              <CardHeader>
                <CardTitle>Breathing Orb</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex justify-center">
                  <canvas
                    ref={canvasRef}
                    className="border-2 border-blue-300 rounded-lg"
                    style={{ maxWidth: '100%', height: 'auto' }}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Breathing Guide */}
        <Card className="mt-6">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <h3 className="text-xl font-semibold">Breathing Guide</h3>
              <div className="grid md:grid-cols-4 gap-4 text-sm">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl mb-2">💨</div>
                  <p><strong>Inhale:</strong> Breathe in slowly through your nose</p>
                </div>
                <div className="p-4 bg-purple-50 rounded-lg">
                  <div className="text-2xl mb-2">⏸️</div>
                  <p><strong>Hold:</strong> Keep the breath gently in your lungs</p>
                </div>
                <div className="p-4 bg-teal-50 rounded-lg">
                  <div className="text-2xl mb-2">🌬️</div>
                  <p><strong>Exhale:</strong> Release the breath slowly through your mouth</p>
                </div>
                <div className="p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl mb-2">😌</div>
                  <p><strong>Pause:</strong> Rest before the next breath cycle</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default BreathingOrb;

