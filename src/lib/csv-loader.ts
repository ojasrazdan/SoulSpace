// CSV loader utility for chatbot dataset
import { ChatbotResponse } from './chatbot-data';

export interface CSVRow {
  prompt: string;
  completion: string;
}

export class CSVLoader {
  private static instance: CSVLoader;
  private data: ChatbotResponse[] = [];

  private constructor() {}

  static getInstance(): CSVLoader {
    if (!CSVLoader.instance) {
      CSVLoader.instance = new CSVLoader();
    }
    return CSVLoader.instance;
  }

  // Parse CSV content and convert to ChatbotResponse format
  parseCSVContent(csvContent: string): ChatbotResponse[] {
    const lines = csvContent.split('\n');
    const responses: ChatbotResponse[] = [];

    // Skip header row
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      try {
        const [prompt, completion] = this.parseCSVLine(line);
        if (prompt && completion) {
          const response: ChatbotResponse = {
            prompt: prompt.trim(),
            completion: completion.trim(),
            keywords: this.extractKeywords(prompt),
            category: this.categorizePrompt(prompt)
          };
          responses.push(response);
        }
      } catch (error) {
        console.warn(`Error parsing line ${i + 1}:`, error);
        continue;
      }
    }

    return responses;
  }

  private parseCSVLine(line: string): [string, string] {
    // Handle CSV parsing with proper quote handling
    const result: string[] = [];
    let current = '';
    let inQuotes = false;
    let i = 0;

    while (i < line.length) {
      const char = line[i];
      
      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          // Escaped quote
          current += '"';
          i += 2;
          continue;
        }
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        result.push(current);
        current = '';
      } else {
        current += char;
      }
      i++;
    }
    
    result.push(current);
    
    if (result.length < 2) {
      throw new Error('Invalid CSV line format');
    }
    
    return [result[0], result[1]];
  }

  private extractKeywords(text: string): string[] {
    const words = text.toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter(word => word.length > 2);
    
    // Add common mental health terms
    const mentalHealthTerms = [
      'depression', 'anxiety', 'stress', 'therapy', 'therapist', 'counselor',
      'relationship', 'boyfriend', 'girlfriend', 'partner', 'family', 'friend',
      'alone', 'lonely', 'sad', 'angry', 'frustrated', 'confused', 'scared',
      'suicidal', 'self', 'harm', 'help', 'support', 'feel', 'feeling'
    ];
    
    const keywords = words.filter(word => 
      mentalHealthTerms.some(term => 
        word.includes(term) || term.includes(word)
      )
    );
    
    return [...new Set(keywords)]; // Remove duplicates
  }

  private categorizePrompt(prompt: string): string {
    const lowerPrompt = prompt.toLowerCase();
    
    if (lowerPrompt.includes('depression') || lowerPrompt.includes('sad') || lowerPrompt.includes('down')) {
      return 'depression';
    }
    if (lowerPrompt.includes('anxiety') || lowerPrompt.includes('worry') || lowerPrompt.includes('panic')) {
      return 'anxiety';
    }
    if (lowerPrompt.includes('relationship') || lowerPrompt.includes('boyfriend') || lowerPrompt.includes('girlfriend')) {
      return 'relationship';
    }
    if (lowerPrompt.includes('therapy') || lowerPrompt.includes('therapist') || lowerPrompt.includes('counselor')) {
      return 'therapy';
    }
    if (lowerPrompt.includes('alone') || lowerPrompt.includes('lonely') || lowerPrompt.includes('isolated')) {
      return 'loneliness';
    }
    if (lowerPrompt.includes('suicidal') || lowerPrompt.includes('self harm') || lowerPrompt.includes('kill')) {
      return 'crisis';
    }
    
    return 'general';
  }

  // Load data from a file (for development)
  async loadFromFile(filePath: string): Promise<ChatbotResponse[]> {
    try {
      const response = await fetch(filePath);
      const csvContent = await response.text();
      this.data = this.parseCSVContent(csvContent);
      return this.data;
    } catch (error) {
      console.error('Error loading CSV file:', error);
      return [];
    }
  }

  // Load data from CSV content string
  loadFromContent(csvContent: string): ChatbotResponse[] {
    this.data = this.parseCSVContent(csvContent);
    return this.data;
  }

  getData(): ChatbotResponse[] {
    return this.data;
  }

  getStats() {
    const categories = this.data.reduce((acc, response) => {
      acc[response.category] = (acc[response.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalResponses: this.data.length,
      categories,
      averageKeywordsPerResponse: this.data.reduce((sum, r) => sum + r.keywords.length, 0) / this.data.length
    };
  }
}

export const csvLoader = CSVLoader.getInstance();
