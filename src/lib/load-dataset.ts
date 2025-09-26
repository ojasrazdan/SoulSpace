// Script to load the CSV dataset into the chatbot system
import { csvLoader } from './csv-loader';
import { chatbotMatcher } from './chatbot-data';

// Function to load the dataset from the CSV file
export async function loadChatbotDataset(): Promise<void> {
  try {
    console.log('Loading chatbot dataset...');
    
    // Load the CSV data
    const responses = await csvLoader.loadFromFile('/reddit_text-davinci-002.csv');
    
    if (responses.length === 0) {
      console.warn('No responses loaded from CSV file');
      return;
    }
    
    // Add all responses to the chatbot matcher
    responses.forEach(response => {
      chatbotMatcher.addResponse(response);
    });
    
    // Log statistics
    const stats = csvLoader.getStats();
    console.log('Dataset loaded successfully!');
    console.log('Total responses:', stats.totalResponses);
    console.log('Categories:', stats.categories);
    console.log('Average keywords per response:', stats.averageKeywordsPerResponse.toFixed(2));
    
  } catch (error) {
    console.error('Error loading chatbot dataset:', error);
  }
}

// Function to load dataset from CSV content (for direct integration)
export function loadDatasetFromContent(csvContent: string): void {
  try {
    console.log('Loading chatbot dataset from content...');
    
    // Parse the CSV content
    const responses = csvLoader.loadFromContent(csvContent);
    
    if (responses.length === 0) {
      console.warn('No responses loaded from CSV content');
      return;
    }
    
    // Add all responses to the chatbot matcher
    responses.forEach(response => {
      chatbotMatcher.addResponse(response);
    });
    
    // Log statistics
    const stats = csvLoader.getStats();
    console.log('Dataset loaded successfully!');
    console.log('Total responses:', stats.totalResponses);
    console.log('Categories:', stats.categories);
    console.log('Average keywords per response:', stats.averageKeywordsPerResponse.toFixed(2));
    
  } catch (error) {
    console.error('Error loading chatbot dataset from content:', error);
  }
}

// Function to get a sample of responses for testing
export function getSampleResponses(count: number = 5) {
  const data = csvLoader.getData();
  return data.slice(0, count);
}

// Function to test the chatbot with sample queries
export async function testChatbot() {
  const testQueries = [
    "I feel so alone and depressed",
    "My boyfriend and I are having problems",
    "I need help with my anxiety",
    "Should I see a therapist?",
    "I'm having suicidal thoughts"
  ];
  
  console.log('Testing chatbot with sample queries...');
  
  for (const query of testQueries) {
    try {
      const response = await chatbotMatcher.getResponse(query);
      console.log(`Query: "${query}"`);
      console.log(`Response: "${response.substring(0, 100)}..."`);
      console.log('---');
    } catch (error) {
      console.error(`Error testing query "${query}":`, error);
    }
  }
}
