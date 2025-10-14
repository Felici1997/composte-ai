import React, { useState, useRef, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Send, 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  MapPin, 
  Bot,
  User,
  Lightbulb,
  Leaf,
  Bug,
  TrendingUp,
  Calendar,
  Cloud,
  Droplets
} from 'lucide-react';
import { openAIService } from '@/services/openai';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';
import { LanguageToggle } from '@/components/LanguageToggle';
import { LocationSelector } from '@/components/LocationSelector';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  type?: 'text' | 'weather' | 'crop_recommendation' | 'disease_advice' | 'general_advice';
}

interface QuickAction {
  key: string;
  icon: React.ReactNode;
  action: string;
  color: string;
}

const AIAssistant = () => {
  const { t, language } = useLanguage();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: language === 'hi' 
        ? 'नमस्कार किसान भाई! 🙏\n\nमैं आपका अपना खेती का डॉक्टर हूं। जैसे गांव में पुराने अनुभवी किसान सलाह देते हैं, वैसे ही मैं आपकी मदद करूंगा।\n\n🌱 **मैं आपकी कैसे मदद कर सकता हूं:**\n• कौन सी फसल लगाएं जो अच्छा मुनाफा दे\n• पत्ते पीले हों या कोई बीमारी हो तो क्या करें\n• बारिश-धूप के हिसाब से क्या काम करें\n• मंडी में क्या भाव चल रहा है\n• खाद-बीज कब और कितना डालें\n\n**बस आराम से अपनी भाषा में पूछिए, जैसे गांव में बात करते हैं!** 😊' 
        : 'Namaste Farmer Friend! 🙏\n\nI am your personal farming doctor. Just like experienced farmers in the village give advice, I will help you in the same way.\n\n🌱 **How can I help you:**\n• Which crops to plant for good profit\n• What to do if leaves turn yellow or any disease occurs\n• What work to do according to rain and sun\n• What are the current market prices\n• When and how much fertilizer and seeds to use\n\n**Just ask comfortably in your language, like we talk in the village!** 😊',
      sender: 'ai',
      timestamp: new Date(),
      type: 'text'
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [speechEnabled, setSpeechEnabled] = useState(true);
  const [location, setLocation] = useState('');
  const [showLocationSelector, setShowLocationSelector] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Quick action buttons for farmers
  const quickActions: QuickAction[] = [
    {
      key: 'crop',
      icon: <Leaf className="w-4 h-4" />,
      action: language === 'hi' 
        ? 'मेरी जमीन में कौन सी फसल लगाऊं जो ज्यादा मुनाफा दे?'
        : 'Which crop should I plant in my land for maximum profit?',
      color: 'bg-green-500'
    },
    {
      key: 'disease',
      icon: <Bug className="w-4 h-4" />,
      action: language === 'hi'
        ? 'मेरे पौधे के पत्ते पीले हो गए हैं, क्या दवा दूं?'
        : 'My plant leaves turned yellow, what medicine should I give?',
      color: 'bg-red-500'
    },
    {
      key: 'weather',
      icon: <Droplets className="w-4 h-4" />,
      action: language === 'hi'
        ? 'बारिश आने वाली है, क्या तैयारी करूं?'
        : 'Rain is coming, what preparation should I do?',
      color: 'bg-blue-500'
    },
    {
      key: 'market',
      icon: <TrendingUp className="w-4 h-4" />,
      action: language === 'hi'
        ? 'आज मंडी में क्या रेट है? कब बेचूं?'
        : 'What is today\'s market rate? When should I sell?',
      color: 'bg-purple-500'
    },
    {
      key: 'fertilizer',
      icon: <Lightbulb className="w-4 h-4" />,
      action: language === 'hi'
        ? 'मेरी फसल में कौन सा खाद और कितना डालूं?'
        : 'Which fertilizer and how much should I use for my crop?',
      color: 'bg-orange-500'
    },
    {
      key: 'seasonal',
      icon: <Calendar className="w-4 h-4" />,
      action: language === 'hi'
        ? 'अभी कौन सा मौसम है? क्या काम करूं?'
        : 'What season is it now? What work should I do?',
      color: 'bg-teal-500'
    }
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Update welcome message when language changes
  useEffect(() => {
    setMessages(prev => [{
      id: '1',
      text: language === 'hi' 
        ? 'नमस्कार किसान भाई! 🙏\n\nमैं आपका अपना खेती का डॉक्टर हूं। जैसे गांव में पुराने अनुभवी किसान सलाह देते हैं, वैसे ही मैं आपकी मदद करूंगा।\n\n🌱 **मैं आपकी कैसे मदद कर सकता हूं:**\n• कौन सी फसल लगाएं जो अच्छा मुनाफा दे\n• पत्ते पीले हों या कोई बीमारी हो तो क्या करें\n• बारिश-धूप के हिसाब से क्या काम करें\n• मंडी में क्या भाव चल रहा है\n• खाद-बीज कब और कितना डालें\n\n**बस आराम से अपनी भाषा में पूछिए, जैसे गांव में बात करते हैं!** 😊' 
        : 'Namaste Farmer Friend! 🙏\n\nI am your personal farming doctor. Just like experienced farmers in the village give advice, I will help you in the same way.\n\n🌱 **How can I help you:**\n• Which crops to plant for good profit\n• What to do if leaves turn yellow or any disease occurs\n• What work to do according to rain and sun\n• What are the current market prices\n• When and how much fertilizer and seeds to use\n\n**Just ask comfortably in your language, like we talk in the village!** 😊',
      sender: 'ai',
      timestamp: new Date(),
      type: 'text'
    }, ...prev.slice(1)]);
  }, [language]);

  // Speech Recognition (Voice Input)
  const startListening = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      toast({
        title: 'Voice not supported',
        description: 'Your browser does not support voice input',
        variant: 'destructive'
      });
      return;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.lang = language === 'hi' ? 'hi-IN' : 'en-US';
    recognition.interimResults = false;
    recognition.continuous = false;

    recognition.onstart = () => {
      setIsListening(true);
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInputText(transcript);
      setIsListening(false);
    };

    recognition.onerror = () => {
      setIsListening(false);
      toast({
        title: 'Voice input error',
        description: 'Could not recognize speech. Please try again.',
        variant: 'destructive'
      });
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  // Text-to-Speech (Voice Output)
  const speakText = (text: string) => {
    if (!speechEnabled || !('speechSynthesis' in window)) return;

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = language === 'hi' ? 'hi-IN' : 'en-US';
    utterance.rate = 0.8;
    utterance.pitch = 1;
    
    window.speechSynthesis.speak(utterance);
  };

  const handleSendMessage = async (messageText?: string) => {
    const textToSend = messageText || inputText.trim();
    if (!textToSend) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: textToSend,
      sender: 'user',
      timestamp: new Date(),
      type: 'text'
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsTyping(true);

    try {
      // Determine the type of query and call appropriate service
      let response = '';
      const queryLower = textToSend.toLowerCase();
      
      if (queryLower.includes('crop') || queryLower.includes('recommend') || queryLower.includes('फसल')) {
        response = await openAIService.generateCropRecommendation(
          'mixed',
          'current',
          location || 'India',
          50000
        );
      } else if (queryLower.includes('disease') || queryLower.includes('बीमारी') || queryLower.includes('पत्ते') || queryLower.includes('leaf')) {
        response = await openAIService.generatePlantDiseaseAdvice(
          'Unknown disease',
          'General crop',
          'moderate',
          ['yellowing leaves', 'पत्ते पीले']
        );
      } else if (queryLower.includes('weather') || queryLower.includes('मौसम') || queryLower.includes('rain')) {
        const mockWeather = {
          temp: 28,
          humidity: 65,
          description: 'partly cloudy',
          windSpeed: 15
        };
        response = await openAIService.generateWeatherBasedAdvice(
          mockWeather,
          location || 'India',
          ['wheat', 'rice']
        );
      } else {
        response = await openAIService.generateFarmingAdvice(textToSend, location);
      }

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: response,
        sender: 'ai',
        timestamp: new Date(),
        type: 'text'
      };

      setMessages(prev => [...prev, aiMessage]);
      
      // Speak the AI response if speech is enabled
      if (speechEnabled) {
        speakText(response);
      }
      
    } catch (error) {
      console.error('Error getting AI response:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: language === 'hi'
          ? 'माफ करें, मुझे कुछ तकनीकी समस्या हो रही है। कृपया दोबारा कोशिश करें।'
          : 'Sorry, I am having technical difficulties. Please try again.',
        sender: 'ai',
        timestamp: new Date(),
        type: 'text'
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="min-h-screen sky-gradient">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 sm:py-8">
        {/* Header with Language Toggle */}
        <div className="text-center mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row items-center justify-between mb-4">
            <h1 className="text-2xl sm:text-4xl font-bold text-foreground mb-4 sm:mb-0 flex items-center gap-2 sm:gap-3">
              <Bot className="w-8 h-8 sm:w-10 sm:h-10 text-primary" />
              {t('ai.title')} 🤖
            </h1>
            <div className="flex items-center gap-4">
              <LanguageToggle variant="select" size="md" />
            </div>
          </div>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto">
            {t('ai.subtitle')}
          </p>
        </div>

        {/* Location Input */}
        <Card className="earth-card p-4 mb-4 sm:mb-6 max-w-2xl mx-auto">
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <MapPin className="w-5 h-5 text-primary flex-shrink-0" />
            <Input
              placeholder={t('ai.locationPlaceholder')}
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="flex-1"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowLocationSelector(!showLocationSelector)}
              className="whitespace-nowrap"
            >
              <MapPin className="w-4 h-4 mr-2" />
              Choose Location
            </Button>
          </div>
        </Card>

        {/* Location Selector Modal */}
        {showLocationSelector && (
          <Card className="earth-card p-6 mb-6 max-w-4xl mx-auto">
            <LocationSelector
              selectedLocation={location}
              onLocationChange={(loc) => {
                setLocation(loc);
                setShowLocationSelector(false);
              }}
              showWeather={true}
            />
          </Card>
        )}

        {/* Chat Interface */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6">
          {/* Quick Actions Sidebar */}
          <div className="lg:col-span-1 order-2 lg:order-1">
            <Card className="earth-card p-4 h-fit">
              <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-primary" />
                {t('ai.quickAsk')}
              </h3>
              <div className="grid grid-cols-2 lg:grid-cols-1 gap-2 sm:gap-3">
                {quickActions.map((action, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    className="w-full text-left justify-start p-2 sm:p-3 h-auto text-xs sm:text-sm"
                    onClick={() => handleSendMessage(action.action)}
                  >
                    <div className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center ${action.color} text-white mr-2 sm:mr-3 flex-shrink-0`}>
                      {action.icon}
                    </div>
                    <div className="leading-tight">{t(`ai.${action.key}`)}</div>
                  </Button>
                ))}
              </div>
            </Card>
          </div>

          {/* Chat Messages */}
          <div className="lg:col-span-3 order-1 lg:order-2">
            <Card className="earth-card h-[500px] sm:h-[600px] flex flex-col">
              {/* Chat Header */}
              <div className="p-3 sm:p-4 border-b border-border flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-primary rounded-full flex items-center justify-center">
                    <Bot className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
                  </div>
                  <div>
                    <div className="font-semibold text-foreground text-sm sm:text-base">{t('ai.expert')}</div>
                    <div className="text-xs sm:text-sm text-muted-foreground">
                      {isTyping ? t('ai.typing') : t('ai.online')}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSpeechEnabled(!speechEnabled)}
                    className={speechEnabled ? 'text-primary' : 'text-muted-foreground'}
                  >
                    {speechEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                  </Button>
                </div>
              </div>

              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-[85%] sm:max-w-[80%] flex gap-2 sm:gap-3 ${message.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                      <div className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                        message.sender === 'user' ? 'bg-primary' : 'bg-success'
                      }`}>
                        {message.sender === 'user' ? 
                          <User className="w-3 h-3 sm:w-4 sm:h-4 text-white" /> : 
                          <Bot className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                        }
                      </div>
                      <div>
                        <div className={`rounded-lg px-3 py-2 sm:px-4 sm:py-3 ${
                          message.sender === 'user' 
                            ? 'bg-primary text-white' 
                            : 'bg-card-soft text-foreground border border-border'
                        }`}>
                          <div className="whitespace-pre-wrap text-xs sm:text-sm leading-relaxed">
                            {message.text}
                          </div>
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {message.timestamp.toLocaleTimeString()}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="flex gap-2 sm:gap-3">
                      <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-success flex items-center justify-center">
                        <Bot className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                      </div>
                      <div className="bg-card-soft border border-border rounded-lg px-3 py-2 sm:px-4 sm:py-3">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                          <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <div className="p-3 sm:p-4 border-t border-border">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="flex-1 relative">
                    <Input
                      placeholder={t('ai.placeholder')}
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      onKeyPress={handleKeyPress}
                      className="pr-12"
                    />
                  </div>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={startListening}
                    disabled={isListening}
                    className={`${isListening ? 'text-red-500 animate-pulse' : 'text-muted-foreground'} flex-shrink-0`}
                  >
                    {isListening ? <Mic className="w-4 h-4 sm:w-5 sm:h-5" /> : <MicOff className="w-4 h-4 sm:w-5 sm:h-5" />}
                  </Button>
                  
                  <Button
                    onClick={() => handleSendMessage()}
                    disabled={!inputText.trim() || isTyping}
                    className="bg-primary hover:bg-primary/90 flex-shrink-0"
                    size="sm"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
                
                <div className="text-xs text-muted-foreground mt-2 text-center">
                  {t('ai.voiceSupported')} • {t('ai.pressEnter')}
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Features Info */}
        <Card className="earth-card p-4 sm:p-6 mt-6 sm:mt-8">
          <h3 className="text-base sm:text-lg font-semibold text-foreground mb-4 text-center">
            🌟 AI Assistant Features
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-xl sm:text-2xl mb-2">🗣️</div>
              <div className="font-medium text-sm">{t('ai.voiceInput')}</div>
              <div className="text-xs text-muted-foreground">Speech recognition</div>
            </div>
            <div className="text-center">
              <div className="text-xl sm:text-2xl mb-2">🔊</div>
              <div className="font-medium text-sm">{t('ai.voiceOutput')}</div>
              <div className="text-xs text-muted-foreground">Text to speech</div>
            </div>
            <div className="text-center">
              <div className="text-xl sm:text-2xl mb-2">🌐</div>
              <div className="font-medium text-sm">{t('ai.hindiEnglish')}</div>
              <div className="text-xs text-muted-foreground">Multilingual</div>
            </div>
            <div className="text-center">
              <div className="text-xl sm:text-2xl mb-2">⚡</div>
              <div className="font-medium text-sm">{t('ai.quickActions')}</div>
              <div className="text-xs text-muted-foreground">Fast responses</div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default AIAssistant;