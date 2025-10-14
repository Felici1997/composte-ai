import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Circle } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

// Visual soil type selector with comprehensive data
interface SoilTypeOption {
  value: string;
  icon: string;
  color: string;
  phRange: { min: number; max: number };
  waterRetention: 'high' | 'medium' | 'low';
  drainage: 'poor' | 'moderate' | 'good' | 'excellent';
  fertility: 'low' | 'medium' | 'high';
  bestCrops: string[];
  challenges: string[];
  recommendations: string[];
  nutrients: {
    nitrogen: 'low' | 'medium' | 'high';
    phosphorus: 'low' | 'medium' | 'high';
    potassium: 'low' | 'medium' | 'high';
  };
}

const soilTypes: SoilTypeOption[] = [
  {
    value: 'clay',
    icon: '🟫',
    color: 'bg-amber-100 border-amber-300',
    phRange: { min: 6.0, max: 7.5 },
    waterRetention: 'high',
    drainage: 'poor',
    fertility: 'high',
    bestCrops: ['Rice', 'Wheat', 'Cotton', 'Sugarcane'],
    challenges: ['Poor drainage', 'Hard to till when dry', 'Waterlogging risk'],
    recommendations: ['Improve drainage with channels', 'Add organic matter', 'Avoid tilling when wet'],
    nutrients: {
      nitrogen: 'high',
      phosphorus: 'medium',
      potassium: 'high'
    }
  },
  {
    value: 'sandy',
    icon: '🟨',
    color: 'bg-yellow-100 border-yellow-300',
    phRange: { min: 5.5, max: 7.0 },
    waterRetention: 'low',
    drainage: 'excellent',
    fertility: 'low',
    bestCrops: ['Groundnut', 'Millet', 'Watermelon', 'Carrot'],
    challenges: ['Low water retention', 'Nutrient leaching', 'Low organic matter'],
    recommendations: ['Regular irrigation', 'Add compost regularly', 'Use mulching'],
    nutrients: {
      nitrogen: 'low',
      phosphorus: 'low',
      potassium: 'low'
    }
  },
  {
    value: 'loamy',
    icon: '🟤',
    color: 'bg-orange-100 border-orange-300',
    phRange: { min: 6.0, max: 7.0 },
    waterRetention: 'medium',
    drainage: 'good',
    fertility: 'high',
    bestCrops: ['Tomato', 'Potato', 'Maize', 'Beans', 'Most vegetables'],
    challenges: ['May compact under heavy machinery', 'Needs balanced nutrition'],
    recommendations: ['Ideal for most crops', 'Maintain organic matter', 'Regular soil testing'],
    nutrients: {
      nitrogen: 'medium',
      phosphorus: 'high',
      potassium: 'medium'
    }
  },
  {
    value: 'black',
    icon: '⚫',
    color: 'bg-gray-100 border-gray-400',
    phRange: { min: 7.0, max: 8.5 },
    waterRetention: 'high',
    drainage: 'moderate',
    fertility: 'high',
    bestCrops: ['Cotton', 'Sugarcane', 'Soybean', 'Wheat'],
    challenges: ['Swelling and shrinking', 'Becomes hard when dry', 'Alkaline tendency'],
    recommendations: ['Deep plowing in summer', 'Use gypsum for alkalinity', 'Proper timing of operations'],
    nutrients: {
      nitrogen: 'medium',
      phosphorus: 'medium',
      potassium: 'high'
    }
  },
  {
    value: 'red',
    icon: '🔴',
    color: 'bg-red-100 border-red-300',
    phRange: { min: 5.0, max: 6.5 },
    waterRetention: 'medium',
    drainage: 'good',
    fertility: 'medium',
    bestCrops: ['Coffee', 'Tea', 'Cashew', 'Coconut', 'Ragi'],
    challenges: ['Iron-rich but acidic', 'Low in lime and phosphorus', 'Erosion prone'],
    recommendations: ['Add lime to reduce acidity', 'Phosphorus fertilizers needed', 'Contour farming'],
    nutrients: {
      nitrogen: 'low',
      phosphorus: 'low',
      potassium: 'medium'
    }
  },
  {
    value: 'alluvial',
    icon: '🌊',
    color: 'bg-blue-100 border-blue-300',
    phRange: { min: 6.0, max: 7.5 },
    waterRetention: 'medium',
    drainage: 'good',
    fertility: 'high',
    bestCrops: ['Rice', 'Wheat', 'Sugarcane', 'Cotton', 'Jute'],
    challenges: ['Varies in texture', 'May lack organic matter', 'Flooding risk'],
    recommendations: ['Regular organic matter addition', 'Proper water management', 'Crop rotation'],
    nutrients: {
      nitrogen: 'medium',
      phosphorus: 'medium',
      potassium: 'high'
    }
  }
];

interface VisualSoilSelectorProps {
  selectedValue: string;
  onValueChange: (value: string, soilData?: SoilTypeOption) => void;
}

export const VisualSoilSelector: React.FC<VisualSoilSelectorProps> = ({ selectedValue, onValueChange }) => {
  const { t } = useLanguage();
  const selectedSoil = soilTypes.find(soil => soil.value === selectedValue);
  
  const handleSoilSelect = (soil: SoilTypeOption) => {
    try {
      if (!soil || !soil.value) {
        console.warn('Invalid soil selection:', soil);
        return;
      }
      onValueChange(soil.value, soil);
    } catch (error) {
      console.error('Error in soil selection:', error);
    }
  };

  const getFertilityColor = (level: string) => {
    switch (level) {
      case 'high': return 'text-green-600';
      case 'medium': return 'text-yellow-600';
      case 'low': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getDrainageColor = (drainage: string) => {
    switch (drainage) {
      case 'excellent': return 'text-green-600';
      case 'good': return 'text-blue-600';
      case 'moderate': return 'text-yellow-600';
      case 'poor': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };
  
  return (
    <div className="space-y-6">
      <label className="block text-lg font-medium text-foreground mb-4 flex items-center gap-2">
        <span className="text-2xl">🌱</span>
        Select Your Soil Type
      </label>
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {soilTypes.map((soil) => (
          <Card
            key={soil.value}
            className={`relative cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-xl hover:-translate-y-1 ${
              selectedValue === soil.value 
                ? `${soil.color} border-2 ring-2 ring-primary shadow-lg scale-105` 
                : 'bg-card hover:bg-card-soft border border-border hover:border-primary/50'
            }`}
            onClick={() => handleSoilSelect(soil)}
          >
            <div className="p-4 text-center">
              <div className="text-4xl mb-2">{soil.icon}</div>
              <div className="font-medium text-sm mb-1 capitalize">{soil.value}</div>
              <div className="text-xs text-muted-foreground">
                pH: {soil.phRange.min}-{soil.phRange.max}
              </div>
              
              {selectedValue === soil.value && (
                <div className="absolute -top-2 -right-2">
                  <CheckCircle className="w-6 h-6 text-success bg-white rounded-full" />
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>

      {/* Detailed Soil Information */}
      {selectedSoil && (
        <Card className="p-6 mt-6">
          <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            {selectedSoil.icon} {selectedSoil.value.charAt(0).toUpperCase() + selectedSoil.value.slice(1)} Soil Analysis
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Soil Properties */}
            <div className="space-y-4">
              <h4 className="font-medium text-foreground flex items-center gap-2">
                🧨 Soil Properties
              </h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">pH Range:</span>
                  <span className="text-sm font-medium">{selectedSoil.phRange.min} - {selectedSoil.phRange.max}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Water Retention:</span>
                  <span className={`text-sm font-medium ${getFertilityColor(selectedSoil.waterRetention)}`}>
                    {selectedSoil.waterRetention.charAt(0).toUpperCase() + selectedSoil.waterRetention.slice(1)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Drainage:</span>
                  <span className={`text-sm font-medium ${getDrainageColor(selectedSoil.drainage)}`}>
                    {selectedSoil.drainage.charAt(0).toUpperCase() + selectedSoil.drainage.slice(1)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Fertility:</span>
                  <span className={`text-sm font-medium ${getFertilityColor(selectedSoil.fertility)}`}>
                    {selectedSoil.fertility.charAt(0).toUpperCase() + selectedSoil.fertility.slice(1)}
                  </span>
                </div>
              </div>
            </div>

            {/* Nutrients */}
            <div className="space-y-4">
              <h4 className="font-medium text-foreground flex items-center gap-2">
                🌿 Nutrient Levels
              </h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Nitrogen (N):</span>
                  <span className={`text-sm font-medium ${getFertilityColor(selectedSoil.nutrients.nitrogen)}`}>
                    {selectedSoil.nutrients.nitrogen.charAt(0).toUpperCase() + selectedSoil.nutrients.nitrogen.slice(1)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Phosphorus (P):</span>
                  <span className={`text-sm font-medium ${getFertilityColor(selectedSoil.nutrients.phosphorus)}`}>
                    {selectedSoil.nutrients.phosphorus.charAt(0).toUpperCase() + selectedSoil.nutrients.phosphorus.slice(1)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Potassium (K):</span>
                  <span className={`text-sm font-medium ${getFertilityColor(selectedSoil.nutrients.potassium)}`}>
                    {selectedSoil.nutrients.potassium.charAt(0).toUpperCase() + selectedSoil.nutrients.potassium.slice(1)}
                  </span>
                </div>
              </div>
            </div>

            {/* Best Crops */}
            <div className="space-y-4">
              <h4 className="font-medium text-foreground flex items-center gap-2">
                🌾 Best Crops
              </h4>
              <div className="flex flex-wrap gap-2">
                {selectedSoil.bestCrops.map((crop, idx) => (
                  <Badge key={idx} variant="secondary" className="text-xs">
                    {crop}
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          {/* Challenges and Recommendations */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <div className="space-y-3">
              <h4 className="font-medium text-foreground flex items-center gap-2">
                ⚠️ Challenges
              </h4>
              <ul className="space-y-1">
                {selectedSoil.challenges.map((challenge, idx) => (
                  <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                    <span className="text-red-500 mt-1">•</span>
                    {challenge}
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-3">
              <h4 className="font-medium text-foreground flex items-center gap-2">
                💡 Recommendations
              </h4>
              <ul className="space-y-1">
                {selectedSoil.recommendations.map((rec, idx) => (
                  <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                    <span className="text-green-500 mt-1">✓</span>
                    {rec}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

// Visual season selector
interface SeasonOption {
  value: string;
  icon: string;
  color: string;
  period: string;
  description: string;
  characteristics: {
    temperature: string;
    rainfall: string;
    humidity: string;
    soilCondition: string;
  };
  primaryCrops: string[];
  secondaryCrops: string[];
  advantages: string[];
  challenges: string[];
  bestPractices: string[];
  marketTrends: string;
}

const seasons: SeasonOption[] = [
  {
    value: 'kharif',
    icon: '🌧️',
    color: 'bg-blue-100 border-blue-300',
    period: 'June - October',
    description: 'Monsoon season with high rainfall and humidity',
    characteristics: {
      temperature: '25-35°C',
      rainfall: '600-1200mm',
      humidity: '70-90%',
      soilCondition: 'Moist and fertile'
    },
    primaryCrops: ['Rice', 'Cotton', 'Sugarcane', 'Maize', 'Soybean', 'Pulses'],
    secondaryCrops: ['Groundnut', 'Sesame', 'Bajra', 'Jowar', 'Tur Dal'],
    advantages: [
      'Natural rainfall reduces irrigation costs',
      'High soil moisture supports crop growth',
      'Good for water-intensive crops',
      'Lower pest incidence due to natural predators'
    ],
    challenges: [
      'Excess rainfall can cause flooding',
      'High humidity increases disease risk',
      'Difficulty in field operations during heavy rains',
      'Post-harvest drying challenges'
    ],
    bestPractices: [
      'Ensure proper field drainage',
      'Use disease-resistant varieties',
      'Plan timely sowing after first rains',
      'Monitor for pest and disease outbreaks'
    ],
    marketTrends: 'High demand for rice and cotton. Export opportunities for quality produce.'
  },
  {
    value: 'rabi',
    icon: '❄️',
    color: 'bg-cyan-100 border-cyan-300',
    period: 'November - April',
    description: 'Winter season with moderate temperatures and low rainfall',
    characteristics: {
      temperature: '10-25°C',
      rainfall: '50-200mm',
      humidity: '40-70%',
      soilCondition: 'Well-drained and cool'
    },
    primaryCrops: ['Wheat', 'Barley', 'Gram', 'Pea', 'Lentil', 'Mustard'],
    secondaryCrops: ['Potato', 'Onion', 'Garlic', 'Coriander', 'Cumin', 'Fenugreek'],
    advantages: [
      'Favorable temperature for crop growth',
      'Lower pest and disease pressure',
      'Good market prices for fresh produce',
      'Efficient water use through irrigation'
    ],
    challenges: [
      'Dependent on irrigation water',
      'Frost damage risk in northern regions',
      'Higher input costs for irrigation',
      'Competition for water resources'
    ],
    bestPractices: [
      'Efficient irrigation scheduling',
      'Use frost-resistant varieties in cold areas',
      'Proper soil preparation and fertilization',
      'Monitor soil moisture regularly'
    ],
    marketTrends: 'Strong demand for wheat and vegetables. Premium prices for organic produce.'
  },
  {
    value: 'zaid',
    icon: '☀️',
    color: 'bg-orange-100 border-orange-300',
    period: 'March - June',
    description: 'Summer season with high temperatures and minimal rainfall',
    characteristics: {
      temperature: '30-45°C',
      rainfall: '0-100mm',
      humidity: '20-50%',
      soilCondition: 'Dry and hot'
    },
    primaryCrops: ['Watermelon', 'Muskmelon', 'Cucumber', 'Fodder crops'],
    secondaryCrops: ['Maize', 'Sunflower', 'Moong Dal', 'Okra', 'Bottle Gourd'],
    advantages: [
      'High solar radiation for photosynthesis',
      'Low pest and disease incidence',
      'Good market demand for summer fruits',
      'Quick growing season for some crops'
    ],
    challenges: [
      'Extreme heat stress on crops',
      'High water requirement and irrigation costs',
      'Rapid soil moisture depletion',
      'Limited crop choices due to heat'
    ],
    bestPractices: [
      'Use heat-tolerant crop varieties',
      'Implement efficient drip irrigation',
      'Provide shade nets for sensitive crops',
      'Schedule irrigation during cooler hours'
    ],
    marketTrends: 'Premium prices for fresh fruits and vegetables. Growing demand for processed products.'
  }
];

interface VisualSeasonSelectorProps {
  selectedValue: string;
  onValueChange: (value: string, seasonData?: SeasonOption) => void;
}

export const VisualSeasonSelector: React.FC<VisualSeasonSelectorProps> = ({ selectedValue, onValueChange }) => {
  const { t } = useLanguage();
  const selectedSeason = seasons.find(season => season.value === selectedValue);
  
  const handleSeasonSelect = (season: SeasonOption) => {
    try {
      if (!season || !season.value) {
        console.warn('Invalid season selection:', season);
        return;
      }
      if (!season.primaryCrops || !Array.isArray(season.primaryCrops)) {
        console.warn('Season data missing primary crops:', season);
      }
      onValueChange(season.value, season);
    } catch (error) {
      console.error('Error in season selection:', error);
    }
  };
  
  return (
    <div className="space-y-6">
      <label className="block text-lg font-medium text-foreground mb-4 flex items-center gap-2">
        <span className="text-2xl">📅</span>
        Select Your Growing Season
      </label>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {seasons.map((season) => (
          <Card
            key={season.value}
            className={`relative cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-xl hover:-translate-y-1 ${
              selectedValue === season.value 
                ? `${season.color} border-2 ring-2 ring-primary shadow-lg scale-105` 
                : 'bg-card hover:bg-card-soft border border-border hover:border-primary/50'
            }`}
            onClick={() => handleSeasonSelect(season)}
          >
            <div className="p-6 text-center">
              <div className="text-5xl mb-3">{season.icon}</div>
              <div className="font-semibold text-lg mb-2 capitalize">{season.value}</div>
              <div className="text-sm text-muted-foreground mb-2">{season.period}</div>
              <Badge variant="secondary" className="text-xs">{season.description}</Badge>
              
              {selectedValue === season.value && (
                <div className="absolute -top-2 -right-2">
                  <CheckCircle className="w-6 h-6 text-success bg-white rounded-full" />
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>

      {/* Detailed Season Information */}
      {selectedSeason && (
        <Card className="p-6 mt-6">
          <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            {selectedSeason.icon} {selectedSeason.value.charAt(0).toUpperCase() + selectedSeason.value.slice(1)} Season Analysis
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Climate Characteristics */}
            <div className="space-y-4">
              <h4 className="font-medium text-foreground flex items-center gap-2">
                🌡️ Climate Characteristics
              </h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Temperature:</span>
                  <span className="text-sm font-medium">{selectedSeason.characteristics.temperature}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Rainfall:</span>
                  <span className="text-sm font-medium">{selectedSeason.characteristics.rainfall}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Humidity:</span>
                  <span className="text-sm font-medium">{selectedSeason.characteristics.humidity}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Soil Condition:</span>
                  <span className="text-sm font-medium">{selectedSeason.characteristics.soilCondition}</span>
                </div>
              </div>
            </div>

            {/* Primary Crops */}
            <div className="space-y-4">
              <h4 className="font-medium text-foreground flex items-center gap-2">
                🌾 Primary Crops
              </h4>
              <div className="flex flex-wrap gap-2">
                {selectedSeason.primaryCrops.map((crop, idx) => (
                  <Badge key={idx} variant="default" className="text-xs">
                    {crop}
                  </Badge>
                ))}
              </div>
              <h4 className="font-medium text-foreground flex items-center gap-2 mt-4">
                🌱 Secondary Crops
              </h4>
              <div className="flex flex-wrap gap-2">
                {selectedSeason.secondaryCrops.map((crop, idx) => (
                  <Badge key={idx} variant="secondary" className="text-xs">
                    {crop}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Market Trends */}
            <div className="space-y-4">
              <h4 className="font-medium text-foreground flex items-center gap-2">
                📈 Market Trends
              </h4>
              <p className="text-sm text-muted-foreground">{selectedSeason.marketTrends}</p>
            </div>
          </div>

          {/* Advantages and Challenges */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <div className="space-y-3">
              <h4 className="font-medium text-foreground flex items-center gap-2">
                ✅ Advantages
              </h4>
              <ul className="space-y-1">
                {selectedSeason.advantages.map((advantage, idx) => (
                  <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                    <span className="text-green-500 mt-1">✓</span>
                    {advantage}
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-3">
              <h4 className="font-medium text-foreground flex items-center gap-2">
                ⚠️ Challenges
              </h4>
              <ul className="space-y-1">
                {selectedSeason.challenges.map((challenge, idx) => (
                  <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                    <span className="text-red-500 mt-1">•</span>
                    {challenge}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Best Practices */}
          <div className="mt-6">
            <h4 className="font-medium text-foreground flex items-center gap-2 mb-3">
              💡 Best Practices
            </h4>
            <ul className="space-y-1">
              {selectedSeason.bestPractices.map((practice, idx) => (
                <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                  <span className="text-blue-500 mt-1">→</span>
                  {practice}
                </li>
              ))}
            </ul>
          </div>
        </Card>
      )}
    </div>
  );
};

// Visual crop selector
interface CropOption {
  value: string;
  icon: string;
  name: string;
  category: string;
  seasons: string[];
  profitLevel: 'Low' | 'Medium' | 'High';
  waterRequirement: 'Low' | 'Medium' | 'High';
  soilTypes: string[];
  growingPeriod: string;
  yieldPotential: string;
  marketDemand: 'Low' | 'Medium' | 'High';
  description: string;
  advantages: string[];
  challenges: string[];
  bestPractices: string[];
  nutritionalValue?: string;
  storageLife?: string;
}

const popularCrops: CropOption[] = [
  {
    value: 'rice',
    icon: '🌾',
    name: 'Rice',
    category: 'Cereal',
    seasons: ['Kharif'],
    profitLevel: 'Medium',
    waterRequirement: 'High',
    soilTypes: ['clayey', 'loamy', 'alluvial'],
    growingPeriod: '120-150 days',
    yieldPotential: '3-6 tons/hectare',
    marketDemand: 'High',
    description: 'Staple food crop with high water requirement, grown mainly in monsoon season',
    advantages: ['Stable market demand', 'Government support available', 'Multiple varieties available', 'Good for food security'],
    challenges: ['High water requirement', 'Pest and disease susceptibility', 'Market price fluctuations', 'Labor intensive'],
    bestPractices: ['Use certified seeds', 'Proper water management', 'Integrated pest management', 'Timely transplanting'],
    nutritionalValue: 'Rich in carbohydrates, provides energy and essential nutrients',
    storageLife: '12-18 months when properly stored'
  },
  {
    value: 'wheat',
    icon: '🌾',
    name: 'Wheat',
    category: 'Cereal',
    seasons: ['Rabi'],
    profitLevel: 'Medium',
    waterRequirement: 'Medium',
    soilTypes: ['loamy', 'clayey', 'sandy'],
    growingPeriod: '120-150 days',
    yieldPotential: '3-5 tons/hectare',
    marketDemand: 'High',
    description: 'Winter cereal crop with moderate water requirement and stable market demand',
    advantages: ['Stable market prices', 'Government procurement', 'Lower pest issues', 'Good storage life'],
    challenges: ['Requires irrigation', 'Sensitive to heat', 'Storage pest issues', 'Quality concerns'],
    bestPractices: ['Timely sowing', 'Balanced fertilization', 'Weed management', 'Proper harvesting time'],
    nutritionalValue: 'High in protein, carbohydrates, and essential amino acids',
    storageLife: '24 months when properly stored'
  },
  {
    value: 'cotton',
    icon: '🤍',
    name: 'Cotton',
    category: 'Cash Crop',
    seasons: ['Kharif'],
    profitLevel: 'High',
    waterRequirement: 'High',
    soilTypes: ['black', 'red', 'sandy'],
    growingPeriod: '180-200 days',
    yieldPotential: '2-4 tons/hectare',
    marketDemand: 'High',
    description: 'Important cash crop for textile industry with high profit potential',
    advantages: ['High market value', 'Export potential', 'Byproducts utilization', 'Long market demand'],
    challenges: ['High input costs', 'Pest attacks', 'Weather dependency', 'Quality requirements'],
    bestPractices: ['IPM practices', 'Timely irrigation', 'Quality seed selection', 'Proper spacing'],
    nutritionalValue: 'Cottonseed oil and cake for livestock feed',
    storageLife: '2-3 years when properly stored'
  },
  {
    value: 'sugarcane',
    icon: '🎋',
    name: 'Sugarcane',
    category: 'Cash Crop',
    seasons: ['Year-round'],
    profitLevel: 'High',
    waterRequirement: 'High',
    soilTypes: ['loamy', 'clayey', 'alluvial'],
    growingPeriod: '10-18 months',
    yieldPotential: '70-100 tons/hectare',
    marketDemand: 'High',
    description: 'Long-duration cash crop with guaranteed market through sugar mills',
    advantages: ['Assured market', 'High returns', 'Multiple harvests', 'Government support'],
    challenges: ['High water requirement', 'Long duration', 'Pest and diseases', 'Transportation issues'],
    bestPractices: ['Drip irrigation', 'Disease-free setts', 'Proper fertilization', 'Timely harvest'],
    nutritionalValue: 'Source of sugar, jaggery, and ethanol',
    storageLife: 'Fresh consumption, processed products have longer shelf life'
  },
  {
    value: 'maize',
    icon: '🌽',
    name: 'Maize',
    category: 'Cereal',
    seasons: ['Kharif', 'Rabi'],
    profitLevel: 'Medium',
    waterRequirement: 'Medium',
    soilTypes: ['loamy', 'sandy', 'red'],
    growingPeriod: '90-120 days',
    yieldPotential: '4-8 tons/hectare',
    marketDemand: 'High',
    description: 'Versatile crop for food, feed, and industrial use with good adaptability',
    advantages: ['Dual season crop', 'Multiple uses', 'Good market demand', 'Relatively short duration'],
    challenges: ['Pest attacks', 'Storage issues', 'Price fluctuations', 'Weather sensitivity'],
    bestPractices: ['Hybrid varieties', 'Balanced nutrition', 'Pest monitoring', 'Proper drying'],
    nutritionalValue: 'Rich in carbohydrates, protein, and essential nutrients',
    storageLife: '6-12 months when properly dried and stored'
  },
  {
    value: 'soybean',
    icon: '🫘',
    season: 'Kharif',
    profitLevel: 'Medium'
  },
  {
    value: 'tomato',
    icon: '🍅',
    season: 'Year-round',
    profitLevel: 'High'
  },
  {
    value: 'potato',
    icon: '🥔',
    season: 'Rabi',
    profitLevel: 'Medium'
  },
  {
    value: 'onion',
    icon: '🧅',
    season: 'Rabi',
    profitLevel: 'High'
  }
];

interface VisualCropSelectorProps {
  selectedValues: string[];
  onValueChange: (values: string[], cropData?: CropOption[]) => void;
  maxSelections?: number;
  filterBySeason?: string;
  filterBySoilType?: string;
  filterByWaterSource?: string;
}

export const VisualCropSelector: React.FC<VisualCropSelectorProps> = ({ 
  selectedValues, 
  onValueChange, 
  maxSelections = 5,
  filterBySeason,
  filterBySoilType,
  filterByWaterSource
}) => {
  const { t } = useLanguage();
  
  // Filter crops based on user selections
  const filteredCrops = popularCrops.filter(crop => {
    if (filterBySeason && crop.seasons && !crop.seasons.some(season => 
      season.toLowerCase().includes(filterBySeason.toLowerCase()) || filterBySeason.toLowerCase().includes(season.toLowerCase())
    )) return false;
    
    if (filterBySoilType && crop.soilTypes && !crop.soilTypes.includes(filterBySoilType)) return false;
    
    return true;
  });
  
  const handleCropToggle = (crop: CropOption) => {
    try {
      if (!crop || !crop.value) {
        console.warn('Invalid crop selection:', crop);
        return;
      }
      
      if (!Array.isArray(selectedValues)) {
        console.error('selectedValues must be an array:', selectedValues);
        return;
      }
      
      let newValues;
      if (selectedValues.includes(crop.value)) {
        newValues = selectedValues.filter(v => v !== crop.value);
      } else if (selectedValues.length < maxSelections) {
        newValues = [...selectedValues, crop.value];
      } else {
        return; // Don't add if at max selections
      }
      
      const selectedCropData = newValues.map(value => 
        popularCrops.find(c => c.value === value)
      ).filter(Boolean) as CropOption[];
      
      if (selectedCropData.length !== newValues.length) {
        console.warn('Some selected crop values could not be found in crop data');
      }
      
      onValueChange(newValues, selectedCropData);
    } catch (error) {
      console.error('Error in crop selection:', error);
    }
  };

  const getProfitColor = (level: string) => {
    switch (level) {
      case 'High': return 'text-green-600';
      case 'Medium': return 'text-yellow-600';
      case 'Low': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getWaterColor = (requirement: string) => {
    switch (requirement) {
      case 'High': return 'text-blue-600';
      case 'Medium': return 'text-blue-400';
      case 'Low': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <label className="block text-lg font-medium text-foreground flex items-center gap-2">
          <span className="text-2xl">🌾</span>
          Select Crops of Interest ({selectedValues.length}/{maxSelections})
        </label>
        {(filterBySeason || filterBySoilType) && (
          <div className="text-sm text-muted-foreground">
            Showing {filteredCrops.length} relevant crops
          </div>
        )}
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
        {filteredCrops.map((crop) => {
          const isSelected = selectedValues.includes(crop.value);
          const isDisabled = !isSelected && selectedValues.length >= maxSelections;
          
          return (
            <Card
              key={crop.value}
              className={`relative cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-xl hover:-translate-y-1 ${
                isSelected 
                  ? 'bg-primary/10 border-2 border-primary ring-2 ring-primary/20 shadow-lg scale-105' 
                  : isDisabled
                    ? 'bg-muted/50 border border-muted cursor-not-allowed opacity-60 hover:scale-100 hover:shadow-none hover:translate-y-0'
                    : 'bg-card hover:bg-card-soft border border-border hover:border-primary/50'
              }`}
              onClick={() => !isDisabled && handleCropToggle(crop)}
            >
              <div className="p-4 text-center">
                <div className="text-3xl mb-2">{crop.icon}</div>
                <div className="font-medium text-sm mb-1">
                  {crop.name || crop.value.charAt(0).toUpperCase() + crop.value.slice(1)}
                </div>
                <div className="text-xs text-muted-foreground mb-2">
                  {crop.category || 'Crop'}
                </div>
                <div className="flex flex-col gap-1">
                  {crop.seasons && (
                    <Badge variant="outline" className="text-xs">
                      {crop.seasons.join('/')}
                    </Badge>
                  )}
                  <div className={`text-xs font-medium ${getProfitColor(crop.profitLevel)}`}>
                    {crop.profitLevel} Profit
                  </div>
                  {crop.waterRequirement && (
                    <div className={`text-xs ${getWaterColor(crop.waterRequirement)}`}>
                      {crop.waterRequirement} Water
                    </div>
                  )}
                </div>
                
                {isSelected && (
                  <div className="absolute -top-2 -right-2">
                    <CheckCircle className="w-6 h-6 text-primary bg-white rounded-full" />
                  </div>
                )}
              </div>
            </Card>
          );
        })}
      </div>
      
      {selectedValues.length > 0 && (
        <Card className="p-4 bg-primary/5">
          <div className="text-sm font-medium text-foreground mb-3">Selected Crops Summary:</div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="text-xs font-medium text-muted-foreground mb-2">Crop Selection:</div>
              <div className="flex flex-wrap gap-2">
                {selectedValues.map((value) => {
                  const crop = popularCrops.find(c => c.value === value);
                  return crop ? (
                    <Badge key={value} className="bg-primary/10 text-primary">
                      {crop.icon} {crop.name || crop.value}
                    </Badge>
                  ) : null;
                })}
              </div>
            </div>
            <div>
              <div className="text-xs font-medium text-muted-foreground mb-2">Quick Stats:</div>
              <div className="text-xs space-y-1">
                <div>Categories: {Array.from(new Set(selectedValues.map(v => {
                  const crop = popularCrops.find(c => c.value === v);
                  return crop?.category || 'Unknown';
                }).filter(Boolean))).join(', ')}</div>
                <div>Seasons: {Array.from(new Set(selectedValues.flatMap(v => {
                  const crop = popularCrops.find(c => c.value === v);
                  return crop?.seasons || [];
                }))).join(', ')}</div>
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

// Visual water availability selector
interface WaterOption {
  value: string;
  icon: string;
  color: string;
  name: string;
  description: string;
  characteristics: {
    reliability: string;
    cost: string;
    maintenance: string;
    waterQuality: string;
    availability: string;
  };
  suitableCrops: string[];
  advantages: string[];
  challenges: string[];
  bestPractices: string[];
  waterEfficiency: string;
  investmentRequired: string;
}

const waterOptions: WaterOption[] = [
  {
    value: 'rainwater',
    icon: '🌧️',
    color: 'bg-blue-100 border-blue-300',
    name: 'Rainwater Dependent',
    description: 'Crops dependent on natural rainfall for water needs',
    characteristics: {
      reliability: 'Variable',
      cost: 'Very Low',
      maintenance: 'Minimal',
      waterQuality: 'Good',
      availability: 'Seasonal'
    },
    suitableCrops: ['Rice', 'Cotton', 'Maize', 'Soybean', 'Groundnut', 'Sorghum'],
    advantages: [
      'Zero water cost',
      'Natural and pure water source',
      'No infrastructure required',
      'Environmentally sustainable'
    ],
    challenges: [
      'Dependent on monsoon patterns',
      'Risk of drought or excess rainfall',
      'Limited crop choices',
      'Uncertain timing and quantity'
    ],
    bestPractices: [
      'Choose drought-resistant varieties',
      'Implement rainwater harvesting',
      'Use mulching to retain soil moisture',
      'Plan backup irrigation systems'
    ],
    waterEfficiency: 'Variable (depends on rainfall)',
    investmentRequired: 'Minimal'
  },
  {
    value: 'well',
    icon: '🪣',
    color: 'bg-cyan-100 border-cyan-300',
    name: 'Open Well',
    description: 'Traditional open wells drawing groundwater',
    characteristics: {
      reliability: 'Moderate',
      cost: 'Low to Medium',
      maintenance: 'Moderate',
      waterQuality: 'Good',
      availability: 'Year-round (if water table adequate)'
    },
    suitableCrops: ['Vegetables', 'Wheat', 'Barley', 'Gram', 'Mustard', 'Fodder crops'],
    advantages: [
      'Reliable water source in good water table areas',
      'Lower operating costs than borewells',
      'Easy to maintain and repair',
      'Can serve multiple purposes'
    ],
    challenges: [
      'Dependent on groundwater levels',
      'Risk of water table depletion',
      'Contamination risk during monsoon',
      'Limited capacity for large-scale irrigation'
    ],
    bestPractices: [
      'Regular cleaning and maintenance',
      'Install proper covers to prevent contamination',
      'Monitor water quality regularly',
      'Use efficient irrigation methods'
    ],
    waterEfficiency: '60-70%',
    investmentRequired: 'Low to Medium'
  },
  {
    value: 'borewell',
    icon: '🚰',
    color: 'bg-teal-100 border-teal-300'
  },
  {
    value: 'canal',
    icon: '🌊',
    color: 'bg-blue-100 border-blue-400'
  },
  {
    value: 'drip',
    icon: '💧',
    color: 'bg-green-100 border-green-300'
  }
];

interface VisualWaterSelectorProps {
  selectedValue: string;
  onValueChange: (value: string, waterData?: WaterOption) => void;
}

export const VisualWaterSelector: React.FC<VisualWaterSelectorProps> = ({ selectedValue, onValueChange }) => {
  const { t } = useLanguage();
  const selectedWater = waterOptions.find(water => water.value === selectedValue);
  
  const handleWaterSelect = (water: WaterOption) => {
    try {
      if (!water || !water.value) {
        console.warn('Invalid water source selection:', water);
        return;
      }
      if (!water.name && !water.value) {
        console.warn('Water source missing name and value:', water);
      }
      onValueChange(water.value, water);
    } catch (error) {
      console.error('Error in water source selection:', error);
    }
  };

  const getReliabilityColor = (reliability: string) => {
    switch (reliability?.toLowerCase()) {
      case 'very high': return 'text-green-600';
      case 'high': return 'text-blue-600';
      case 'moderate': return 'text-yellow-600';
      case 'variable': return 'text-orange-600';
      default: return 'text-gray-600';
    }
  };

  const getCostColor = (cost: string) => {
    switch (cost?.toLowerCase()) {
      case 'very low': return 'text-green-600';
      case 'low': return 'text-blue-600';
      case 'medium': return 'text-yellow-600';
      case 'medium to high': return 'text-orange-600';
      case 'high': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };
  
  return (
    <div className="space-y-6">
      <label className="block text-lg font-medium text-foreground mb-4 flex items-center gap-2">
        <span className="text-2xl">💧</span>
        Select Your Water Source
      </label>
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {waterOptions.map((water) => (
          <Card
            key={water.value}
            className={`relative cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-xl hover:-translate-y-1 ${
              selectedValue === water.value 
                ? `${water.color} border-2 ring-2 ring-primary shadow-lg scale-105` 
                : 'bg-card hover:bg-card-soft border border-border hover:border-primary/50'
            }`}
            onClick={() => handleWaterSelect(water)}
          >
            <div className="p-4 text-center">
              <div className="text-4xl mb-2">{water.icon}</div>
              <div className="font-medium text-sm mb-1 capitalize">
                {water.name || water.value.replace('_', ' ')}
              </div>
              <div className="text-xs text-muted-foreground mb-2">
                {water.description || `${water.value} irrigation system`}
              </div>
              {water.waterEfficiency && (
                <Badge variant="secondary" className="text-xs">
                  {water.waterEfficiency} efficient
                </Badge>
              )}
              
              {selectedValue === water.value && (
                <div className="absolute -top-2 -right-2">
                  <CheckCircle className="w-6 h-6 text-success bg-white rounded-full" />
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>

      {/* Detailed Water Source Information */}
      {selectedWater && selectedWater.characteristics && (
        <Card className="p-6 mt-6">
          <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            {selectedWater.icon} {selectedWater.name || selectedWater.value.charAt(0).toUpperCase() + selectedWater.value.slice(1)} Analysis
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Water Characteristics */}
            <div className="space-y-4">
              <h4 className="font-medium text-foreground flex items-center gap-2">
                📊 Water Characteristics
              </h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Reliability:</span>
                  <span className={`text-sm font-medium ${getReliabilityColor(selectedWater.characteristics.reliability)}`}>
                    {selectedWater.characteristics.reliability}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Cost:</span>
                  <span className={`text-sm font-medium ${getCostColor(selectedWater.characteristics.cost)}`}>
                    {selectedWater.characteristics.cost}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Maintenance:</span>
                  <span className="text-sm font-medium">{selectedWater.characteristics.maintenance}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Water Quality:</span>
                  <span className="text-sm font-medium">{selectedWater.characteristics.waterQuality}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Availability:</span>
                  <span className="text-sm font-medium">{selectedWater.characteristics.availability}</span>
                </div>
              </div>
            </div>

            {/* Suitable Crops */}
            <div className="space-y-4">
              <h4 className="font-medium text-foreground flex items-center gap-2">
                🌾 Suitable Crops
              </h4>
              <div className="flex flex-wrap gap-2">
                {selectedWater.suitableCrops?.map((crop, idx) => (
                  <Badge key={idx} variant="default" className="text-xs">
                    {crop}
                  </Badge>
                )) || <span className="text-sm text-muted-foreground">All crops</span>}
              </div>
            </div>

            {/* Efficiency & Investment */}
            <div className="space-y-4">
              <h4 className="font-medium text-foreground flex items-center gap-2">
                💰 Economics
              </h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Water Efficiency:</span>
                  <span className="text-sm font-medium text-blue-600">{selectedWater.waterEfficiency}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Investment Required:</span>
                  <span className={`text-sm font-medium ${getCostColor(selectedWater.investmentRequired)}`}>
                    {selectedWater.investmentRequired}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Advantages and Challenges */}
          {(selectedWater.advantages || selectedWater.challenges) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              {selectedWater.advantages && (
                <div className="space-y-3">
                  <h4 className="font-medium text-foreground flex items-center gap-2">
                    ✅ Advantages
                  </h4>
                  <ul className="space-y-1">
                    {selectedWater.advantages.map((advantage, idx) => (
                      <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                        <span className="text-green-500 mt-1">✓</span>
                        {advantage}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {selectedWater.challenges && (
                <div className="space-y-3">
                  <h4 className="font-medium text-foreground flex items-center gap-2">
                    ⚠️ Challenges
                  </h4>
                  <ul className="space-y-1">
                    {selectedWater.challenges.map((challenge, idx) => (
                      <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                        <span className="text-red-500 mt-1">•</span>
                        {challenge}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Best Practices */}
          {selectedWater.bestPractices && (
            <div className="mt-6">
              <h4 className="font-medium text-foreground flex items-center gap-2 mb-3">
                💡 Best Practices
              </h4>
              <ul className="space-y-1">
                {selectedWater.bestPractices.map((practice, idx) => (
                  <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                    <span className="text-blue-500 mt-1">→</span>
                    {practice}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </Card>
      )}
    </div>
  );
};