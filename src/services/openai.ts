// OpenAI API Service for AgriTech AI Assistant
// Provides intelligent agricultural advice and recommendations

interface OpenAIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface OpenAIResponse {
  choices: Array<{
    message: {
      content: string;
      role: string;
    };
  }>;
  usage?: {
    total_tokens: number;
    prompt_tokens: number;
    completion_tokens: number;
  };
}

export class OpenAIService {
  private apiKey: string;
  private baseUrl = 'https://api.openai.com/v1';

  constructor() {
    this.apiKey = import.meta.env.VITE_OPENAI_API_KEY;
    if (!this.apiKey) {
      console.warn('OpenAI API key not found. AI features will use fallback responses.');
    }
  }

  async generateCropRecommendation(
    soil: string,
    season: string, 
    location: string,
    budget?: number
  ): Promise<string> {
    if (!this.apiKey) {
      return this.getFallbackCropRecommendation(soil, season, location, budget);
    }

    const messages: OpenAIMessage[] = [
      {
        role: 'system',
        content: `You are an AI-powered land monitoring and crop recommendation expert designed for Indian farmers. Your job is to analyze land, soil, and weather data and provide clear, helpful, voice-friendly advice in simple language.
        
        Guidelines:
        - Use simple Hindi-English mix words that farmers understand
        - Speak like a friendly farming expert, not a robot
        - Give practical advice that can be implemented immediately
        - Use familiar farming terms and local crop names
        - Structure responses for voice reading (short sentences, clear pauses)
        - Include specific numbers, quantities, and timelines
        - Focus on low-cost, practical solutions for small farmers
        - Always end with encouraging words about good harvest
        
        Your responses should sound natural when read aloud to farmers who may not be able to read.`
      },
      {
        role: 'user',
        content: `Please recommend crops for:
        - Soil Type: ${soil}
        - Season: ${season}
        - Location: ${location}
        ${budget ? `- Budget: ₹${budget}` : ''}
        
        Provide specific crop suggestions with yield estimates and profit potential.`
      }
    ];

    try {
      const response = await this.callOpenAI(messages);
      return response || this.getFallbackCropRecommendation(soil, season, location, budget);
    } catch (error) {
      console.error('OpenAI API Error:', error);
      return this.getFallbackCropRecommendation(soil, season, location, budget);
    }
  }

  async generatePlantDiseaseAdvice(
    diseaseName: string,
    cropType: string,
    severity: string,
    symptoms: string[]
  ): Promise<string> {
    if (!this.apiKey) {
      return this.getFallbackDiseaseAdvice(diseaseName, cropType, severity);
    }

    const messages: OpenAIMessage[] = [
      {
        role: 'system',
        content: `You are an AI-powered land monitoring and crop recommendation expert designed for Indian farmers. Your job is to analyze plant diseases and provide clear, helpful, voice-friendly treatment advice in simple language.
        
        Guidelines:
        - Speak like a caring farming doctor who understands farmer problems
        - Use simple words that can be easily understood when spoken aloud
        - Give step-by-step treatment like recipe instructions
        - Mention local medicine names and home remedies
        - Include cost estimates in rupees for treatments
        - Use encouraging tone - "Don't worry, this can be fixed"
        - Structure for voice: short sentences, clear instructions
        - Always reassure about recovery chances
        
        Your responses should sound natural when read aloud to farmers.`
      },
      {
        role: 'user',
        content: `Disease Details:
        - Disease: ${diseaseName}
        - Crop: ${cropType}
        - Severity: ${severity}
        - Symptoms: ${symptoms.join(', ')}
        
        Please provide comprehensive treatment and prevention advice.`
      }
    ];

    try {
      const response = await this.callOpenAI(messages);
      return response || this.getFallbackDiseaseAdvice(diseaseName, cropType, severity);
    } catch (error) {
      console.error('OpenAI API Error:', error);
      return this.getFallbackDiseaseAdvice(diseaseName, cropType, severity);
    }
  }

  async generateFarmingAdvice(query: string, context?: string): Promise<string> {
    if (!this.apiKey) {
      return this.getFallbackFarmingAdvice(query);
    }

    const messages: OpenAIMessage[] = [
      {
        role: 'system',
        content: `You are an AI-powered land monitoring and crop recommendation expert designed for Indian farmers. Your job is to analyze farming questions and provide clear, helpful, voice-friendly advice in simple language.
        
        Guidelines:
        - Talk like a knowledgeable farmer friend, not a textbook
        - Use everyday language that sounds natural when spoken
        - Give practical solutions that farmers can do with available resources
        - Include cost details in rupees and local market information
        - Use familiar examples from Indian farming
        - Structure for voice reading: clear, short sentences
        - Always encourage farmers and build confidence
        - Mention government schemes by simple names
        
        Your responses should be helpful when read aloud to farmers who may not read well.`
      },
      {
        role: 'user',
        content: `${context ? `Context: ${context}\n\n` : ''}Question: ${query}`
      }
    ];

    try {
      const response = await this.callOpenAI(messages);
      return response || this.getFallbackFarmingAdvice(query);
    } catch (error) {
      console.error('OpenAI API Error:', error);
      return this.getFallbackFarmingAdvice(query);
    }
  }

  async generateWeatherBasedAdvice(
    weather: { temp: number; humidity: number; description: string; windSpeed: number },
    location: string,
    crops: string[]
  ): Promise<string> {
    if (!this.apiKey) {
      return this.getFallbackWeatherAdvice(weather, crops);
    }

    const messages: OpenAIMessage[] = [
      {
        role: 'system',
        content: `You are an AI-powered land monitoring and crop recommendation expert designed for Indian farmers. Your job is to analyze weather data and provide clear, helpful, voice-friendly farming advice in simple language.
        
        Guidelines:
        - Explain weather like a local farming expert would
        - Use simple weather words that farmers know
        - Give immediate action items based on weather
        - Structure advice for voice reading with clear pauses
        - Use encouraging tone about weather challenges
        - Include timing: "today do this, tomorrow do that"
        - Mention familiar weather patterns and seasons
        - Always end with positive farming outlook
        
        Your responses should sound natural when read aloud to farmers.`
      },
      {
        role: 'user',
        content: `Current Weather Analysis:
        - Location: ${location}
        - Temperature: ${weather.temp}°C
        - Humidity: ${weather.humidity}%
        - Weather: ${weather.description}
        - Wind: ${weather.windSpeed} km/h
        - Current Crops: ${crops.join(', ')}
        
        Please provide weather-specific farming recommendations.`
      }
    ];

    try {
      const response = await this.callOpenAI(messages);
      return response || this.getFallbackWeatherAdvice(weather, crops);
    } catch (error) {
      console.error('OpenAI API Error:', error);
      return this.getFallbackWeatherAdvice(weather, crops);
    }
  }

  private async callOpenAI(messages: OpenAIMessage[]): Promise<string | null> {
    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages,
        max_tokens: 1000,
        temperature: 0.7,
        top_p: 1,
        frequency_penalty: 0,
        presence_penalty: 0,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
    }

    const data: OpenAIResponse = await response.json();
    return data.choices[0]?.message?.content || null;
  }

  // Fallback responses when API is unavailable - Voice-friendly for farmers
  private getFallbackCropRecommendation(soil: string, season: string, location: string, budget?: number): string {
    const recommendations = {
      'Kharif': ['Dhaan (Rice)', 'Kapas (Cotton)', 'Ganna (Sugarcane)', 'Makka (Maize)', 'Dal (Pulses)'],
      'Rabi': ['Gehun (Wheat)', 'Jau (Barley)', 'Sarson (Mustard)', 'Chana (Gram)', 'Matar (Peas)'],
      'Zaid': ['Chara (Fodder)', 'Tarbooj (Watermelon)', 'Kharbooja (Muskmelon)', 'Kheera (Cucumber)', 'Makka Chara']
    };

    const seasonCrops = recommendations[season as keyof typeof recommendations] || recommendations['Kharif'];
    const primaryCrop = seasonCrops[0];
    const secondaryCrop = seasonCrops[1];
    const alternativeCrop = seasonCrops[2];

    return `🌾 **${season} Season के लिए फसल सुझाव**

Namaste farmer bhai! ${location} में ${soil} मिट्टी के लिए ये फसलें अच्छी हैं:

**सबसे अच्छी Choice:** ${primaryCrop}
• अच्छा मुनाफा मिलेगा
• Market में demand अच्छी है
• आपकी मिट्टी के लिए perfect है

**दूसरा Option:** ${secondaryCrop}
• कम risk है
• पक्का फायदा होगा
• Safe choice है

**तीसरा Option:** ${alternativeCrop}
• ज्यादा पैसा कमा सकते हैं
• थोड़ा ज्यादा mehnat चाहिए

**आज ही करें:**
• मिट्टी की जांच कराएं
• अच्छे बीज लेकर आएं
• पानी का इंतजाम देखें
• मौसम की जानकारी लें
${budget ? `• ₹${budget} budget में ${primaryCrop} सबसे अच्छी होगी` : ''}

**Good News:** सही तरीके से करें तो बहुत अच्छी फसल होगी! 🎉

*अपने area के कृषि अधिकारी से भी मिलकर बात करें।*`;
  }

  private getFallbackDiseaseAdvice(diseaseName: string, cropType: string, severity: string): string {
    return `🩺 **${diseaseName} का इलाज - ${cropType} की फसल**

Don't worry farmer bhai! ये बीमारी ठीक हो जाएगी। बस ये steps follow करें:

**आज ही करें (तुरंत):**
1. खराब leaves और branches तोड़कर फेंक दें
2. बीमार plants को अलग कर दें
3. Plants के बीच हवा आने का रास्ता बनाएं
4. पानी कम दें - ज्यादा पानी से problem बढ़ेगी

**दवाई Options:**
• **Desi नुस्खा:** नीम का तेल - 1 लीटर पानी में 2-3ml मिलाकर spray करें
• **Market दवाई:** Copper wala fungicide - packet पर लिखे हिसाब से use करें
• **कब लगाएं:** 7-10 दिन में एक बार, बारिश के time ज्यादा जरूरी

**Problem Level: ${severity}**
${severity === 'severe' ? '⚠️ **24 घंटे में इलाज जरूरी - देर न करें!**' : '✅ जल्दी पकड़ा है - पूरी तरह ठीक हो जाएगा'}

**भविष्य में बचाव:**
• Plants के बीच proper जगह रखें
• ऊपर से पानी न डालें
• सूखे पत्ते हटाते रहें
• Disease resistant किस्म लगाएं

**कितने दिन में ठीक होगी:** 2-4 हफ्ते में full recovery

**Good News:** सही इलाज से 100% ठीक हो जाएगी! आपकी फसल अच्छी होगी! 🌱

*अगर बहुत ज्यादा problem है तो कृषि doctor को दिखाएं।*`;
  }

  private getFallbackFarmingAdvice(query: string): string {
    return `🌱 **खेती की सलाह**

Namaste farmer bhai! आपका सवाल बहुत अच्छा है: "${query}"

**मेरी सलाह:**
• **मिट्टी की सेहत:** साल में एक बार soil test कराएं, गोबर खाद डालते रहें
• **पानी की व्यवस्था:** Drip या sprinkler लगाएं - पानी की बचत होगी
• **फसल की सुरक्षा:** Natural तरीकों से कीड़े भगाएं, जरूरत पर ही spray करें
• **Market Strategy:** Direct selling करें, value addition से ज्यादा पैसा मिलेगा
• **Technology:** Weather app use करें, Soil Health Card बनवाएं

**आगे क्या करें:**
1. अपने area के Krishi Vigyan Kendra (KVK) जाएं
2. FPO (Farmer Group) में शामिल हों
3. Government schemes का फायदा उठाएं
4. Environment friendly खेती करें

**Helpful Numbers और Services:**
• Kisan Call Center: 1800-180-1551 (24 घंटे free सलाह)
• Soil Health Card portal online check करें
• mKisan SMS service के लिए register करें
• Local कृषि अधिकारी से मिलें

**Good News:** आप सही direction में जा रहे हैं! Modern techniques से बहुत फायदा होगा! 💪

*Technical problems के लिए expert की help जरूर लें।*`;
  }

  private getFallbackWeatherAdvice(weather: { temp?: number; humidity?: number }, crops: string[]): string {
    const temp = weather.temp || 25;
    const humidity = weather.humidity || 60;
    
    return `🌤️ **आज के मौसम की सलाह**

Namaste farmer bhai! आज का मौसम देखकर ये करें:

**अभी का मौसम:**
• Temperature: ${temp}°C
• Humidity: ${humidity}%
• आपकी फसलें: ${crops.join(', ')}

**आज के लिए जरूरी काम:**
${temp > 30 ? '🌡️ **गर्मी Alert:**\n• ज्यादा पानी दें\n• छाया का इंतजाम करें\n• सुबह-शाम का काम करें, दोपहर में आराम करें' : ''}
${humidity > 80 ? '💧 **नमी Alert:**\n• Fungal disease का खतरा है\n• Plants के बीच हवा आने दें\n• कीड़ों पर नजर रखें' : ''}
${temp < 15 ? '❄️ **ठंड से बचाव:**\n• पाला से बचाएं\n• पानी देना कम करें\n• नाजुक plants को ढकें' : ''}

**आज करने वाले काम:**
• Irrigation system check करें
• फसल की health देखें
• ठंडे time में field का काम करें
• कल के मौसम के लिए तैयारी करें

**बीमारी का खतरा:** ${humidity > 70 ? 'ज्यादा है - preventive spray कर दें' : 'कम है - regular checking करते रहें'}

**Good News:** सही planning से मौसम की हर problem का solution है! आपकी फसल safe रहेगी! 🌾

*Daily weather update देखते रहें better planning के लिए।*`;
  }
}

// Export singleton instance
export const openAIService = new OpenAIService();