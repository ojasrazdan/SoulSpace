import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, RotateCcw, Volume2, VolumeX } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAccessibility } from "@/hooks/AccessibilityContext";

interface Stone {
  id: number;
  x: number;
  y: number;
  size: number;
  color: string;
}

interface RakePattern {
  x: number;
  y: number;
  angle: number;
  length: number;
}

const ZenGarden = () => {
  const navigate = useNavigate();
  const { highContrast, adhdMode } = useAccessibility();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [stones, setStones] = useState<Stone[]>([]);
  const [rakePatterns, setRakePatterns] = useState<RakePattern[]>([]);
  const [selectedTool, setSelectedTool] = useState<'rake' | 'stone'>('rake');
  const [stoneSize, setStoneSize] = useState(20);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [meditationTime, setMeditationTime] = useState(0);
  const [isMeditating, setIsMeditating] = useState(false);

  const stoneColors = ['#8B7355', '#A0522D', '#CD853F', '#D2B48C', '#F4A460'];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = 800;
    canvas.height = 600;

    // Draw garden background
    drawGarden(ctx);
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isMeditating) {
      interval = setInterval(() => {
        setMeditationTime(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isMeditating]);

  const drawGarden = (ctx: CanvasRenderingContext2D) => {
    // Sand background
    const gradient = ctx.createLinearGradient(0, 0, 0, 600);
    gradient.addColorStop(0, '#F5DEB3');
    gradient.addColorStop(1, '#DEB887');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 800, 600);

    // Garden border
    ctx.strokeStyle = '#8B4513';
    ctx.lineWidth = 4;
    ctx.strokeRect(10, 10, 780, 580);

    // Draw rake patterns
    ctx.strokeStyle = '#D2B48C';
    ctx.lineWidth = 2;
    rakePatterns.forEach(pattern => {
      ctx.save();
      ctx.translate(pattern.x, pattern.y);
      ctx.rotate(pattern.angle);
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(pattern.length, 0);
      ctx.stroke();
      ctx.restore();
    });

    // Draw stones
    stones.forEach(stone => {
      ctx.fillStyle = stone.color;
      ctx.beginPath();
      ctx.arc(stone.x, stone.y, stone.size, 0, Math.PI * 2);
      ctx.fill();
      
      // Stone highlight
      ctx.fillStyle = '#F5F5DC';
      ctx.beginPath();
      ctx.arc(stone.x - stone.size * 0.3, stone.y - stone.size * 0.3, stone.size * 0.3, 0, Math.PI * 2);
      ctx.fill();
    });
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (selectedTool === 'stone') {
      const newStone: Stone = {
        id: Date.now(),
        x,
        y,
        size: stoneSize,
        color: stoneColors[Math.floor(Math.random() * stoneColors.length)]
      };
      setStones(prev => [...prev, newStone]);
      if (soundEnabled) {
        // Play stone placement sound (you can add actual audio here)
        console.log('Stone placed');
      }
    } else {
      setIsDrawing(true);
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || selectedTool !== 'rake') return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const newPattern: RakePattern = {
      x,
      y,
      angle: Math.random() * Math.PI * 2,
      length: 30 + Math.random() * 20
    };

    setRakePatterns(prev => [...prev, newPattern]);
  };

  const handleMouseUp = () => {
    setIsDrawing(false);
  };

  const clearGarden = () => {
    setStones([]);
    setRakePatterns([]);
    setMeditationTime(0);
    setIsMeditating(false);
  };

  const startMeditation = () => {
    setIsMeditating(!isMeditating);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Redraw canvas when stones or patterns change
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    drawGarden(ctx);
  }, [stones, rakePatterns]);

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
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setSoundEnabled(!soundEnabled)}
            >
              {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
            </Button>
            <div className="text-center">
              <div className="text-2xl font-mono">{formatTime(meditationTime)}</div>
              <div className="text-sm text-muted-foreground">Meditation Time</div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-4 gap-6">
          {/* Tools Panel */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle>Zen Tools</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Tool Selection */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Tool</label>
                <div className="flex gap-2">
                  <Button
                    variant={selectedTool === 'rake' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedTool('rake')}
                    className="flex-1"
                  >
                    Rake
                  </Button>
                  <Button
                    variant={selectedTool === 'stone' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedTool('stone')}
                    className="flex-1"
                  >
                    Stone
                  </Button>
                </div>
              </div>

              {/* Stone Size */}
              {selectedTool === 'stone' && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Stone Size</label>
                  <input
                    type="range"
                    min="10"
                    max="40"
                    value={stoneSize}
                    onChange={(e) => setStoneSize(Number(e.target.value))}
                    className="w-full"
                  />
                  <div className="text-xs text-muted-foreground text-center">{stoneSize}px</div>
                </div>
              )}

              {/* Actions */}
              <div className="space-y-2">
                <Button
                  onClick={startMeditation}
                  variant={isMeditating ? "destructive" : "default"}
                  className="w-full"
                >
                  {isMeditating ? "Stop Meditation" : "Start Meditation"}
                </Button>
                <Button
                  onClick={clearGarden}
                  variant="outline"
                  className="w-full"
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Clear Garden
                </Button>
              </div>

              {/* Instructions */}
              <div className="text-xs text-muted-foreground space-y-1">
                <p><strong>Rake:</strong> Click and drag to create patterns</p>
                <p><strong>Stone:</strong> Click to place stones</p>
                <p><strong>Meditation:</strong> Focus on your breathing</p>
              </div>
            </CardContent>
          </Card>

          {/* Garden Canvas */}
          <div className="lg:col-span-3">
            <Card>
              <CardHeader>
                <CardTitle>Your Zen Garden</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex justify-center">
                  <canvas
                    ref={canvasRef}
                    className="border-2 border-sand-300 rounded-lg cursor-crosshair"
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseUp}
                    style={{ maxWidth: '100%', height: 'auto' }}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Meditation Guide */}
        {isMeditating && (
          <Card className="mt-6">
            <CardContent className="pt-6">
              <div className="text-center space-y-4">
                <h3 className="text-xl font-semibold">Meditation in Progress</h3>
                <div className="text-4xl">🧘‍♀️</div>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                  Focus on your breathing. Inhale slowly for 4 counts, hold for 4 counts, 
                  exhale for 4 counts. Let the garden be your anchor to the present moment.
                </p>
                <div className="flex justify-center gap-4 text-sm">
                  <span>Inhale (4s)</span>
                  <span>Hold (4s)</span>
                  <span>Exhale (4s)</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default ZenGarden;

