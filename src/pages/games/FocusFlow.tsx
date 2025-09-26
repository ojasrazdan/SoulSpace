import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, RotateCcw, Play, Pause } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAccessibility } from "@/hooks/AccessibilityContext";

interface Obstacle {
  id: number;
  x: number;
  y: number;
  width: number;
  height: number;
  type: 'rock' | 'branch' | 'log';
}

interface Stream {
  x: number;
  y: number;
  width: number;
  path: { x: number; y: number }[];
}

const FocusFlow = () => {
  const navigate = useNavigate();
  const { highContrast, adhdMode } = useAccessibility();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const [isPlaying, setIsPlaying] = useState(false);
  const [stream, setStream] = useState<Stream>({
    x: 50,
    y: 300,
    width: 20,
    path: [{ x: 50, y: 300 }]
  });
  const [obstacles, setObstacles] = useState<Obstacle[]>([]);
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [gameSpeed, setGameSpeed] = useState(2);
  const [isGameOver, setIsGameOver] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = 800;
    canvas.height = 600;

    generateObstacles();
    drawGame(ctx);
  }, []);

  useEffect(() => {
    if (isPlaying && !isGameOver) {
      const animate = () => {
        updateGame();
        const canvas = canvasRef.current;
        if (canvas) {
          const ctx = canvas.getContext('2d');
          if (ctx) drawGame(ctx);
        }
        animationRef.current = requestAnimationFrame(animate);
      };
      animationRef.current = requestAnimationFrame(animate);
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isPlaying, isGameOver]);

  const generateObstacles = () => {
    const newObstacles: Obstacle[] = [];
    const obstacleTypes: ('rock' | 'branch' | 'log')[] = ['rock', 'branch', 'log'];
    
    for (let i = 0; i < 8; i++) {
      newObstacles.push({
        id: i,
        x: 200 + Math.random() * 500,
        y: 100 + Math.random() * 400,
        width: 30 + Math.random() * 40,
        height: 30 + Math.random() * 40,
        type: obstacleTypes[Math.floor(Math.random() * obstacleTypes.length)]
      });
    }
    setObstacles(newObstacles);
  };

  const updateGame = () => {
    setStream(prev => {
      const newPath = [...prev.path];
      const lastPoint = newPath[newPath.length - 1];
      
      // Move stream forward
      const newX = lastPoint.x + gameSpeed;
      const newY = lastPoint.y + (Math.random() - 0.5) * 2; // Slight random movement
      
      // Check boundaries
      if (newX > 750) {
        setScore(prev => prev + 10);
        setLevel(prev => prev + 1);
        setGameSpeed(prev => Math.min(prev + 0.5, 5));
        return {
          x: 50,
          y: 300,
          width: 20,
          path: [{ x: 50, y: 300 }]
        };
      }
      
      if (newY < 50 || newY > 550) {
        setIsGameOver(true);
        setIsPlaying(false);
        return prev;
      }
      
      // Check collision with obstacles
      const colliding = obstacles.some(obstacle => 
        newX < obstacle.x + obstacle.width &&
        newX + prev.width > obstacle.x &&
        newY < obstacle.y + obstacle.height &&
        newY + prev.width > obstacle.y
      );
      
      if (colliding) {
        setIsGameOver(true);
        setIsPlaying(false);
        return prev;
      }
      
      newPath.push({ x: newX, y: newY });
      
      // Keep path length manageable
      if (newPath.length > 50) {
        newPath.shift();
      }
      
      return {
        ...prev,
        path: newPath
      };
    });
  };

  const drawGame = (ctx: CanvasRenderingContext2D) => {
    // Clear canvas
    ctx.clearRect(0, 0, 800, 600);
    
    // Background
    const gradient = ctx.createLinearGradient(0, 0, 0, 600);
    gradient.addColorStop(0, '#87CEEB');
    gradient.addColorStop(1, '#4682B4');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 800, 600);
    
    // Draw obstacles
    obstacles.forEach(obstacle => {
      ctx.fillStyle = obstacle.type === 'rock' ? '#696969' : 
                     obstacle.type === 'branch' ? '#8B4513' : '#A0522D';
      ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
      
      // Add some detail
      ctx.strokeStyle = '#000';
      ctx.lineWidth = 1;
      ctx.strokeRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
    });
    
    // Draw stream path
    if (stream.path.length > 1) {
      ctx.strokeStyle = '#4169E1';
      ctx.lineWidth = stream.width;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      
      ctx.beginPath();
      ctx.moveTo(stream.path[0].x, stream.path[0].y);
      for (let i = 1; i < stream.path.length; i++) {
        ctx.lineTo(stream.path[i].x, stream.path[i].y);
      }
      ctx.stroke();
      
      // Stream highlight
      ctx.strokeStyle = '#87CEEB';
      ctx.lineWidth = stream.width * 0.6;
      ctx.beginPath();
      ctx.moveTo(stream.path[0].x, stream.path[0].y);
      for (let i = 1; i < stream.path.length; i++) {
        ctx.lineTo(stream.path[i].x, stream.path[i].y);
      }
      ctx.stroke();
    }
    
    // Draw goal
    ctx.fillStyle = '#32CD32';
    ctx.fillRect(750, 250, 50, 100);
    ctx.fillStyle = '#228B22';
    ctx.fillRect(750, 250, 50, 50);
    
    // Goal text
    ctx.fillStyle = '#FFF';
    ctx.font = '16px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('GOAL', 775, 280);
  };

  const startGame = () => {
    setIsPlaying(true);
    setIsGameOver(false);
    setScore(0);
    setLevel(1);
    setGameSpeed(2);
    setStream({
      x: 50,
      y: 300,
      width: 20,
      path: [{ x: 50, y: 300 }]
    });
    generateObstacles();
  };

  const resetGame = () => {
    setIsPlaying(false);
    setIsGameOver(false);
    setScore(0);
    setLevel(1);
    setGameSpeed(2);
    setStream({
      x: 50,
      y: 300,
      width: 20,
      path: [{ x: 50, y: 300 }]
    });
    generateObstacles();
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isPlaying || isGameOver) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const y = e.clientY - rect.top;
    
    // Guide the stream with mouse movement
    setStream(prev => ({
      ...prev,
      y: Math.max(50, Math.min(550, y))
    }));
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
            <div className="text-center">
              <div className="text-2xl font-bold">Score: {score}</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-semibold">Level: {level}</div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-4 gap-6">
          {/* Controls Panel */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle>Focus Flow</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Button
                  onClick={isPlaying ? () => setIsPlaying(false) : startGame}
                  className="w-full"
                  disabled={isGameOver}
                >
                  {isPlaying ? (
                    <>
                      <Pause className="h-4 w-4 mr-2" />
                      Pause
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4 mr-2" />
                      {isGameOver ? 'Game Over' : 'Start'}
                    </>
                  )}
                </Button>
                <Button
                  onClick={resetGame}
                  variant="outline"
                  className="w-full"
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Reset
                </Button>
              </div>

              <div className="text-sm text-muted-foreground space-y-2">
                <p><strong>Objective:</strong> Guide the stream to the goal without hitting obstacles.</p>
                <p><strong>Controls:</strong> Move your mouse to guide the stream.</p>
                <p><strong>Focus:</strong> Stay calm and focused as the stream gets faster.</p>
              </div>

              {isGameOver && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-800">
                    Stream blocked! Take a deep breath and try again.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Game Canvas */}
          <div className="lg:col-span-3">
            <Card>
              <CardHeader>
                <CardTitle>Guide the Stream</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex justify-center">
                  <canvas
                    ref={canvasRef}
                    className="border-2 border-blue-300 rounded-lg cursor-crosshair"
                    onMouseMove={handleMouseMove}
                    style={{ maxWidth: '100%', height: 'auto' }}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Focus Tips */}
        <Card className="mt-6">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <h3 className="text-xl font-semibold">Focus & Mindfulness Tips</h3>
              <div className="grid md:grid-cols-3 gap-4 text-sm">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl mb-2">🎯</div>
                  <p><strong>Stay Present:</strong> Focus only on guiding the stream, not on the score.</p>
                </div>
                <div className="p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl mb-2">🌊</div>
                  <p><strong>Flow State:</strong> Let your movements be smooth and natural.</p>
                </div>
                <div className="p-4 bg-purple-50 rounded-lg">
                  <div className="text-2xl mb-2">🧘</div>
                  <p><strong>Breathe:</strong> Take deep breaths when you feel tense.</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default FocusFlow;

