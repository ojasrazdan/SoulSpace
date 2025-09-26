// Chatbot dataset integration
export interface ChatbotResponse {
  prompt: string;
  completion: string;
  keywords: string[];
  category: string;
}

// Mental health keywords for better matching
const MENTAL_HEALTH_KEYWORDS = [
  'depression', 'anxiety', 'stress', 'sad', 'down', 'hopeless', 'worthless',
  'therapy', 'therapist', 'counselor', 'mental health', 'suicidal', 'self harm',
  'panic', 'worry', 'fear', 'nervous', 'overwhelmed', 'burnout', 'exhausted',
  'lonely', 'alone', 'isolated', 'empty', 'numb', 'lazy', 'unmotivated',
  'sleep', 'insomnia', 'appetite', 'concentration', 'memory', 'focus'
];

const RELATIONSHIP_KEYWORDS = [
  'boyfriend', 'girlfriend', 'partner', 'relationship', 'dating', 'breakup',
  'cheating', 'trust', 'jealous', 'paranoid', 'communication', 'fight',
  'argument', 'marriage', 'divorce', 'family', 'friend', 'social'
];

const EMOTIONAL_KEYWORDS = [
  'angry', 'mad', 'frustrated', 'irritated', 'upset', 'hurt', 'betrayed',
  'confused', 'lost', 'scared', 'afraid', 'guilty', 'shame', 'embarrassed',
  'proud', 'happy', 'excited', 'grateful', 'loved', 'supported'
];

// Sample responses from the dataset (we'll load the full dataset dynamically)
const SAMPLE_RESPONSES: ChatbotResponse[] = [
  {
    prompt: "I feel so alone. I have so many people around me, but it seems as they just listen and dont understand.",
    completion: "There could be many reasons why you feel alone, even though you have people around you. Perhaps you don't feel like you can really confide in anyone, or that people don't really understand you. It's possible that you feel like your friends and family are there for you in theory, but not in practice. Whatever the reason, it's important to reach out to someone you trust and talk about how you're feeling. Maybe there's something they can do to help, or maybe just talking about it will make you feel better.",
    keywords: ['alone', 'lonely', 'people', 'understand', 'friends', 'family'],
    category: 'loneliness'
  },
  {
    prompt: "I can't seem to feel any emotion except anxiety, not even for myself.",
    completion: "It is possible that you are experiencing symptoms of an anxiety disorder. Anxiety disorders are the most common type of mental illness, and they can make it difficult to cope with everyday life. Symptoms of anxiety can include feeling restless, irritable, and easily fatigued; having difficulty concentrating; and experiencing muscle tension and sleep disturbances. If you are experiencing these symptoms, it is important to talk to a mental health professional.",
    keywords: ['anxiety', 'emotion', 'anxiety disorder', 'mental illness', 'symptoms'],
    category: 'anxiety'
  },
  {
    prompt: "do i need a therapist",
    completion: "There is no one-size-fits-all answer to this question, as the need for a therapist depends on a variety of individual factors. However, if you are struggling with mental health issues or experiencing difficulty coping with life stressors, seeking professional help may be beneficial. A therapist can provide support and guidance as you work through your challenges, and can also offer coping and problem-solving strategies that can help you improve your overall well-being.",
    keywords: ['therapist', 'therapy', 'mental health', 'professional help', 'counselor'],
    category: 'therapy'
  }
];

// Fallback responses for when no match is found
const FALLBACK_RESPONSES = [
  "I understand you're going through a difficult time. While I may not have a specific response for your situation, I want you to know that your feelings are valid and important.",
  "Thank you for sharing with me. It takes courage to open up about your struggles. Have you considered speaking with a mental health professional who can provide more personalized support?",
  "I hear you, and I want you to know that you're not alone in this. Many people face similar challenges, and there are resources and people who want to help you through this.",
  "Your feelings matter, and it's okay to not have all the answers right now. Sometimes the most important step is reaching out, which you've already done by talking to me.",
  "I appreciate you trusting me with this. While I may not have the perfect response, I want you to know that seeking help and talking about your feelings is a sign of strength, not weakness."
];

// Emergency responses for crisis situations
const CRISIS_RESPONSES = [
  "I'm concerned about what you're sharing. If you're having thoughts of self-harm or suicide, please reach out to a crisis helpline immediately. In the US, you can call 988 for the Suicide & Crisis Lifeline.",
  "Your safety is the most important thing right now. If you're in immediate danger, please call emergency services (911) or go to your nearest emergency room.",
  "I want to make sure you're safe. Please consider reaching out to a trusted friend, family member, or mental health professional right away."
];

export class ChatbotResponseMatcher {
  private responses: ChatbotResponse[] = [];
  private isLoaded = false;

  constructor() {
    this.loadResponses();
  }

  private async loadResponses() {
    try {
      // In a real implementation, you would load the CSV data here
      // For now, we'll use the sample responses and add more as needed
      this.responses = SAMPLE_RESPONSES;
      this.isLoaded = true;
    } catch (error) {
      console.error('Error loading chatbot responses:', error);
      this.isLoaded = true; // Still allow the chatbot to work with fallbacks
    }
  }

  private extractKeywords(text: string): string[] {
    const words = text.toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter(word => word.length > 2);
    
    return words;
  }

  private calculateSimilarity(userInput: string, response: ChatbotResponse): number {
    const userKeywords = this.extractKeywords(userInput);
    const responseKeywords = response.keywords;
    
    // Calculate keyword overlap
    const commonKeywords = userKeywords.filter(keyword => 
      responseKeywords.some(rKeyword => 
        rKeyword.includes(keyword) || keyword.includes(rKeyword)
      )
    );
    
    // Calculate similarity score
    const keywordScore = (commonKeywords.length / Math.max(userKeywords.length, responseKeywords.length)) * 0.7;
    
    // Check for exact phrase matches
    const exactMatch = userInput.toLowerCase().includes(response.prompt.toLowerCase()) ||
                      response.prompt.toLowerCase().includes(userInput.toLowerCase());
    const exactScore = exactMatch ? 0.3 : 0;
    
    return keywordScore + exactScore;
  }

  private isCrisisSituation(userInput: string): boolean {
    const crisisKeywords = [
      'suicide', 'kill myself', 'end it all', 'not worth living',
      'self harm', 'cut myself', 'hurt myself', 'die', 'death'
    ];
    
    const lowerInput = userInput.toLowerCase();
    return crisisKeywords.some(keyword => lowerInput.includes(keyword));
  }

  private categorizeInput(userInput: string): string {
    const lowerInput = userInput.toLowerCase();
    
    if (MENTAL_HEALTH_KEYWORDS.some(keyword => lowerInput.includes(keyword))) {
      return 'mental_health';
    }
    if (RELATIONSHIP_KEYWORDS.some(keyword => lowerInput.includes(keyword))) {
      return 'relationship';
    }
    if (EMOTIONAL_KEYWORDS.some(keyword => lowerInput.includes(keyword))) {
      return 'emotional';
    }
    
    return 'general';
  }

  async getResponse(userInput: string): Promise<string> {
    if (!this.isLoaded) {
      await this.loadResponses();
    }

    // Check for crisis situations first
    if (this.isCrisisSituation(userInput)) {
      return CRISIS_RESPONSES[Math.floor(Math.random() * CRISIS_RESPONSES.length)];
    }

    // Find the best matching response
    let bestMatch: ChatbotResponse | null = null;
    let bestScore = 0;

    for (const response of this.responses) {
      const similarity = this.calculateSimilarity(userInput, response);
      if (similarity > bestScore) {
        bestScore = similarity;
        bestMatch = response;
      }
    }

    // If we have a good match (score > 0.3), return it
    if (bestMatch && bestScore > 0.3) {
      return bestMatch.completion;
    }

    // Otherwise, return a fallback response
    const category = this.categorizeInput(userInput);
    const fallbackIndex = Math.floor(Math.random() * FALLBACK_RESPONSES.length);
    return FALLBACK_RESPONSES[fallbackIndex];
  }

  // Method to add more responses (useful for loading from CSV)
  addResponse(response: ChatbotResponse) {
    this.responses.push(response);
  }

  // Method to get response statistics
  getStats() {
    return {
      totalResponses: this.responses.length,
      categories: [...new Set(this.responses.map(r => r.category))],
      isLoaded: this.isLoaded
    };
  }
}

// Export a singleton instance
export const chatbotMatcher = new ChatbotResponseMatcher();
