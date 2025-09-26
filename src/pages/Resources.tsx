import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Play, Pause, RotateCcw, Heart, Brain, Leaf } from "lucide-react";
import { useAccessibility } from "../hooks/AccessibilityContext"; // ✅ accessibility context

const ARTICLES = [
  {
    id: 1,
    title: "Understanding Anxiety: A Student's Guide",
    category: "Anxiety",
    summary: "Learn about anxiety symptoms, triggers, and coping strategies specifically for college students.",
    readTime: "5 min read",
    content: "Anxiety is a normal response to stress, but when it becomes overwhelming, it can interfere with daily life and academic performance..."
  },
  {
    id: 2,
    title: "Managing Depression in College",
    category: "Depression", 
    summary: "Recognize signs of depression and discover effective ways to seek help and support.",
    readTime: "7 min read",
    content: "Depression affects millions of college students. Understanding the signs and knowing where to turn for help is crucial..."
  },
  {
    id: 3,
    title: "ADHD and Academic Success",
    category: "ADHD",
    summary: "Strategies for students with ADHD to improve focus, organization, and academic performance.",
    readTime: "6 min read", 
    content: "ADHD can present unique challenges in college, but with the right strategies and support, students can thrive..."
  },
  {
    id: 4,
    title: "Stress Management Techniques",
    category: "Stress",
    summary: "Evidence-based techniques to manage academic and personal stress effectively.",
    readTime: "4 min read",
    content: "Stress is inevitable in college, but how you manage it makes all the difference. Here are proven techniques..."
  }
];

const BREATHING_EXERCISES = [
  {
    id: 1,
    name: "4-7-8 Breathing",
    description: "A calming technique to reduce anxiety and promote relaxation",
    duration: 240, // 4 minutes
    instructions: [
      "Inhale quietly through your nose for 4 counts",
      "Hold your breath for 7 counts", 
      "Exhale completely through your mouth for 8 counts",
      "Repeat this cycle 4 times"
    ]
  },
  {
    id: 2,
    name: "Box Breathing",
    description: "A simple technique used by Navy SEALs to stay calm under pressure",
    duration: 300, // 5 minutes
    instructions: [
      "Inhale for 4 counts",
      "Hold for 4 counts",
      "Exhale for 4 counts", 
      "Hold empty for 4 counts",
      "Repeat this pattern"
    ]
  },
  {
    id: 3,
    name: "Progressive Relaxation",
    description: "Release tension by focusing on different muscle groups",
    duration: 600, // 10 minutes
    instructions: [
      "Start with your toes, tense for 5 seconds then relax",
      "Move up to your calves, thighs, abdomen",
      "Continue with arms, shoulders, neck, and face",
      "Focus on the contrast between tension and relaxation"
    ]
  }
];

const Resources = () => {
  const [selectedArticle, setSelectedArticle] = useState<number | null>(null);
  const [activeExercise, setActiveExercise] = useState<number | null>(null);
  const [exerciseTime, setExerciseTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  
  const { ttsEnabled } = useAccessibility();

  const speakText = (text: string) => {
    if (ttsEnabled && "speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(utterance);
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'anxiety': return <Heart className="h-4 w-4" />;
      case 'depression': return <Brain className="h-4 w-4" />;
      case 'adhd': return <Brain className="h-4 w-4" />;
      case 'stress': return <Leaf className="h-4 w-4" />;
      default: return <BookOpen className="h-4 w-4" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case 'anxiety': return 'bg-primary text-primary-foreground';
      case 'depression': return 'bg-secondary text-secondary-foreground';
      case 'adhd': return 'bg-wellness text-wellness-foreground';
      case 'stress': return 'bg-warning text-warning-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Timer logic
  useEffect(() => {
    if (isPlaying && activeExercise !== null) {
      intervalRef.current = setInterval(() => {
        setExerciseTime(prev => {
          const exercise = BREATHING_EXERCISES.find(ex => ex.id === activeExercise);
          if (exercise && prev >= exercise.duration) {
            setIsPlaying(false);
            setActiveExercise(null);
            speakText("Exercise completed");
            return 0;
          }
          return prev + 1;
        });
      }, 1000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isPlaying, activeExercise]);

  const startExercise = (exerciseId: number) => {
    setActiveExercise(exerciseId);
    setIsPlaying(true);
    setExerciseTime(0);
    const exercise = BREATHING_EXERCISES.find(ex => ex.id === exerciseId);
    if (exercise) speakText(`Starting ${exercise.name}`);
  };

  const pauseExercise = () => {
    setIsPlaying(false);
    speakText("Exercise paused");
  };

  const resetExercise = () => {
    setIsPlaying(false);
    setExerciseTime(0);
    setActiveExercise(null);
    speakText("Exercise reset");
  };

  // Render selected article
  if (selectedArticle) {
    const article = ARTICLES.find(a => a.id === selectedArticle);
    if (!article) return null;

    return (
      <div className="min-h-screen bg-gradient-soft p-4">
        <div className="container mx-auto max-w-4xl">
          <div className="mb-6">
            <Button 
              variant="outline" 
              onClick={() => setSelectedArticle(null)}
              className="mb-4"
            >
              ← Back to Resources
            </Button>
            <h1 className="text-3xl font-bold mb-2">{article.title}</h1>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <Badge className={getCategoryColor(article.category)}>
                {getCategoryIcon(article.category)}
                <span className="ml-1">{article.category}</span>
              </Badge>
              <span>{article.readTime}</span>
            </div>
          </div>

          <Card className="shadow-card">
            <CardContent className="prose prose-sm max-w-none p-6">
              <p className="text-lg text-muted-foreground mb-6">{article.summary}</p>
              <div className="space-y-4 text-foreground">
                {article.content}
                <p>
                  This is a sample of the article content. In a real implementation, 
                  this would contain the full article with proper formatting, 
                  images, and comprehensive information about {article.category.toLowerCase()}.
                </p>
                <p>
                  Remember that seeking professional help is always recommended 
                  when dealing with mental health concerns. Your campus counseling 
                  center is a great resource for additional support.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Main resources page
  return (
    <div className="min-h-screen bg-gradient-soft p-4">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Mental Health Resources</h1>
          <p className="text-muted-foreground">
            Evidence-based articles and exercises to support your wellbeing
          </p>
        </div>

        <Tabs defaultValue="articles" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="articles">Support Articles</TabsTrigger>
            <TabsTrigger value="exercises">Breathing Exercises</TabsTrigger>
          </TabsList>

          {/* Articles */}
          <TabsContent value="articles">
            <div className="grid md:grid-cols-2 gap-6">
              {ARTICLES.map(article => (
                <Card
                  key={article.id}
                  className="shadow-card hover:shadow-wellness transition-smooth cursor-pointer"
                  onClick={() => {
                    setSelectedArticle(article.id);
                    speakText(`Opening article ${article.title}`);
                  }}
                >
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{article.title}</CardTitle>
                      <Badge className={getCategoryColor(article.category)}>
                        {getCategoryIcon(article.category)}
                        <span className="ml-1">{article.category}</span>
                      </Badge>
                    </div>
                    <CardDescription>{article.summary}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">{article.readTime}</span>
                      <Button variant="outline" size="sm">Read Article</Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Breathing Exercises */}
          <TabsContent value="exercises">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {BREATHING_EXERCISES.map(exercise => (
                <Card key={exercise.id} className="shadow-card">
                  <CardHeader>
                    <CardTitle className="text-lg">{exercise.name}</CardTitle>
                    <CardDescription>{exercise.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="text-center">
                        <div className="text-3xl font-mono">
                          {activeExercise === exercise.id 
                            ? formatTime(exercise.duration - exerciseTime)
                            : formatTime(exercise.duration)
                          }
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {activeExercise === exercise.id 
                            ? `${formatTime(exerciseTime)} / ${formatTime(exercise.duration)}`
                            : `Duration: ${formatTime(exercise.duration)}`
                          }
                        </div>
                      </div>

                      <div className="flex justify-center gap-2">
                        {activeExercise === exercise.id ? (
                          <>
                            <Button
                              size="sm"
                              variant={isPlaying ? "default" : "outline"}
                              onClick={isPlaying ? pauseExercise : () => { setIsPlaying(true); speakText("Exercise resumed"); }}
                              aria-label={isPlaying ? "Pause exercise" : "Resume exercise"}
                            >
                              {isPlaying ? <Pause size={16} /> : <Play size={16} />}
                            </Button>
                            <Button size="sm" variant="outline" onClick={resetExercise} aria-label="Reset exercise">
                              <RotateCcw size={16} />
                            </Button>
                          </>
                        ) : (
                          <Button
                            size="sm"
                            onClick={() => startExercise(exercise.id)}
                            className="bg-secondary hover:bg-secondary-dark"
                            aria-label={`Start ${exercise.name}`}
                          >
                            <Play size={16} className="mr-2" />
                            Start
                          </Button>
                        )}
                      </div>

                      <div className="space-y-2">
                        <h4 className="font-medium">Instructions:</h4>
                        <ul className="text-sm space-y-1">
                          {exercise.instructions.map((instruction, idx) => (
                            <li key={idx} className="flex items-start">
                              <span className="text-primary mr-2">{idx + 1}.</span>
                              {instruction}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Resources;
