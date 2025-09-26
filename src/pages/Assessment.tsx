import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Brain, ArrowLeft, ArrowRight, CheckCircle, TrendingUp, Calendar, BarChart3, Sparkles, Heart, Shield } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAccessibility } from "../hooks/AccessibilityContext";
import { saveAssessment, getAssessmentHistory, type AssessmentResult, type AssessmentHistory } from "@/lib/assessments";
import { awardQuizCompletionXP } from "@/lib/rewards";

const PHQ9_QUESTIONS = [
  "Little interest or pleasure in doing things",
  "Feeling down, depressed, or hopeless",
  "Trouble falling or staying asleep, or sleeping too much",
  "Feeling tired or having little energy",
  "Poor appetite or overeating",
  "Feeling bad about yourself or that you are a failure",
  "Trouble concentrating on things",
  "Moving or speaking slowly or being restless",
  "Thoughts that you would be better off dead"
];

const GAD7_QUESTIONS = [
  "Feeling nervous, anxious, or on edge",
  "Not being able to stop or control worrying",
  "Worrying too much about different things",
  "Trouble relaxing",
  "Being so restless that it's hard to sit still",
  "Becoming easily annoyed or irritable",
  "Feeling afraid as if something awful might happen"
];

const RESPONSE_OPTIONS = [
  { value: "0", label: "Not at all", emoji: "😊", color: "text-green-600", bgColor: "bg-green-50 hover:bg-green-100" },
  { value: "1", label: "Several days", emoji: "😐", color: "text-yellow-600", bgColor: "bg-yellow-50 hover:bg-yellow-100" },
  { value: "2", label: "More than half the days", emoji: "😔", color: "text-orange-600", bgColor: "bg-orange-50 hover:bg-orange-100" },
  { value: "3", label: "Nearly every day", emoji: "😢", color: "text-red-600", bgColor: "bg-red-50 hover:bg-red-100" }
];

const ENCOURAGING_MESSAGES = [
  "You're doing great! 🌟",
  "Keep going, you're almost there! 💪",
  "Every step counts! 🎯",
  "You're taking care of yourself! ❤️",
  "Progress, not perfection! ✨",
  "You're stronger than you know! 🌈"
];

const Assessment = () => {
  const { ttsEnabled, speakText, highContrast, adhdMode } = useAccessibility();
  const containerRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);
  const questionRef = useRef<HTMLDivElement>(null);

  const [currentQuiz, setCurrentQuiz] = useState<"select" | "phq9" | "gad7" | "results" | "history">("select");
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [responses, setResponses] = useState<Record<number, string>>({});
  const [assessmentHistory, setAssessmentHistory] = useState<AssessmentHistory[]>([]);
  const [currentResult, setCurrentResult] = useState<AssessmentResult | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // Load assessment history on component mount
  useEffect(() => {
    loadAssessmentHistory();
  }, []);

  // Speak content when page or question changes
  useEffect(() => {
    if (ttsEnabled && containerRef.current) {
      speakText(containerRef.current.textContent || "");
    }
  }, [ttsEnabled, currentQuiz, currentQuestion, speakText]);

  // Simple CSS animations
  useEffect(() => {
    // Add entrance animation classes
    if (currentQuiz === "select") {
      if (headerRef.current) {
        headerRef.current.classList.add('animate-fade-in-up');
      }
      if (cardsRef.current) {
        cardsRef.current.classList.add('animate-fade-in-up');
      }
    } else if (currentQuiz === "phq9" || currentQuiz === "gad7") {
      if (questionRef.current) {
        questionRef.current.classList.add('animate-fade-in-up');
      }
    } else if (currentQuiz === "results") {
      if (questionRef.current) {
        questionRef.current.classList.add('animate-fade-in-up');
      }
    }
  }, [currentQuiz, currentQuestion]);

  const loadAssessmentHistory = async () => {
    try {
      const history = await getAssessmentHistory();
      setAssessmentHistory(history);
    } catch (error) {
      console.error('Failed to load assessment history:', error);
    }
  };

  const getCurrentQuestions = () => currentQuiz === "phq9" ? PHQ9_QUESTIONS : GAD7_QUESTIONS;

  const handleResponse = (value: string) => {
    setResponses(prev => ({ ...prev, [currentQuestion]: value }));
  };

  const handleNext = () => {
    const questions = getCurrentQuestions();
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    } else {
      calculateResults();
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) setCurrentQuestion(prev => prev - 1);
  };

  const calculateResults = async () => {
    setLoading(true);
    try {
      const total = Object.values(responses).reduce((sum, val) => sum + parseInt(val), 0);
      const quizType = currentQuiz === "phq9" ? "phq9" : "gad7";
      
      let severity = "";
      let recommendations = "";

      if (currentQuiz === "phq9") {
        if (total <= 4) {
          severity = "Minimal";
          recommendations = "Great job maintaining your mental health! Continue with daily check-ins and self-care.";
        } else if (total <= 9) {
          severity = "Mild";
          recommendations = "Consider exploring our breathing exercises and wellness resources to support your mood.";
        } else if (total <= 14) {
          severity = "Moderate";
          recommendations = "Daily check-ins and professional support could be beneficial. Visit our SOS page for immediate resources.";
        } else if (total <= 19) {
          severity = "Moderately Severe";
          recommendations = "Professional support is recommended. Please reach out to campus counseling services.";
        } else {
          severity = "Severe";
          recommendations = "Please seek immediate professional help. Visit our SOS page or contact emergency services if needed.";
        }
      } else {
        if (total <= 4) {
          severity = "Minimal";
          recommendations = "Your anxiety levels appear manageable. Keep up with regular wellness activities!";
        } else if (total <= 9) {
          severity = "Mild";
          recommendations = "Try our breathing exercises and stress management resources to help manage anxiety.";
        } else if (total <= 14) {
          severity = "Moderate";
          recommendations = "Consider professional support and explore our anxiety management resources.";
        } else {
          severity = "Severe";
          recommendations = "Professional support is strongly recommended. Please contact campus counseling services.";
        }
      }

      // Save to database
      const result = await saveAssessment(quizType, total, severity, responses, recommendations);
      setCurrentResult(result);
      
      // Award XP for quiz completion
      await awardQuizCompletionXP(result.id, quizType);
      
      // Refresh history
      await loadAssessmentHistory();

      // Show success toast
      toast({
        title: "Assessment Complete! 🎉",
        description: "Your results have been saved. You earned 75 XP and 15 Calm Points! Check out your detailed results below.",
        duration: 5000,
      });

      // Navigate to results
      setCurrentQuiz("results");
    } catch (error) {
      console.error('Failed to save assessment:', error);
      toast({
        title: "Error",
        description: "Failed to save your assessment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const progress = currentQuiz !== "select" 
    ? ((currentQuestion + 1) / getCurrentQuestions().length) * 100 
    : 0;

  const containerClasses = `min-h-screen p-4 ${highContrast ? "bg-black text-white" : "bg-gradient-soft text-foreground"} ${adhdMode ? "text-lg font-sans" : ""}`;

  if (currentQuiz === "select") {
    return (
      <div ref={containerRef} className={containerClasses}>
        <div className="container mx-auto max-w-4xl">
        <div ref={headerRef} className="text-center mb-8">
          <Brain className="mx-auto h-16 w-16 text-primary mb-4 animate-pulse" />
          <h1 className="text-3xl font-bold mb-2 font-heading">Mental Health Assessment</h1>
          <p className="text-muted-foreground font-body">
            Take a confidential assessment to better understand your mental health
          </p>
        </div>

          {/* Assessment History */}
          {assessmentHistory.length > 0 && (
            <Card className="mb-6 shadow-card">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Your Assessment History
                  </CardTitle>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setCurrentQuiz("history")}
                  >
                    View All
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  {assessmentHistory.slice(0, 4).map((assessment) => (
                    <div key={assessment.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-primary"></div>
                        <div>
                          <p className="font-medium">{assessment.category.toUpperCase()}</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(assessment.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <Badge variant={assessment.severity === 'Minimal' ? 'default' : 'secondary'}>
                        {assessment.severity}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          <div ref={cardsRef} className="grid md:grid-cols-2 gap-6">
            <Card className="shadow-card hover:shadow-wellness transition-all duration-300 cursor-pointer group hover:scale-105" 
                  onClick={() => setCurrentQuiz("phq9")}>
              <CardHeader>
                <CardTitle className="text-primary flex items-center gap-2 font-heading">
                  <Heart className="h-5 w-5" />
                  PHQ-9 Depression Assessment
                </CardTitle>
                <CardDescription className="font-body">
                  A 9-question screening tool to assess depression symptoms over the past 2 weeks
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full bg-primary hover:bg-primary-dark group-hover:shadow-lg transition-all font-body">
                  <Sparkles className="h-4 w-4 mr-2" />
                  Start PHQ-9 Assessment
                </Button>
              </CardContent>
            </Card>

            <Card className="shadow-card hover:shadow-wellness transition-all duration-300 cursor-pointer group hover:scale-105"
                  onClick={() => setCurrentQuiz("gad7")}>
              <CardHeader>
                <CardTitle className="text-secondary flex items-center gap-2 font-heading">
                  <Shield className="h-5 w-5" />
                  GAD-7 Anxiety Assessment
                </CardTitle>
                <CardDescription className="font-body">
                  A 7-question screening tool to assess anxiety symptoms over the past 2 weeks
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full bg-secondary hover:bg-secondary-dark group-hover:shadow-lg transition-all font-body">
                  <Sparkles className="h-4 w-4 mr-2" />
                  Start GAD-7 Assessment
                </Button>
              </CardContent>
            </Card>
          </div>

          <Card className="mt-8 shadow-card">
            <CardHeader>
              <CardTitle className="text-center flex items-center justify-center gap-2">
                <Shield className="h-5 w-5" />
                Privacy & Confidentiality
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-muted-foreground">
                Your responses are completely anonymous and stored securely. 
                This assessment is for informational purposes and not a substitute for professional diagnosis.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Results page
  if (currentQuiz === "results" && currentResult) {
    const getSeverityColor = (severity: string) => {
      switch (severity) {
        case 'Minimal': return 'text-green-600 bg-green-50';
        case 'Mild': return 'text-yellow-600 bg-yellow-50';
        case 'Moderate': return 'text-orange-600 bg-orange-50';
        case 'Moderately Severe': return 'text-red-600 bg-red-50';
        case 'Severe': return 'text-red-700 bg-red-100';
        default: return 'text-gray-600 bg-gray-50';
      }
    };

    return (
      <div ref={containerRef} className={containerClasses}>
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-8">
            <CheckCircle className="mx-auto h-16 w-16 text-green-600 mb-4" />
            <h1 className="text-3xl font-bold mb-2">Assessment Complete! 🎉</h1>
            <p className="text-muted-foreground">
              Your results have been saved and are ready to view
            </p>
          </div>

          <Card className="shadow-card mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Your Results
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <p className="text-2xl font-bold text-primary">{currentResult.score}</p>
                  <p className="text-sm text-muted-foreground">Total Score</p>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <Badge className={`${getSeverityColor(currentResult.severity)}`}>
                    {currentResult.severity}
                  </Badge>
                  <p className="text-sm text-muted-foreground mt-2">Severity Level</p>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <p className="text-2xl font-bold text-primary">{currentResult.category.toUpperCase()}</p>
                  <p className="text-sm text-muted-foreground">Assessment Type</p>
                </div>
              </div>

              <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
                <h3 className="font-semibold mb-2">Recommendations</h3>
                <p className="text-muted-foreground">{currentResult.recommendations}</p>
              </div>

              <div className="flex gap-4">
                <Button 
                  onClick={() => setCurrentQuiz("select")}
                  className="flex-1"
                >
                  Take Another Assessment
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => setCurrentQuiz("history")}
                  className="flex-1"
                >
                  View History
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // History page
  if (currentQuiz === "history") {
    return (
      <div ref={containerRef} className={containerClasses}>
        <div className="container mx-auto max-w-4xl">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold mb-2">Assessment History</h1>
              <p className="text-muted-foreground">
                Track your mental health journey over time
              </p>
            </div>
            <Button 
              variant="outline"
              onClick={() => setCurrentQuiz("select")}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Assessments
            </Button>
          </div>

          {assessmentHistory.length === 0 ? (
            <Card className="shadow-card">
              <CardContent className="text-center py-12">
                <Calendar className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Assessments Yet</h3>
                <p className="text-muted-foreground mb-4">
                  Take your first assessment to start tracking your mental health journey
                </p>
                <Button onClick={() => setCurrentQuiz("select")}>
                  Take Assessment
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {assessmentHistory.map((assessment) => (
                <Card key={assessment.id} className="shadow-card">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                          <BarChart3 className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold">{assessment.category.toUpperCase()}</h3>
                          <p className="text-sm text-muted-foreground">
                            {new Date(assessment.created_at).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-primary">{assessment.score}</p>
                        <Badge variant={assessment.severity === 'Minimal' ? 'default' : 'secondary'}>
                          {assessment.severity}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  const questions = getCurrentQuestions();
  const currentQuestionText = questions[currentQuestion];

  return (
    <div ref={containerRef} className={containerClasses}>
      <div className="container mx-auto max-w-2xl">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold">
              {currentQuiz === "phq9" ? "PHQ-9 Depression Assessment" : "GAD-7 Anxiety Assessment"}
            </h1>
            <Button 
              variant="outline" 
              onClick={() => {
                setCurrentQuiz("select");
                setCurrentQuestion(0);
                setResponses({});
              }}
            >
              Exit Assessment
            </Button>
          </div>
          <Progress value={progress} className="h-2" />
          <p className="text-sm text-muted-foreground mt-2">
            Question {currentQuestion + 1} of {questions.length}
          </p>
        </div>

        <Card ref={questionRef} className="shadow-card">
          <CardHeader>
            <CardTitle className="text-lg font-heading">
              Over the last 2 weeks, how often have you been bothered by...
            </CardTitle>
            <CardDescription className="text-base font-medium font-body">
              {currentQuestionText}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RadioGroup 
              value={responses[currentQuestion] || ""} 
              onValueChange={handleResponse}
              className="space-y-3"
            >
              {RESPONSE_OPTIONS.map((option) => (
                <div 
                  key={option.value} 
                  className={`flex items-center space-x-3 p-4 rounded-lg border-2 transition-all duration-200 cursor-pointer ${
                    responses[currentQuestion] === option.value 
                      ? `${option.bgColor} border-primary shadow-md` 
                      : 'border-transparent hover:border-muted-foreground/20'
                  }`}
                  onClick={() => handleResponse(option.value)}
                >
                  <RadioGroupItem value={option.value} id={option.value} />
                  <Label htmlFor={option.value} className="flex-1 cursor-pointer flex items-center gap-3">
                    <span className="text-2xl">{option.emoji}</span>
                    <span className={option.color}>{option.label}</span>
                  </Label>
                </div>
              ))}
            </RadioGroup>

            {/* Encouraging message */}
            {responses[currentQuestion] && (
              <div className="mt-4 p-3 bg-primary/10 rounded-lg border border-primary/20">
                <p className="text-sm text-primary font-medium text-center">
                  {ENCOURAGING_MESSAGES[currentQuestion % ENCOURAGING_MESSAGES.length]}
                </p>
              </div>
            )}

            <div className="flex justify-between mt-8">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={currentQuestion === 0}
              >
                <ArrowLeft size={16} className="mr-2" />
                Previous
              </Button>
              
              <Button
                onClick={handleNext}
                disabled={!responses[currentQuestion] || loading}
                className="bg-primary hover:bg-primary-dark"
              >
                {loading ? (
                  "Saving..."
                ) : currentQuestion === questions.length - 1 ? (
                  <>
                    <CheckCircle size={16} className="mr-2" />
                    Complete Assessment
                  </>
                ) : (
                  <>
                    Next
                    <ArrowRight size={16} className="ml-2" />
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Assessment;
