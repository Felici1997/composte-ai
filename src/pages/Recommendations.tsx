import React, { useState, useEffect, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Calendar, Droplets, Sun, TrendingUp, AlertTriangle, CheckCircle, MapPin, Thermometer } from 'lucide-react';
import { VisualSoilSelector, VisualSeasonSelector, VisualCropSelector, VisualWaterSelector } from '@/components/VisualInputs';
import { LocationSelector } from '@/components/LocationSelector';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { User } from '@supabase/supabase-js';

interface CropData {
  name: string;
  soil_ph_min: number;
  soil_ph_max: number;
  water_requirement: string;
}

interface DetailedInfo {
  planting_season: string;
  harvest_season: string;
  growing_period: string;
  temperature_range: string;
  rainfall_requirement: string;
  fertilizer_needs: string;
  common_diseases: string[];
  market_demand: string;
  storage_tips: string;
}

interface CropRecommendation {
  crop_name: string;
  icon: string;
  suitability_score: number;
  yield_prediction: number;
  profit_estimate: number;
  benefits: string[];
  risk_factors: string[];
  water_requirement: string;
  suitable_seasons: string[];
  detailed_info?: DetailedInfo;
}

interface RecommendationData {
  id: string;
  user_id: string;
  recommended_crops: CropRecommendation[];
  created_at: string;
}

interface WeatherForecast {
  day: string;
  date: string;
  icon: string;
  high: number;
  low: number;
  precipitation: number;
  description: string;
}

interface WeatherData {
  location: string;
  temperature: number;
  humidity: number;
  description: string;
  icon: string;
  wind_speed: number;
  pressure: number;
  visibility: number;
  feels_like: number;
  uv_index: number;
  sunrise: string;
  sunset: string;
  timestamp: string;
  current_date: string;
  current_time: string;
  forecast: WeatherForecast[];
}

const Recommendations = () => {
  const [user, setUser] = useState<User | null>(null);

  // Utility function to format profit estimates
  const formatProfitEstimate = (amount: number): string => {
    if (amount >= 100000) {
      return `₹${(amount / 100000).toFixed(1)}L`;
    } else if (amount >= 1000) {
      return `₹${Math.round(amount / 1000)},000`;
    } else {
      return `₹${amount}`;
    }
  };
  const [crops, setCrops] = useState<CropData[]>([]);
  const [recommendations, setRecommendations] = useState<RecommendationData[]>([]);
  const [realtimeRecommendations, setRealtimeRecommendations] = useState<CropRecommendation[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedCrop, setSelectedCrop] = useState<CropRecommendation | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [showRealtimeRecommendations, setShowRealtimeRecommendations] = useState(false);
  interface SeasonData {
    temperature?: number;
    rainfall?: number;
    humidity?: number;
  }

  interface SoilData {
    ph?: number;
    nitrogen?: number;
    phosphorus?: number;
    potassium?: number;
  }

  interface WaterData {
    availability?: string;
    quality?: string;
    source?: string;
  }

  interface CropData {
    name: string;
    yield?: number;
    profit?: number;
    suitability?: number;
  }

  const [formData, setFormData] = useState({
    soilType: '',
    soilData: null as SoilData | null,
    soilPh: '',
    irrigationAvailable: false,
    previousCrop: '',
    location: '',
    season: '',
    seasonData: null as SeasonData | null,
    interestedCrops: [] as string[],
    cropData: [] as CropData[],
    waterSource: '',
    waterData: null as WaterData | null
  });
  const { toast } = useToast();

  // Comprehensive crop database
  const cropDatabase = [
    {
      name: 'Cotton',
      icon: '🌾',
      soil_ph_min: 5.8,
      soil_ph_max: 8.0,
      water_requirement: 'high',
      suitable_soils: ['black', 'red', 'sandy'],
      base_yield: 7,
      base_profit: 46000,
      seasons: ['kharif'],
      benefits: ['High yield potential', 'Good market demand', 'Export opportunities'],
      risks: ['Weather dependency', 'Market volatility', 'Pest attacks'],
      detailed_info: {
        planting_season: 'June - July (Kharif)',
        harvest_season: 'October - December',
        growing_period: '120-150 days',
        temperature_range: '21-30°C',
        rainfall_requirement: '500-1000mm',
        fertilizer_needs: 'NPK 120:60:60 kg/ha',
        common_diseases: ['Bollworm', 'Whitefly', 'Bacterial blight'],
        market_demand: 'High - Textile industry, Export market',
        storage_tips: 'Dry storage, moisture below 8%'
      }
    },
    {
      name: 'Maize',
      icon: '🌽',
      soil_ph_min: 5.5,
      soil_ph_max: 7.5,
      water_requirement: 'medium',
      suitable_soils: ['loamy', 'sandy', 'red'],
      base_yield: 6,
      base_profit: 36000,
      seasons: ['kharif', 'rabi'],
      benefits: ['High yield potential', 'Good market demand', 'Multiple uses'],
      risks: ['Weather dependency', 'Market volatility', 'Storage issues'],
      detailed_info: {
        planting_season: 'June-July (Kharif), November-December (Rabi)',
        harvest_season: 'September-October, March-April',
        growing_period: '90-120 days',
        temperature_range: '18-35°C',
        rainfall_requirement: '600-1200mm',
        fertilizer_needs: 'NPK 150:75:40 kg/ha',
        common_diseases: ['Stem borer', 'Fall armyworm', 'Leaf blight'],
        market_demand: 'High - Food processing, Animal feed',
        storage_tips: 'Proper drying, pest control, cool storage'
      }
    },
    {
      name: 'Onion',
      icon: '🧅',
      soil_ph_min: 6.0,
      soil_ph_max: 7.5,
      water_requirement: 'medium',
      suitable_soils: ['loamy', 'red', 'black'],
      base_yield: 7,
      base_profit: 70000,
      seasons: ['rabi'],
      benefits: ['High profit margins', 'Good storage life', 'Export demand'],
      risks: ['Price fluctuations', 'Storage losses', 'Market volatility'],
      detailed_info: {
        planting_season: 'November-December (Rabi)',
        harvest_season: 'March-May',
        growing_period: '120-150 days',
        temperature_range: '15-25°C',
        rainfall_requirement: '650-750mm',
        fertilizer_needs: 'NPK 100:50:50 kg/ha',
        common_diseases: ['Purple blotch', 'Downy mildew', 'Thrips'],
        market_demand: 'Very High - Daily consumption, Export',
        storage_tips: 'Proper curing, ventilated storage, 0-4°C'
      }
    },
    {
      name: 'Wheat',
      icon: '🌾',
      soil_ph_min: 6.0,
      soil_ph_max: 7.5,
      water_requirement: 'medium',
      suitable_soils: ['loamy', 'clay', 'black'],
      base_yield: 4.2,
      base_profit: 28000,
      seasons: ['rabi'],
      benefits: ['Stable prices', 'Government support', 'Easy marketing'],
      risks: ['Climate change', 'Water scarcity', 'Low margins'],
      detailed_info: {
        planting_season: 'November-December (Rabi)',
        harvest_season: 'April-May',
        growing_period: '120-150 days',
        temperature_range: '15-25°C',
        rainfall_requirement: '450-650mm',
        fertilizer_needs: 'NPK 120:60:40 kg/ha',
        common_diseases: ['Rust', 'Powdery mildew', 'Aphids'],
        market_demand: 'Stable - Government procurement, Food security',
        storage_tips: 'Cool, dry storage, pest control'
      }
    },
    {
      name: 'Rice',
      icon: '🍚',
      soil_ph_min: 5.5,
      soil_ph_max: 7.0,
      water_requirement: 'high',
      suitable_soils: ['clay', 'loamy'],
      base_yield: 5.5,
      base_profit: 32000,
      seasons: ['kharif'],
      benefits: ['Staple crop', 'Guaranteed market', 'Government procurement'],
      risks: ['High water requirement', 'Pest diseases', 'Climate dependency'],
      detailed_info: {
        planting_season: 'June-July (Kharif)',
        harvest_season: 'October-December',
        growing_period: '120-160 days',
        temperature_range: '20-35°C',
        rainfall_requirement: '1000-1500mm',
        fertilizer_needs: 'NPK 100:50:50 kg/ha',
        common_diseases: ['Blast', 'Brown spot', 'Bacterial blight'],
        market_demand: 'Guaranteed - Staple food, Government support',
        storage_tips: 'Dry storage, moisture below 14%'
      }
    },
    {
      name: 'Tomato',
      icon: '🍅',
      soil_ph_min: 6.0,
      soil_ph_max: 7.0,
      water_requirement: 'high',
      suitable_soils: ['loamy', 'red'],
      base_yield: 8,
      base_profit: 85000,
      seasons: ['rabi', 'summer'],
      benefits: ['High returns', 'Year-round demand', 'Processing industry'],
      risks: ['Perishable nature', 'Disease susceptible', 'Market gluts'],
      detailed_info: {
        planting_season: 'June-July, November-December',
        harvest_season: 'September-November, February-May',
        growing_period: '90-120 days',
        temperature_range: '18-29°C',
        rainfall_requirement: '600-1250mm',
        fertilizer_needs: 'NPK 180:100:60 kg/ha',
        common_diseases: ['Late blight', 'Early blight', 'Fruit borer'],
        market_demand: 'High - Fresh consumption, Processing',
        storage_tips: 'Cool storage 10-12°C, proper packaging'
      }
    }
  ];

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    fetchCrops();
    fetchRecommendations();
  }, []);

  // Manual trigger for generating real-time recommendations
  const handleGetAIRecommendations = () => {
    try {
      // Enhanced validation - check for essential data
      const hasMinimumData = formData.location || formData.soilType || formData.season || formData.waterSource;
      
      // Additional validation checks
      if (formData.soilPh && isNaN(parseFloat(formData.soilPh))) {
        toast({
          title: "❌ Invalid pH Value",
          description: "Please enter a valid pH value (4.0 - 9.0)",
          variant: "destructive",
        });
        return;
      }
      
      if (formData.soilPh && (parseFloat(formData.soilPh) < 4.0 || parseFloat(formData.soilPh) > 9.0)) {
        toast({
          title: "⚠️ pH Out of Range",
          description: "pH should be between 4.0 and 9.0 for agricultural purposes",
          variant: "destructive",
        });
        return;
      }
      
      if (hasMinimumData) {
        setLoading(true);
        
        // Add small delay to show loading state
        setTimeout(() => {
          try {
            const recommendations = calculateIntelligentRecommendations();
            
            if (!recommendations || recommendations.length === 0) {
              toast({
                title: "🤔 No Recommendations Found",
                description: "Please try adjusting your selections or adding more information for better results.",
                variant: "default",
              });
              setLoading(false);
              return;
            }
            
            setRealtimeRecommendations(recommendations);
            setShowRealtimeRecommendations(true);
            setLoading(false);
            
            // Show success message with summary
            const selectedDataSummary = [];
            if (formData.location) selectedDataSummary.push(`Location: ${formData.location}`);
            if (formData.soilType) selectedDataSummary.push(`Soil: ${formData.soilType}`);
            if (formData.season) selectedDataSummary.push(`Season: ${formData.season}`);
            if (formData.waterSource) selectedDataSummary.push(`Water: ${formData.waterSource}`);
            if (formData.interestedCrops.length > 0) selectedDataSummary.push(`Crops: ${formData.interestedCrops.length} selected`);
            
            toast({
              title: "🌾 AI Recommendations Generated!",
              description: `Analysis complete based on: ${selectedDataSummary.join(', ')}. Found ${recommendations.length} suitable crop recommendations.`,
              variant: "default",
            });
          } catch (error) {
            console.error('Error generating recommendations:', error);
            toast({
              title: "❌ Error Generating Recommendations",
              description: "Please try again or check your input data.",
              variant: "destructive",
            });
            setLoading(false);
          }
        }, 1500);
      } else {
        toast({
          title: "📝 More Information Needed",
          description: "Please select at least one: Location, Soil Type, Season, or Water Source to get intelligent recommendations.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error in handleGetAIRecommendations:', error);
      toast({
        title: "❌ Unexpected Error",
        description: "An error occurred while processing your request. Please try again.",
        variant: "destructive",
      });
      setLoading(false);
    }
  };

  const calculateIntelligentRecommendations = useCallback(() => {
    return cropDatabase.map(crop => {
      let score = 65; // Base score
      const reasoning = [];
      
      // Location-based compatibility (enhanced)
      if (formData.location) {
        const locationLower = formData.location.toLowerCase();
        const locationData = {
          'pune': { suitable: ['cotton', 'onion', 'tomato', 'wheat', 'maize'], bonus: 12 },
          'maharashtra': { suitable: ['cotton', 'sugarcane', 'soybean', 'onion'], bonus: 10 },
          'punjab': { suitable: ['wheat', 'rice', 'maize', 'cotton'], bonus: 15 },
          'gujarat': { suitable: ['cotton', 'groundnut', 'wheat', 'sugarcane'], bonus: 12 },
          'karnataka': { suitable: ['rice', 'cotton', 'maize', 'sugarcane'], bonus: 10 },
          'tamil nadu': { suitable: ['rice', 'sugarcane', 'cotton', 'maize'], bonus: 12 },
          'uttar pradesh': { suitable: ['wheat', 'rice', 'sugarcane', 'potato'], bonus: 13 },
          'west bengal': { suitable: ['rice', 'potato', 'wheat', 'maize'], bonus: 11 },
          'rajasthan': { suitable: ['wheat', 'cotton', 'maize', 'mustard'], bonus: 10 },
          'haryana': { suitable: ['wheat', 'rice', 'cotton', 'sugarcane'], bonus: 14 }
        };
        
        Object.entries(locationData).forEach(([region, data]) => {
          if (locationLower.includes(region)) {
            if (data.suitable.includes(crop.name.toLowerCase())) {
              score += data.bonus;
              reasoning.push(`Excellent for ${region} region`);
            }
          }
        });
      }
      
      // Soil type compatibility (enhanced)
      if (formData.soilType && formData.soilData) {
        if (crop.suitable_soils.includes(formData.soilType)) {
          score += 18;
          reasoning.push(`Perfect soil match (${formData.soilType})`);
        } else {
          // Check if soil is marginally suitable
          const soilData = formData.soilData;
          if (soilData.fertility === 'high' && crop.suitable_soils.some(soil => 
            ['loamy', 'alluvial', 'black'].includes(soil))) {
            score += 8;
            reasoning.push('Good soil fertility compensates');
          }
        }
      }
      
      // Season compatibility (enhanced)
      if (formData.season && formData.seasonData) {
        if (crop.seasons.includes(formData.season.charAt(0).toUpperCase() + formData.season.slice(1))) {
          score += 20;
          reasoning.push(`Perfect season (${formData.season})`);
        } else if (crop.seasons.includes('Year-round')) {
          score += 10;
          reasoning.push('Year-round cultivation possible');
        }
        
        // Additional season-specific bonuses
        const seasonData = formData.seasonData;
        if (seasonData.primaryCrops.includes(crop.name)) {
          score += 15;
          reasoning.push('Primary crop for this season');
        } else if (seasonData.secondaryCrops.includes(crop.name)) {
          score += 8;
          reasoning.push('Secondary crop option');
        }
      }
      
      // Water source compatibility (enhanced)
      if (formData.waterSource && formData.waterData) {
        const waterData = formData.waterData;
        const cropWaterNeed = crop.water_requirement;
        
        // Match water availability with crop needs
        if (waterData.suitableCrops && waterData.suitableCrops.includes(crop.name)) {
          score += 15;
          reasoning.push(`Ideal for ${waterData.name}`);
        }
        
        // Water requirement vs availability scoring
        if (formData.waterSource === 'drip' && ['high', 'medium'].includes(cropWaterNeed)) {
          score += 12;
          reasoning.push('Efficient water use with drip irrigation');
        } else if (formData.waterSource === 'rainwater' && cropWaterNeed === 'low') {
          score += 10;
          reasoning.push('Suitable for rainfed cultivation');
        } else if (formData.waterSource === 'borewell' && cropWaterNeed === 'high') {
          score += 8;
          reasoning.push('Adequate water supply for high-water crops');
        }
      }
      
      // User crop interest bonus
      if (formData.interestedCrops.includes(crop.name.toLowerCase())) {
        score += 25;
        reasoning.push('Matches your interest');
      }
      
      // pH compatibility
      if (formData.soilPh) {
        const ph = parseFloat(formData.soilPh);
        if (ph >= crop.soil_ph_min && ph <= crop.soil_ph_max) {
          score += 12;
          reasoning.push(`Optimal pH range (${ph})`);
        } else {
          const deviation = Math.min(Math.abs(ph - crop.soil_ph_min), Math.abs(ph - crop.soil_ph_max));
          if (deviation <= 0.5) {
            score += 5;
            reasoning.push('pH within acceptable range');
          } else {
            score -= 8;
            reasoning.push('pH needs adjustment');
          }
        }
      }
      
      // Previous crop rotation benefits (enhanced)
      if (formData.previousCrop) {
        const prevCrop = formData.previousCrop.toLowerCase();
        const rotationBenefits = {
          'rice': { beneficial: ['wheat', 'cotton', 'mustard'], bonus: 12 },
          'wheat': { beneficial: ['cotton', 'rice', 'maize'], bonus: 10 },
          'cotton': { beneficial: ['wheat', 'gram', 'soybean'], bonus: 8 },
          'soybean': { beneficial: ['wheat', 'rice', 'cotton'], bonus: 15 }, // Nitrogen fixation benefit
          'sugarcane': { beneficial: ['wheat', 'potato', 'onion'], bonus: 6 }
        };
        
        Object.entries(rotationBenefits).forEach(([prev, data]) => {
          if (prevCrop.includes(prev) && data.beneficial.includes(crop.name.toLowerCase())) {
            score += data.bonus;
            reasoning.push(`Good rotation after ${prev}`);
          }
        });
      }
      
      // Market demand and profitability adjustments
      const marketFactors = {
        'cotton': { demand: 0.9, export: true, bonus: 5 },
        'onion': { demand: 1.1, volatile: true, bonus: 3 },
        'tomato': { demand: 1.0, processing: true, bonus: 4 },
        'wheat': { demand: 0.95, stable: true, bonus: 6 },
        'rice': { demand: 1.0, stable: true, bonus: 5 },
        'sugarcane': { demand: 0.85, assured: true, bonus: 7 }
      };
      
      const marketData = marketFactors[crop.name.toLowerCase() as keyof typeof marketFactors];
      if (marketData) {
        score += marketData.bonus;
        if (marketData.stable) reasoning.push('Stable market demand');
        if (marketData.export) reasoning.push('Export potential');
        if (marketData.processing) reasoning.push('Processing industry demand');
      }
      
      // Cap the score between 45-98
      score = Math.max(45, Math.min(98, score));
      
      // Calculate realistic yield and profit predictions
      const yieldMultiplier = (score / 80);
      const profitMultiplier = (score / 85);
      
      // Add seasonal and regional adjustments
      let seasonalAdjustment = 1.0;
      if (formData.season === 'kharif' && ['rice', 'cotton', 'sugarcane'].includes(crop.name.toLowerCase())) {
        seasonalAdjustment = 1.1;
      } else if (formData.season === 'rabi' && ['wheat', 'potato', 'onion'].includes(crop.name.toLowerCase())) {
        seasonalAdjustment = 1.05;
      }
      
      return {
        crop_name: crop.name,
        icon: crop.icon,
        suitability_score: Math.round(score),
        yield_prediction: Math.round(crop.base_yield * yieldMultiplier * seasonalAdjustment * 10) / 10,
        profit_estimate: Math.round(crop.base_profit * profitMultiplier * seasonalAdjustment),
        benefits: [...crop.benefits, ...reasoning.slice(0, 3)],
        risk_factors: crop.risks,
        water_requirement: crop.water_requirement,
        suitable_seasons: crop.seasons,
        detailed_info: crop.detailed_info
      };
    })
    .sort((a, b) => b.suitability_score - a.suitability_score)
    .slice(0, 5); // Top 5 recommendations
  }, [formData, cropDatabase]);

  const openCropDetails = (crop: CropRecommendation) => {
    // Find the full crop details from the database
    const fullCropData = cropDatabase.find(c => c.name === crop.crop_name);
    if (fullCropData) {
      setSelectedCrop({
        ...crop,
        detailed_info: fullCropData.detailed_info
      });
      setIsModalOpen(true);
    }
  };

  const fetchWeatherData = useCallback(async (location: string) => {
    setWeatherLoading(true);
    try {
      // Simulate API call with realistic weather data based on location
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network delay
      
      // Generate realistic weather data based on location
      const locationWeather = {
        'pune': { temp: 28, humidity: 65, desc: 'Partly Cloudy', icon: '☁️', uv: 7 },
        'mumbai': { temp: 32, humidity: 75, desc: 'Humid', icon: '🌤️', uv: 9 },
        'delhi': { temp: 25, humidity: 45, desc: 'Clear Sky', icon: '☀️', uv: 8 },
        'bangalore': { temp: 24, humidity: 60, desc: 'Pleasant', icon: '🌥️', uv: 6 },
        'hyderabad': { temp: 30, humidity: 55, desc: 'Sunny', icon: '☀️', uv: 8 }
      };
      
      const locationKey = location.toLowerCase().split(',')[0].trim();
      const baseWeather = locationWeather[locationKey as keyof typeof locationWeather] || 
                         { temp: 26, humidity: 58, desc: 'Moderate', icon: '🌥️', uv: 6 };
      
      // Generate 7-day forecast
      const forecastIcons = ['🌤️', '🌧️', '⛈️', '🌥️', '☀️', '🌤️', '☀️'];
      const forecastDescriptions = ['Partly Cloudy', 'Rainy', 'Thunderstorm', 'Cloudy', 'Sunny', 'Partly Cloudy', 'Clear'];
      const precipitationChances = [20, 80, 90, 40, 10, 15, 5];
      
      const forecast: WeatherForecast[] = [];
      const days = ['Today', 'Tomorrow', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
      
      for (let i = 0; i < 7; i++) {
        const date = new Date();
        date.setDate(date.getDate() + i);
        
        const dayTemp = baseWeather.temp + Math.random() * 8 - 4;
        forecast.push({
          day: days[i],
          date: date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }),
          icon: forecastIcons[i],
          high: Math.round(dayTemp + Math.random() * 6 + 2),
          low: Math.round(dayTemp - Math.random() * 6 - 2),
          precipitation: precipitationChances[i],
          description: forecastDescriptions[i]
        });
      }
      
      const now = new Date();
      const weatherData: WeatherData = {
        location: location || 'Current Location',
        temperature: baseWeather.temp + Math.random() * 4 - 2,
        humidity: Math.round(baseWeather.humidity + Math.random() * 10 - 5),
        description: baseWeather.desc,
        icon: baseWeather.icon,
        wind_speed: Math.round(Math.random() * 15 + 5),
        pressure: Math.round(1010 + Math.random() * 20 - 10),
        visibility: Math.round(Math.random() * 5 + 8),
        feels_like: Math.round(baseWeather.temp + Math.random() * 6 - 3),
        uv_index: baseWeather.uv + Math.round(Math.random() * 2 - 1),
        sunrise: '06:15 AM',
        sunset: '06:45 PM',
        timestamp: now.toLocaleString('en-IN'),
        current_date: now.toLocaleDateString('en-IN', { 
          weekday: 'long', 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        }),
        current_time: now.toLocaleTimeString('en-IN', { 
          hour: '2-digit', 
          minute: '2-digit', 
          second: '2-digit',
          hour12: true
        }),
        forecast: forecast
      };
      
      setWeather(weatherData);
    } catch (error) {
      console.error('Error fetching weather data:', error);
    } finally {
      setWeatherLoading(false);
    }
  }, []);

  // Fetch weather data when location changes
  useEffect(() => {
    if (formData.location && formData.location.length > 3) {
      fetchWeatherData(formData.location);
    }
  }, [formData.location, fetchWeatherData]);

  const fetchCrops = async () => {
    const { data, error } = await supabase
      .from('crops')
      .select('*')
      .order('name');
    
    if (error) {
      console.error('Error fetching crops:', error);
    } else {
      setCrops(data || []);
    }
  };

  const fetchRecommendations = useCallback(async () => {
    if (!user) return;
    
    const { data, error } = await supabase
      .from('crop_recommendations')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching recommendations:', error);
    } else {
      setRecommendations(data || []);
    }
  }, [user]);

  const generateRecommendations = async () => {
    if (!user) {
      toast({
        title: "Please sign in",
        description: "You need to be signed in to get recommendations.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    
    try {
      // Simple recommendation algorithm based on soil and season
      const suitableCrops = crops.filter(crop => {
        const phMatch = formData.soilPh ? 
          (parseFloat(formData.soilPh) >= crop.soil_ph_min && parseFloat(formData.soilPh) <= crop.soil_ph_max) : 
          true;
        
        const waterMatch = formData.irrigationAvailable ? 
          crop.water_requirement !== 'high' : 
          crop.water_requirement === 'low';
        
        return phMatch && waterMatch;
      }).slice(0, 5);

      // Create mock recommendations with scores
      const mockRecommendations = suitableCrops.map((crop, index) => ({
        crop_name: crop.name,
        suitability_score: Math.floor(Math.random() * 20) + 80, // 80-100
        yield_prediction: Math.floor(Math.random() * 5) + 3, // 3-8 tons/ha
        profit_estimate: Math.floor(Math.random() * 50000) + 30000, // 30k-80k
        risk_factors: ['Weather dependency', 'Market volatility'],
        benefits: ['High yield potential', 'Good market demand']
      }));

      // Save to database
      const { error } = await supabase
        .from('crop_recommendations')
        .insert({
          user_id: user.id,
          soil_ph: parseFloat(formData.soilPh) || null,
          soil_type: formData.soilType,
          irrigation_available: formData.irrigationAvailable,
          previous_crop: formData.previousCrop,
          recommended_crops: mockRecommendations
        });

      if (error) throw error;

      fetchRecommendations();
      toast({
        title: "Recommendations Generated!",
        description: "Your personalized crop recommendations are ready.",
      });
    } catch (error: unknown) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : 'An unknown error occurred',
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getCropRecommendationCard = (rec: RecommendationData) => {
    const recommendedCrops = rec.recommended_crops || [];
    
    return recommendedCrops.map((crop: CropRecommendation, index: number) => (
      <Card key={index} className="earth-card p-6 hover-glow">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-2xl">{crop.icon || '🌾'}</span>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground">{crop.crop_name}</h3>
              <p className="text-sm text-muted-foreground">Recommended Crop</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-success">{crop.suitability_score}%</div>
            <div className="text-sm text-muted-foreground">Suitability</div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="bg-card-soft p-3 rounded-lg">
            <div className="text-sm text-muted-foreground">Expected Yield</div>
            <div className="text-lg font-semibold text-foreground">{crop.yield_prediction} t/ha</div>
          </div>
          <div className="bg-card-soft p-3 rounded-lg">
            <div className="text-sm text-muted-foreground">Profit Estimate</div>
            <div className="text-lg font-semibold text-cta">{formatProfitEstimate(crop.profit_estimate)}</div>
          </div>
        </div>

        <div className="space-y-3">
          <div>
            <h4 className="text-sm font-medium text-foreground mb-2">Benefits</h4>
            <div className="flex flex-wrap gap-2">
              {crop.benefits?.map((benefit: string, i: number) => (
                <span key={i} className="px-2 py-1 bg-success/10 text-success text-xs rounded-full">
                  {benefit}
                </span>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-sm font-medium text-foreground mb-2">Risk Factors</h4>
            <div className="flex flex-wrap gap-2">
              {crop.risk_factors?.map((risk: string, i: number) => (
                <span key={i} className="px-2 py-1 bg-destructive/10 text-destructive text-xs rounded-full">
                  {risk}
                </span>
              ))}
            </div>
          </div>
        </div>

        <Button 
          className="w-full mt-4 bg-primary" 
          size="sm"
          onClick={() => openCropDetails(crop)}
        >
          View Detailed Plan
        </Button>
      </Card>
    ));
  };

  return (
    <div className="min-h-screen sky-gradient">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            AI Crop Recommendations 🌱
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Get personalized crop suggestions based on your soil conditions, climate, and market trends
          </p>
        </div>

        {/* Enhanced Visual Input Form */}
        <div className="max-w-6xl mx-auto mb-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-semibold text-foreground mb-4">Tell us about your field</h2>
            <p className="text-muted-foreground">Provide details for accurate recommendations</p>
          </div>
          
          <div className="space-y-8">
            {/* Location Selection */}
            <Card className="earth-card p-6">
              <LocationSelector
                selectedLocation={formData.location}
                onLocationChange={(location) => setFormData({...formData, location})}
                showWeather={true}
              />
            </Card>
            
            {/* Soil Type Selection */}
            <Card className="earth-card p-6">
              <VisualSoilSelector
                selectedValue={formData.soilType}
                onValueChange={(value, soilData) => setFormData({...formData, soilType: value, soilData: soilData})}
              />
            </Card>

            {/* Season Selection */}
            <Card className="earth-card p-6">
              <VisualSeasonSelector
                selectedValue={formData.season}
                onValueChange={(value, seasonData) => setFormData({...formData, season: value, seasonData: seasonData})}
              />
            </Card>

            {/* Water Source Selection */}
            <Card className="earth-card p-6">
              <VisualWaterSelector
                selectedValue={formData.waterSource}
                onValueChange={(value, waterData) => setFormData({...formData, waterSource: value, waterData: waterData})}
              />
            </Card>

            {/* Crop Interests */}
            <Card className="earth-card p-6">
              <VisualCropSelector
                selectedValues={formData.interestedCrops}
                onValueChange={(values, cropData) => setFormData({...formData, interestedCrops: values, cropData: cropData || []})}
                maxSelections={5}
                filterBySeason={formData.season}
                filterBySoilType={formData.soilType}
                filterByWaterSource={formData.waterSource}
              />
            </Card>

            {/* Additional Details */}
            <Card className="earth-card p-6">
              <h3 className="text-lg font-medium text-foreground mb-6 flex items-center gap-2">
                <span className="text-2xl">📝</span>
                Additional Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2 flex items-center gap-2">
                    <span className="text-lg">🧪</span>
                    Soil pH (optional)
                  </label>
                  <Input
                    type="number"
                    step="0.1"
                    min="4"
                    max="9"
                    value={formData.soilPh}
                    onChange={(e) => setFormData({...formData, soilPh: e.target.value})}
                    placeholder="e.g., 6.5 (acidity/alkalinity)"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2 flex items-center gap-2">
                    <span className="text-lg">🌾</span>
                    Previous Crop (optional)
                  </label>
                  <Input
                    value={formData.previousCrop}
                    onChange={(e) => setFormData({...formData, previousCrop: e.target.value})}
                    placeholder="e.g., Rice, Wheat, Cotton"
                  />
                </div>
              </div>
            </Card>
          </div>

          {/* Action Buttons */}
          <Card className="earth-card p-6 max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button
              onClick={handleGetAIRecommendations}
              disabled={loading}
              className="w-full bg-primary hover:bg-primary/90 transition-all duration-300 transform hover:scale-[1.02] disabled:transform-none disabled:opacity-60"
              size="lg"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground"></div>
                  <span>Analyzing crop data...</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <span className="text-lg">🌾</span>
                  <span>Get Live Recommendations</span>
                </div>
              )}
            </Button>
            
            <Button
              onClick={generateRecommendations}
              disabled={loading || !user}
              className="w-full bg-cta hover:bg-cta/90 transition-all duration-300 transform hover:scale-[1.02] disabled:transform-none disabled:opacity-60"
              size="lg"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-cta-foreground"></div>
                  <span>Saving recommendations...</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <span className="text-lg">💾</span>
                  <span>Save AI Recommendations</span>
                </div>
              )}
            </Button>
            </div>

            {!user && (
              <p className="text-center text-muted-foreground mt-4">
                Please <a href="/auth" className="text-primary hover:underline">sign in</a> to get recommendations
              </p>
            )}
          </Card>
        </div>

        {/* Comprehensive Weather Analytics Section */}
        {(weather || weatherLoading || formData.location) && (
          <div className="mb-8 max-w-6xl mx-auto">
            {/* Header with Real-time Date & Time */}
            <div className="text-center mb-6 animate-in fade-in duration-500">
              <h2 className="text-2xl font-semibold text-foreground mb-2 flex items-center justify-center gap-2">
                <Sun className="w-6 h-6 text-primary" />
                Weather Analytics
                {formData.location && (
                  <span className="text-lg text-muted-foreground ml-2">
                    - {formData.location}
                  </span>
                )}
              </h2>
              {weather && (
                <div className="text-sm text-muted-foreground space-y-1">
                  <div className="font-medium">{weather.current_date}</div>
                  <div className="font-mono text-primary">{weather.current_time}</div>
                </div>
              )}
            </div>
            
            {weatherLoading ? (
              <Card className="earth-card p-8">
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  <span className="ml-3 text-muted-foreground">Fetching live weather data...</span>
                </div>
              </Card>
            ) : weather ? (
              <div className="space-y-6">
                {/* Current Weather Conditions */}
                <Card className="earth-card p-6">
                  <h3 className="text-lg font-semibold text-foreground mb-4">Current Weather Conditions</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-card-soft p-4 rounded-lg text-center">
                      <div className="text-4xl mb-2">{weather.icon}</div>
                      <div className="text-2xl font-bold text-foreground">{Math.round(weather.temperature)}°C</div>
                      <div className="text-sm text-muted-foreground">Temperature</div>
                    </div>
                    
                    <div className="bg-card-soft p-4 rounded-lg text-center">
                      <div className="text-3xl mb-2">💧</div>
                      <div className="text-xl font-bold text-foreground">{weather.humidity}%</div>
                      <div className="text-sm text-muted-foreground">Humidity</div>
                    </div>
                    
                    <div className="bg-card-soft p-4 rounded-lg text-center">
                      <div className="text-3xl mb-2">🌬️</div>
                      <div className="text-xl font-bold text-foreground">{weather.wind_speed}</div>
                      <div className="text-sm text-muted-foreground">km/h Wind</div>
                    </div>
                    
                    <div className="bg-card-soft p-4 rounded-lg text-center">
                      <div className="text-3xl mb-2">☀️</div>
                      <div className="text-xl font-bold text-foreground">{weather.uv_index}</div>
                      <div className="text-sm text-muted-foreground">UV Index</div>
                    </div>
                  </div>
                  
                  {/* Additional Weather Info */}
                  <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="bg-primary/5 p-3 rounded-lg text-center">
                      <div className="text-sm text-muted-foreground">Feels Like</div>
                      <div className="font-semibold">{weather.feels_like}°C</div>
                    </div>
                    <div className="bg-primary/5 p-3 rounded-lg text-center">
                      <div className="text-sm text-muted-foreground">Pressure</div>
                      <div className="font-semibold">{weather.pressure} mb</div>
                    </div>
                    <div className="bg-primary/5 p-3 rounded-lg text-center">
                      <div className="text-sm text-muted-foreground">Visibility</div>
                      <div className="font-semibold">{weather.visibility} km</div>
                    </div>
                    <div className="bg-primary/5 p-3 rounded-lg text-center">
                      <div className="text-sm text-muted-foreground">Condition</div>
                      <div className="font-semibold text-sm">{weather.description}</div>
                    </div>
                  </div>
                </Card>
                
                {/* 7-Day Forecast */}
                <Card className="earth-card p-6">
                  <h3 className="text-lg font-semibold text-foreground mb-4">7-Day Forecast</h3>
                  <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
                    {weather.forecast.map((day, index) => (
                      <div key={index} className={`bg-card-soft p-4 rounded-lg text-center ${
                        index === 0 ? 'ring-2 ring-primary' : ''
                      }`}>
                        <div className="text-sm font-medium text-foreground mb-2">{day.day}</div>
                        <div className="text-xs text-muted-foreground mb-2">{day.date}</div>
                        <div className="text-2xl mb-2">{day.icon}</div>
                        <div className="space-y-1">
                          <div className="font-semibold text-foreground">{day.high}°</div>
                          <div className="text-sm text-muted-foreground">{day.low}°</div>
                          <div className="text-xs text-primary">{day.precipitation}%</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
                
                {/* Sun & Moon Info */}
                <Card className="earth-card p-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center">
                      <div className="text-2xl mb-2">🌅</div>
                      <div className="text-sm text-muted-foreground">Sunrise</div>
                      <div className="font-semibold">{weather.sunrise}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl mb-2">🌆</div>
                      <div className="text-sm text-muted-foreground">Sunset</div>
                      <div className="font-semibold">{weather.sunset}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl mb-2">🔄</div>
                      <div className="text-sm text-muted-foreground">Last Updated</div>
                      <div className="font-semibold text-xs">{weather.timestamp}</div>
                    </div>
                  </div>
                </Card>
              </div>
            ) : formData.location && (
              <Card className="earth-card p-8 text-center">
                <div className="text-muted-foreground">
                  Enter a valid location to see weather conditions
                </div>
              </Card>
            )}
          </div>
        )}

        {/* Real-time Recommendations */}
        {showRealtimeRecommendations && realtimeRecommendations.length > 0 && (
          <div className="mb-8 animate-in slide-in-from-bottom-4 duration-700">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-semibold text-foreground mb-2">
                Live AI Recommendations \ud83e\udd16
              </h2>
              <p className="text-muted-foreground">
                Based on your current inputs, here are the top crop suggestions
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {realtimeRecommendations.map((crop, index) => (
                <Card 
                  key={index} 
                  className="earth-card p-6 hover-glow transition-all duration-300 transform hover:scale-[1.02] hover:shadow-xl animate-in slide-in-from-bottom-4 duration-500"
                  style={{ animationDelay: `${index * 150}ms` }}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-2xl">{crop.icon}</span>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-foreground">{crop.crop_name}</h3>
                        <p className="text-sm text-muted-foreground">Recommended Crop</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-success">{crop.suitability_score}%</div>
                      <div className="text-sm text-muted-foreground">Suitability</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="bg-card-soft p-3 rounded-lg">
                      <div className="text-sm text-muted-foreground">Expected Yield</div>
                      <div className="text-lg font-semibold text-foreground">{crop.yield_prediction} t/ha</div>
                    </div>
                    <div className="bg-card-soft p-3 rounded-lg">
                      <div className="text-sm text-muted-foreground">Profit Estimate</div>
                      <div className="text-lg font-semibold text-cta">{formatProfitEstimate(crop.profit_estimate)}</div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <h4 className="text-sm font-medium text-foreground mb-2">Benefits</h4>
                      <div className="flex flex-wrap gap-2">
                        {crop.benefits?.map((benefit: string, i: number) => (
                          <span key={i} className="px-2 py-1 bg-success/10 text-success text-xs rounded-full">
                            {benefit}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium text-foreground mb-2">Risk Factors</h4>
                      <div className="flex flex-wrap gap-2">
                        {crop.risk_factors?.map((risk: string, i: number) => (
                          <span key={i} className="px-2 py-1 bg-destructive/10 text-destructive text-xs rounded-full">
                            {risk}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <Button 
                    className="w-full mt-4 bg-primary hover:bg-primary/90 transition-all duration-300 transform hover:scale-[1.02]" 
                    size="sm"
                    onClick={() => openCropDetails(crop)}
                  >
                    <div className="flex items-center gap-2">
                      <span>View Detailed Plan</span>
                      <span className="text-sm">🔍</span>
                    </div>
                  </Button>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Saved Recommendations */}
        {recommendations.length > 0 && (
          <div>
            <h2 className="text-2xl font-semibold text-foreground mb-6">Your Recommendations</h2>
            <div className="space-y-8">
              {recommendations.map((rec, index) => (
                <div key={index}>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium text-foreground">
                      Generated on {new Date(rec.created_at).toLocaleDateString()}
                    </h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {getCropRecommendationCard(rec)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {recommendations.length === 0 && !showRealtimeRecommendations && user && (
          <Card className="earth-card p-12 text-center">
            <div className="text-6xl mb-4">🌱</div>
            <h3 className="text-xl font-semibold text-foreground mb-2">No recommendations yet</h3>
            <p className="text-muted-foreground">Fill out the form above to get your first AI-powered crop recommendations!</p>
          </Card>
        )}

        {/* Detailed Crop Modal */}
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold flex items-center gap-3">
                <span className="text-3xl">{selectedCrop?.icon}</span>
                {selectedCrop?.crop_name} - Detailed Analysis
              </DialogTitle>
            </DialogHeader>
            
            {selectedCrop && (
              <div className="space-y-6">
                {/* Quick Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-card-soft p-4 rounded-lg text-center">
                    <div className="text-2xl font-bold text-success">{selectedCrop.suitability_score}%</div>
                    <div className="text-sm text-muted-foreground">Suitability</div>
                  </div>
                  <div className="bg-card-soft p-4 rounded-lg text-center">
                    <div className="text-xl font-bold text-foreground">{selectedCrop.yield_prediction} t/ha</div>
                    <div className="text-sm text-muted-foreground">Expected Yield</div>
                  </div>
                  <div className="bg-card-soft p-4 rounded-lg text-center">
                    <div className="text-xl font-bold text-cta">{formatProfitEstimate(selectedCrop.profit_estimate)}</div>
                    <div className="text-sm text-muted-foreground">Profit Estimate</div>
                  </div>
                  <div className="bg-card-soft p-4 rounded-lg text-center">
                    <div className="text-lg font-bold text-foreground">{selectedCrop.water_requirement}</div>
                    <div className="text-sm text-muted-foreground">Water Needs</div>
                  </div>
                </div>

                {/* Detailed Information */}
                {selectedCrop.detailed_info && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card className="p-4">
                      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-primary" />
                        Growing Schedule
                      </h3>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Planting Season:</span>
                          <span className="font-medium">{selectedCrop.detailed_info.planting_season}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Harvest Season:</span>
                          <span className="font-medium">{selectedCrop.detailed_info.harvest_season}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Growing Period:</span>
                          <span className="font-medium">{selectedCrop.detailed_info.growing_period}</span>
                        </div>
                      </div>
                    </Card>

                    <Card className="p-4">
                      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <Thermometer className="w-5 h-5 text-primary" />
                        Climate Requirements
                      </h3>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Temperature:</span>
                          <span className="font-medium">{selectedCrop.detailed_info.temperature_range}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Rainfall:</span>
                          <span className="font-medium">{selectedCrop.detailed_info.rainfall_requirement}</span>
                        </div>
                      </div>
                    </Card>

                    <Card className="p-4">
                      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <CheckCircle className="w-5 h-5 text-success" />
                        Cultivation Details
                      </h3>
                      <div className="space-y-3">
                        <div>
                          <span className="text-muted-foreground">Fertilizer Needs:</span>
                          <div className="font-medium">{selectedCrop.detailed_info.fertilizer_needs}</div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Storage Tips:</span>
                          <div className="font-medium text-sm">{selectedCrop.detailed_info.storage_tips}</div>
                        </div>
                      </div>
                    </Card>

                    <Card className="p-4">
                      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-primary" />
                        Market Information
                      </h3>
                      <div className="space-y-3">
                        <div>
                          <span className="text-muted-foreground">Market Demand:</span>
                          <div className="font-medium text-sm">{selectedCrop.detailed_info.market_demand}</div>
                        </div>
                      </div>
                    </Card>
                  </div>
                )}

                {/* Benefits and Risks */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card className="p-4">
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-success" />
                      Benefits
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedCrop.benefits?.map((benefit: string, i: number) => (
                        <Badge key={i} variant="secondary" className="bg-success/10 text-success">
                          {benefit}
                        </Badge>
                      ))}
                    </div>
                  </Card>

                  <Card className="p-4">
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5 text-destructive" />
                      Risk Factors
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedCrop.risk_factors?.map((risk: string, i: number) => (
                        <Badge key={i} variant="secondary" className="bg-destructive/10 text-destructive">
                          {risk}
                        </Badge>
                      ))}
                    </div>
                  </Card>
                </div>

                {/* Common Diseases */}
                {selectedCrop.detailed_info?.common_diseases && (
                  <Card className="p-4">
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5 text-warning" />
                      Common Diseases & Pests
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedCrop.detailed_info.common_diseases.map((disease: string, i: number) => (
                        <Badge key={i} variant="outline" className="border-warning text-warning">
                          {disease}
                        </Badge>
                      ))}
                    </div>
                  </Card>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default Recommendations;