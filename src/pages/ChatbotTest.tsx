// Test page for chatbot integration
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { chatbotMatcher } from "@/lib/chatbot-data";
import { loadChatbotDataset, testChatbot } from "@/lib/load-dataset";

export const ChatbotTest = () => {
  const [testQuery, setTestQuery] = useState("");
  const [response, setResponse] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [datasetLoaded, setDatasetLoaded] = useState(false);

  useEffect(() => {
    // Load the dataset when the component mounts
    loadChatbotDataset().then(() => {
      setDatasetLoaded(true);
      console.log('Dataset loaded for testing');
    });
  }, []);

  const handleTestQuery = async () => {
    if (!testQuery.trim()) return;
    
    setIsLoading(true);
    try {
      const botResponse = await chatbotMatcher.getResponse(testQuery);
      setResponse(botResponse);
    } catch (error) {
      setResponse("Error getting response: " + error);
    } finally {
      setIsLoading(false);
    }
  };

  const runFullTest = async () => {
    setIsLoading(true);
    try {
      await testChatbot();
      setResponse("Full test completed! Check console for results.");
    } catch (error) {
      setResponse("Test failed: " + error);
    } finally {
      setIsLoading(false);
    }
  };

  const sampleQueries = [
    "I feel so alone and depressed",
    "My boyfriend and I are having problems",
    "I need help with my anxiety",
    "Should I see a therapist?",
    "I'm having suicidal thoughts"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center">
              🤖 Chatbot Integration Test
            </CardTitle>
            <div className="text-center">
              <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm ${
                datasetLoaded 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-yellow-100 text-yellow-800'
              }`}>
                {datasetLoaded ? '✅ Dataset Loaded' : '⏳ Loading Dataset...'}
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Test Query Input */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Test Individual Query</h3>
              <div className="flex space-x-2">
                <Input
                  placeholder="Enter a test query..."
                  value={testQuery}
                  onChange={(e) => setTestQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleTestQuery()}
                  disabled={isLoading}
                />
                <Button 
                  onClick={handleTestQuery} 
                  disabled={isLoading || !datasetLoaded}
                >
                  {isLoading ? 'Testing...' : 'Test Query'}
                </Button>
              </div>
            </div>

            {/* Sample Queries */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Sample Queries</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {sampleQueries.map((query, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    onClick={() => setTestQuery(query)}
                    className="text-left justify-start h-auto p-3"
                  >
                    <span className="text-sm">{query}</span>
                  </Button>
                ))}
              </div>
            </div>

            {/* Response Display */}
            {response && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Response</h3>
                <Card className="bg-gray-50">
                  <CardContent className="p-4">
                    <p className="whitespace-pre-wrap">{response}</p>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Full Test Button */}
            <div className="text-center">
              <Button 
                onClick={runFullTest} 
                disabled={isLoading || !datasetLoaded}
                variant="secondary"
                size="lg"
              >
                {isLoading ? 'Running Full Test...' : 'Run Full Test Suite'}
              </Button>
            </div>

            {/* Instructions */}
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-semibold text-blue-900 mb-2">How to Test:</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Enter a mental health related query in the input field</li>
                <li>• Click "Test Query" to see the chatbot's response</li>
                <li>• Try the sample queries to test different scenarios</li>
                <li>• Click "Run Full Test Suite" to test multiple queries at once</li>
                <li>• Check the browser console for detailed logs</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
