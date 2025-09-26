import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { MessageCircle, Send, X } from "lucide-react";
import { chatbotMatcher } from "@/lib/chatbot-data";
import { loadChatbotDataset } from "@/lib/load-dataset";
import { motion, AnimatePresence } from "framer-motion";
import "./chatbot.css";

interface Message {
  sender: "user" | "bot";
  text: string;
}

interface ChatbotProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export const Chatbot = ({ isOpen: externalIsOpen, onClose }: ChatbotProps = {}) => {
  const [isOpen, setIsOpen] = useState(externalIsOpen || false);
  const [messages, setMessages] = useState<Message[]>([
    { sender: "bot", text: "Hello! I'm your SoulSpace assistant. How can I help you today?" },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load dataset on mount
  useEffect(() => {
    loadChatbotDataset().then(() => {
      console.log('Chatbot dataset loaded successfully');
    }).catch((error) => {
      console.error('Failed to load chatbot dataset:', error);
    });
  }, []);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // Sync external isOpen state
  useEffect(() => {
    if (externalIsOpen !== undefined) {
      setIsOpen(externalIsOpen);
    }
  }, [externalIsOpen]);

  const handleSendMessage = async () => {
    if (inputValue.trim() === "") return;

    const userMessage: Message = { sender: "user", text: inputValue };
    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsTyping(true);

    try {
      const botResponseText = await chatbotMatcher.getResponse(inputValue);
      
      setTimeout(() => {
        const botResponse: Message = {
          sender: "bot",
          text: botResponseText,
        };
        setMessages((prev) => [...prev, botResponse]);
        setIsTyping(false);
      }, 1000);
      
    } catch (error) {
      console.error('Error getting chatbot response:', error);
      setTimeout(() => {
        const botResponse: Message = {
          sender: "bot",
          text: "I'm sorry, I'm having trouble processing your message right now. Please try again.",
        };
        setMessages((prev) => [...prev, botResponse]);
        setIsTyping(false);
      }, 1000);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <>
      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{ 
              duration: 0.3, 
              ease: "easeOut",
              type: "spring",
              stiffness: 300,
              damping: 30
            }}
            className="fixed bottom-20 right-4 z-50"
          >
            <Card className="w-80 h-96 shadow-xl flex flex-col chatbot-window">
              <CardHeader className="flex flex-row items-center justify-between p-4 border-b">
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <CardTitle className="text-lg">SoulSpace AI</CardTitle>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => {
                      setIsOpen(false);
                      onClose?.();
                    }}
                    className="hover:bg-red-100 hover:text-red-600 transition-colors duration-200"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </motion.div>
              </CardHeader>
          
          <CardContent className="flex-1 p-4 overflow-y-auto chatbot-messages">
            <div className="space-y-4">
              <AnimatePresence>
                {messages.map((msg, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ 
                      duration: 0.3, 
                      delay: index * 0.1,
                      ease: "easeOut"
                    }}
                    className={`p-3 rounded-lg max-w-[80%] ${
                      msg.sender === "bot"
                        ? "bg-gray-100 text-gray-800 self-start"
                        : "bg-blue-500 text-white self-end ml-auto"
                    }`}
                  >
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.2 }}
                    >
                      {msg.text}
                    </motion.div>
                  </motion.div>
                ))}
                
                {isTyping && (
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.2 }}
                    className="p-3 rounded-lg max-w-[80%] bg-gray-100 self-start"
                  >
                    <div className="flex items-center space-x-2">
                      <motion.div 
                        className="w-2 h-2 bg-gray-400 rounded-full"
                        animate={{ y: [0, -8, 0] }}
                        transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
                      />
                      <motion.div 
                        className="w-2 h-2 bg-gray-400 rounded-full"
                        animate={{ y: [0, -8, 0] }}
                        transition={{ duration: 0.6, repeat: Infinity, delay: 0.1 }}
                      />
                      <motion.div 
                        className="w-2 h-2 bg-gray-400 rounded-full"
                        animate={{ y: [0, -8, 0] }}
                        transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              
              <div ref={messagesEndRef} />
            </div>
          </CardContent>
          
          <CardFooter className="p-4 border-t">
            <motion.div 
              className="flex w-full items-center space-x-2"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <motion.div 
                className="flex-1"
                whileFocus={{ scale: 1.02 }}
                transition={{ duration: 0.2 }}
              >
                <Input
                  placeholder="Type a message..."
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="flex-1 transition-all duration-200 focus:ring-2 focus:ring-blue-500"
                />
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                transition={{ duration: 0.2 }}
              >
                <Button 
                  onClick={handleSendMessage} 
                  disabled={!inputValue.trim()}
                  className="transition-all duration-200 disabled:opacity-50"
                >
                  <motion.div
                    animate={{ rotate: inputValue.trim() ? 0 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Send className="h-4 w-4" />
                  </motion.div>
                </Button>
              </motion.div>
            </motion.div>
          </CardFooter>
        </Card>
        </motion.div>
        )}
      </AnimatePresence>

      {/* Chat Button */}
      <motion.div
        className="fixed bottom-4 right-4 z-40"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        transition={{ duration: 0.2 }}
      >
        <motion.div
          animate={{ 
            rotate: isOpen ? 180 : 0,
            scale: isOpen ? 1.1 : 1
          }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
        >
          <Button
            className="rounded-full h-14 w-14 shadow-lg transition-all duration-300 hover:shadow-xl"
            onClick={() => {
              const newIsOpen = !isOpen;
              setIsOpen(newIsOpen);
              if (!newIsOpen) {
                onClose?.();
              }
            }}
          >
            <motion.div
              animate={{ 
                opacity: isOpen ? 0 : 1,
                scale: isOpen ? 0 : 1
              }}
              transition={{ duration: 0.2 }}
            >
              <MessageCircle className="h-6 w-6" />
            </motion.div>
            <motion.div
              className="absolute"
              animate={{ 
                opacity: isOpen ? 1 : 0,
                scale: isOpen ? 1 : 0
              }}
              transition={{ duration: 0.2 }}
            >
              <X className="h-6 w-6" />
            </motion.div>
          </Button>
        </motion.div>
      </motion.div>
    </>
  );
};