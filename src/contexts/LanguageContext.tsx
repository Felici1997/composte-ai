import React, { createContext, useContext, useState, ReactNode } from 'react';

// Language types - English only
export type Language = 'en';

// Translation interface
interface Translations {
  en: Record<string, string>;
}

// Language context interface
interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  translations: Translations;
}

// English-only translations
const translations: Translations = {
  en: {
    // Navigation
    'nav.home': 'Home',
    'nav.dashboard': 'Dashboard',
    'nav.soil': 'Soil Analysis',
    'nav.disease': 'Disease Scanner',
    'nav.ai': 'AI Assistant',
    'nav.weather': 'Weather',
    'nav.market': 'Market',
    'nav.profile': 'Profile',
    'nav.signin': 'Sign In',
    'nav.signout': 'Sign Out',
    'nav.getStarted': 'Get Started',

    // AI Assistant
    'ai.title': 'AI Farm Assistant',
    'ai.subtitle': 'Your personal farming advisor - Ask questions in English',
    'ai.locationPlaceholder': 'Enter your location (e.g., Pune, Maharashtra)',
    'ai.quickAsk': 'Quick Ask',
    'ai.cropRecommendation': 'Crop Recommendation',
    'ai.diseaseHelp': 'Disease Help',
    'ai.weatherAdvice': 'Weather Advice',
    'ai.marketPrices': 'Market Prices',
    'ai.farmingTips': 'Farming Tips',
    'ai.seasonalCalendar': 'Seasonal Calendar',
    'ai.expert': 'AI Farm Expert',
    'ai.online': 'Online • Ready to help',
    'ai.typing': 'typing...',
    'ai.placeholder': 'Type your question or use microphone...',
    'ai.voiceInput': 'Voice Input',
    'ai.voiceOutput': 'Voice Output',
    'ai.hindiEnglish': 'English',
    'ai.quickActions': 'Quick Actions',
    'ai.send': 'Send',
    'ai.pressEnter': 'Press Enter to send',
    'ai.voiceSupported': 'Voice supported',

    // Crop Recommendations
    'crop.title': 'AI Crop Recommendations',
    'crop.subtitle': 'Get personalized crop suggestions based on your soil conditions, climate, and market trends',
    'crop.tellUs': 'Tell us about your field',
    'crop.details': 'Provide details for accurate recommendations',
    'crop.soilType': 'Soil Type',
    'crop.season': 'Select Season',
    'crop.waterSource': 'Water Source',
    'crop.cropInterests': 'Select Crops of Interest',
    'crop.additionalDetails': 'Additional Details',
    'crop.soilPH': 'Soil pH (optional)',
    'crop.previousCrop': 'Previous Crop (optional)',
    'crop.getLive': 'Get Live Recommendations',
    'crop.saveAI': 'Save AI Recommendations',
    'crop.analyzing': 'Analyzing...',
    'crop.saving': 'Saving...',
    'crop.selectCropsOfInterest': 'Select Crops of Interest',
    'crop.type': 'Select Crops',
    
    // Individual Crops
    'crop.rice': 'Rice',
    'crop.wheat': 'Wheat', 
    'crop.cotton': 'Cotton',
    'crop.sugarcane': 'Sugarcane',
    'crop.maize': 'Maize',
    'crop.soybean': 'Soybean',
    'crop.tomato': 'Tomato',
    'crop.potato': 'Potato',
    'crop.onion': 'Onion',
    
    // Crop Descriptions
    'crop.riceDesc': 'Staple food crop',
    'crop.wheatDesc': 'Winter wheat',
    'crop.cottonDesc': 'Cash crop',
    'crop.sugarcaneDesc': 'Sugar crop',
    'crop.maizeDesc': 'Corn crop',
    'crop.soybeanDesc': 'Oil seed',
    'crop.tomatoDesc': 'Vegetable crop',
    'crop.potatoDesc': 'Tuber crop',
    'crop.onionDesc': 'Bulb crop',
    
    // Crop Categories
    'crop.riceCategory': 'Cereal',
    'crop.wheatCategory': 'Cereal',
    'crop.cottonCategory': 'Cash Crop',
    'crop.sugarcaneCategory': 'Cash Crop',
    'crop.maizeCategory': 'Cereal',
    'crop.soybeanCategory': 'Oil Seed',
    'crop.tomatoCategory': 'Vegetable',
    'crop.potatoCategory': 'Vegetable',
    'crop.onionCategory': 'Vegetable',

    // Crop Recommendations Component
    'cropRec.intelligence': 'AI Crop Intelligence',
    'cropRec.smartAnalysis': 'Smart Crop Analysis',
    'cropRec.runAnalysis': 'Run AI Analysis',
    'cropRec.confidence': 'Confidence',
    'cropRec.expectedYield': 'Expected Yield',
    'cropRec.bestSeason': 'Best Season',
    'cropRec.recommendation': 'Recommendation',
    'cropRec.analysisFactors': 'Analysis Factors',
    'cropRec.marketInsights': 'Market Insights',
    'cropRec.wheatPrice': 'Wheat Price',
    'cropRec.demandForecast': 'Demand Forecast',
    'cropRec.competition': 'Competition',
    'cropRec.high': 'High',
    'cropRec.medium': 'Medium',
    'cropRec.optimalZone': 'Optimal Zone 7B',
    'cropRec.winterPlanting': 'Winter Planting',
    'cropRec.moisture': 'Moisture',
    'cropRec.moistureOptimal': '68% Optimal',
    'cropRec.sunlight': 'Sunlight',
    'cropRec.sunlightDaily': '8hrs Daily',
    'cropRec.wheatReason': 'Optimal soil pH and nitrogen levels',
    'cropRec.maizeReason': 'High moisture content and temperature match',
    'cropRec.soybeanReason': 'Nitrogen-fixing benefits for soil health',

    // Soil Types
    'soil.clay': 'Clay',
    'soil.sandy': 'Sandy',
    'soil.loamy': 'Loamy',
    'soil.black': 'Black Cotton',
    'soil.red': 'Red Soil',
    'soil.clayDesc': 'Heavy, water holding',
    'soil.sandyDesc': 'Light, well-draining',
    'soil.loamyDesc': 'Best for crops',
    'soil.blackDesc': 'Cotton soil',
    'soil.redDesc': 'Iron-rich soil',

    // Seasons
    'season.kharif': 'Kharif (Monsoon)',
    'season.rabi': 'Rabi (Winter)',
    'season.zaid': 'Zaid (Summer)',
    'season.kharifDesc': 'Monsoon crops',
    'season.rabiDesc': 'Winter crops',
    'season.zaidDesc': 'Summer crops',
    'season.kharifMonths': 'June-October',
    'season.rabiMonths': 'November-April',
    'season.zaidMonths': 'March-June',

    // Water Sources
    'water.source': 'Water Source',
    'water.none': 'Rain-fed',
    'water.well': 'Well',
    'water.borewell': 'Borewell',
    'water.canal': 'Canal',
    'water.drip': 'Drip System',
    'water.noneDesc': 'Monsoon water only',
    'water.wellDesc': 'Traditional well',
    'water.borewellDesc': 'Deep bore water',
    'water.canalDesc': 'Government canal',
    'water.dripDesc': 'Modern irrigation',

    // Location
    'location.title': 'Choose Location',
    'location.subtitle': 'Select your location for accurate weather information',
    'location.search': 'Search city name...',
    'location.gps': 'GPS',
    'location.popular': 'Popular Agricultural Regions',
    'location.majorStates': 'Major Agricultural States',
    'location.weather': 'Weather Info',
    'location.loading': 'Loading weather data...',
    'location.temperature': 'Temperature',
    'location.humidity': 'Humidity',
    'location.wind': 'Wind Speed',
    'location.visibility': 'Visibility',
    'weather.insights': 'Weather Insights',
    'weather.forecast': 'Weekly Forecast',
    'weather.farmingAlerts': 'Farming Alerts',
    'weather.farmingInsights': 'Farming Insights',
    'weather.currentWeather': 'Current Weather',

    // Common
    'common.loading': 'Loading...',
    'common.error': 'Error',
    'common.success': 'Success',
    'common.cancel': 'Cancel',
    'common.save': 'Save',
    'common.edit': 'Edit',
    'common.delete': 'Delete',
    'common.back': 'Back',
    'common.next': 'Next',
    'common.previous': 'Previous',
    'common.close': 'Close',
    'common.open': 'Open',
    'common.yes': 'Yes',
    'common.no': 'No',
    'common.optional': 'optional',
    'common.required': 'required',
    'common.selectLanguage': 'Select Language',
    'common.english': 'English',
    'common.hindi': 'Hindi',
    'common.highProfit': 'High Profit',
    'common.mediumProfit': 'Medium Profit', 
    'common.lowProfit': 'Low Profit'
  }
};

// Create context
const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Language provider component
interface LanguageProviderProps {
  children: ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('en');

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  const value: LanguageContextType = {
    language,
    setLanguage,
    t,
    translations
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

// Custom hook to use language context
export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
