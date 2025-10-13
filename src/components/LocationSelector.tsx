import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  MapPin, 
  Search, 
  Navigation, 
  CheckCircle,
  Thermometer,
  Droplets,
  Wind,
  Eye,
  Sun,
  Cloud
} from 'lucide-react';

interface LocationData {
  name: string;
  state: string;
  coordinates: {
    lat: number;
    lon: number;
  };
  popular: boolean;
}

interface WeatherData {
  location: string;
  temperature: number;
  humidity: number;
  description: string;
  windSpeed: number;
  visibility: number;
  pressure: number;
  feelsLike: number;
}

interface FarmingAreaData extends LocationData {
  primaryCrops: string[];
  soilTypes: string[];
  averageRainfall: number;
  bestSeasons: string[];
  irrigationAvailability: string;
  marketAccess: string;
  agriInfrastructure: string;
  specialFeatures: string[];
}

// Comprehensive farming locations with detailed agricultural data
const popularLocations: FarmingAreaData[] = [
  {
    name: 'Pune',
    state: 'Maharashtra',
    coordinates: { lat: 18.5204, lon: 73.8567 },
    popular: true,
    primaryCrops: ['Sugarcane', 'Cotton', 'Wheat', 'Soybean', 'Onion'],
    soilTypes: ['black', 'red', 'loamy'],
    averageRainfall: 650,
    bestSeasons: ['kharif', 'rabi'],
    irrigationAvailability: 'Good - Canal & Bore wells',
    marketAccess: 'Excellent - APMC, Export hubs',
    agriInfrastructure: 'Advanced - Cold storage, Processing units',
    specialFeatures: ['IT-enabled farming', 'Organic farming initiatives', 'Cooperative societies']
  },
  {
    name: 'Ludhiana',
    state: 'Punjab',
    coordinates: { lat: 30.9010, lon: 75.8573 },
    popular: true,
    primaryCrops: ['Wheat', 'Rice', 'Maize', 'Cotton', 'Sugarcane'],
    soilTypes: ['alluvial', 'loamy'],
    averageRainfall: 750,
    bestSeasons: ['rabi', 'kharif'],
    irrigationAvailability: 'Excellent - Canal system',
    marketAccess: 'Very Good - Grain markets, MSP centers',
    agriInfrastructure: 'Excellent - Mechanized farming, Storage',
    specialFeatures: ['Green Revolution hub', 'High mechanization', 'Research centers']
  },
  {
    name: 'Indore',
    state: 'Madhya Pradesh',
    coordinates: { lat: 22.7196, lon: 75.8577 },
    popular: true,
    primaryCrops: ['Soybean', 'Wheat', 'Cotton', 'Chilli', 'Onion'],
    soilTypes: ['black', 'mixed'],
    averageRainfall: 950,
    bestSeasons: ['kharif', 'rabi'],
    irrigationAvailability: 'Moderate - Tube wells',
    marketAccess: 'Good - Commercial center, APMC',
    agriInfrastructure: 'Good - Processing units, Transport',
    specialFeatures: ['Soybean capital', 'Contract farming', 'Agri-exports']
  },
  {
    name: 'Nagpur',
    state: 'Maharashtra',
    coordinates: { lat: 21.1458, lon: 79.0882 },
    popular: true,
    primaryCrops: ['Cotton', 'Orange', 'Soybean', 'Wheat', 'Gram'],
    soilTypes: ['black', 'red'],
    averageRainfall: 1200,
    bestSeasons: ['kharif', 'rabi'],
    irrigationAvailability: 'Moderate - Tank irrigation',
    marketAccess: 'Good - Central location, Rail connectivity',
    agriInfrastructure: 'Good - Orange processing, Cotton ginning',
    specialFeatures: ['Orange cultivation', 'Cotton belt', 'Organic farming']
  },
  {
    name: 'Coimbatore',
    state: 'Tamil Nadu',
    coordinates: { lat: 11.0168, lon: 76.9558 },
    popular: true,
    primaryCrops: ['Cotton', 'Maize', 'Sugarcane', 'Coconut', 'Turmeric'],
    soilTypes: ['red', 'black', 'alluvial'],
    averageRainfall: 600,
    bestSeasons: ['kharif', 'summer'],
    irrigationAvailability: 'Good - River & bore wells',
    marketAccess: 'Excellent - Textile hub, Export facilities',
    agriInfrastructure: 'Very Good - Textile mills, Agri-tech',
    specialFeatures: ['Textile capital', 'Drip irrigation', 'Value-added agriculture']
  },
  {
    name: 'Jaipur',
    state: 'Rajasthan',
    coordinates: { lat: 26.9124, lon: 75.7873 },
    popular: true,
    primaryCrops: ['Bajra', 'Wheat', 'Mustard', 'Gram', 'Barley'],
    soilTypes: ['sandy', 'loamy'],
    averageRainfall: 550,
    bestSeasons: ['rabi', 'zaid'],
    irrigationAvailability: 'Limited - Tube wells, Canals',
    marketAccess: 'Good - State capital, Road connectivity',
    agriInfrastructure: 'Moderate - Storage, Rural markets',
    specialFeatures: ['Drought-resistant crops', 'Water conservation', 'Desert agriculture']
  },
  {
    name: 'Hyderabad',
    state: 'Telangana',
    coordinates: { lat: 17.3850, lon: 78.4867 },
    popular: true,
    primaryCrops: ['Rice', 'Cotton', 'Maize', 'Sugarcane', 'Chilli'],
    soilTypes: ['red', 'black'],
    averageRainfall: 800,
    bestSeasons: ['kharif', 'rabi'],
    irrigationAvailability: 'Good - Major irrigation projects',
    marketAccess: 'Excellent - IT hub, International airport',
    agriInfrastructure: 'Very Good - Modern facilities, Research',
    specialFeatures: ['Tech-enabled farming', 'Seed hub', 'Biotechnology research']
  },
  {
    name: 'Ahmedabad',
    state: 'Gujarat',
    coordinates: { lat: 23.0225, lon: 72.5714 },
    popular: true,
    primaryCrops: ['Cotton', 'Groundnut', 'Wheat', 'Castor', 'Fennel'],
    soilTypes: ['alluvial', 'black'],
    averageRainfall: 850,
    bestSeasons: ['kharif', 'rabi'],
    irrigationAvailability: 'Very Good - Narmada canal',
    marketAccess: 'Excellent - Commercial capital, Ports',
    agriInfrastructure: 'Excellent - Cooperative model, Processing',
    specialFeatures: ['Cooperative success', 'Cash crops', 'Export-oriented']
  },
  {
    name: 'Patna',
    state: 'Bihar',
    coordinates: { lat: 25.5941, lon: 85.1376 },
    popular: true,
    primaryCrops: ['Rice', 'Wheat', 'Maize', 'Sugarcane', 'Potato'],
    soilTypes: ['alluvial', 'clay'],
    averageRainfall: 1100,
    bestSeasons: ['kharif', 'rabi'],
    irrigationAvailability: 'Good - River systems, Tube wells',
    marketAccess: 'Moderate - River transport, Rail',
    agriInfrastructure: 'Developing - Storage facilities',
    specialFeatures: ['Fertile alluvial soil', 'Multiple cropping', 'River valley agriculture']
  },
  {
    name: 'Bhopal',
    state: 'Madhya Pradesh',
    coordinates: { lat: 23.2599, lon: 77.4126 },
    popular: true,
    primaryCrops: ['Soybean', 'Wheat', 'Gram', 'Mustard', 'Pea'],
    soilTypes: ['black', 'mixed'],
    averageRainfall: 1150,
    bestSeasons: ['kharif', 'rabi'],
    irrigationAvailability: 'Moderate - Tanks, Tube wells',
    marketAccess: 'Good - State capital, Central location',
    agriInfrastructure: 'Good - Government support, Research',
    specialFeatures: ['Government schemes', 'Mixed farming', 'Pulse production']
  }
];

// Major states with comprehensive agricultural information
const majorStates = [
  { 
    name: 'Punjab', 
    code: 'PB', 
    crops: 'Wheat, Rice, Cotton, Maize', 
    soilType: 'Alluvial', 
    rainfall: '600-750mm',
    irrigation: 'Excellent',
    speciality: 'Food grain production'
  },
  { 
    name: 'Haryana', 
    code: 'HR', 
    crops: 'Wheat, Rice, Cotton, Sugarcane', 
    soilType: 'Alluvial', 
    rainfall: '550-650mm',
    irrigation: 'Very Good',
    speciality: 'Green Revolution state'
  },
  { 
    name: 'Uttar Pradesh', 
    code: 'UP', 
    crops: 'Sugarcane, Wheat, Rice, Potato', 
    soilType: 'Alluvial', 
    rainfall: '1000-1200mm',
    irrigation: 'Good',
    speciality: 'Largest agricultural state'
  },
  { 
    name: 'Maharashtra', 
    code: 'MH', 
    crops: 'Cotton, Sugarcane, Soybean, Onion', 
    soilType: 'Black, Red', 
    rainfall: '600-1200mm',
    irrigation: 'Moderate',
    speciality: 'Cash crop leader'
  },
  { 
    name: 'Karnataka', 
    code: 'KA', 
    crops: 'Coffee, Rice, Cotton, Sugarcane', 
    soilType: 'Red, Black', 
    rainfall: '500-1400mm',
    irrigation: 'Good',
    speciality: 'Coffee & spice production'
  },
  { 
    name: 'Andhra Pradesh', 
    code: 'AP', 
    crops: 'Rice, Cotton, Groundnut, Chilli', 
    soilType: 'Red, Black', 
    rainfall: '900-1100mm',
    irrigation: 'Good',
    speciality: 'Spice & aquaculture hub'
  },
  { 
    name: 'Tamil Nadu', 
    code: 'TN', 
    crops: 'Rice, Sugarcane, Cotton, Groundnut', 
    soilType: 'Red, Black, Alluvial', 
    rainfall: '900-1200mm',
    irrigation: 'Good',
    speciality: 'Delta agriculture'
  },
  { 
    name: 'Gujarat', 
    code: 'GJ', 
    crops: 'Cotton, Groundnut, Wheat, Castor', 
    soilType: 'Alluvial, Black', 
    rainfall: '500-1000mm',
    irrigation: 'Excellent',
    speciality: 'Cooperative model success'
  },
  { 
    name: 'Rajasthan', 
    code: 'RJ', 
    crops: 'Bajra, Wheat, Mustard, Gram', 
    soilType: 'Sandy, Desert', 
    rainfall: '100-700mm',
    irrigation: 'Limited',
    speciality: 'Desert agriculture'
  },
  { 
    name: 'Madhya Pradesh', 
    code: 'MP', 
    crops: 'Soybean, Wheat, Cotton, Gram', 
    soilType: 'Black, Mixed', 
    rainfall: '800-1400mm',
    irrigation: 'Moderate',
    speciality: 'Soybean bowl of India'
  }
];

interface LocationSelectorProps {
  selectedLocation: string;
  onLocationChange: (location: string, coordinates?: { lat: number; lon: number }, farmingData?: FarmingAreaData) => void;
  onWeatherUpdate?: (weather: WeatherData) => void;
  onFarmingDataUpdate?: (data: FarmingAreaData | null) => void;
  showWeather?: boolean;
}

export const LocationSelector: React.FC<LocationSelectorProps> = ({
  selectedLocation,
  onLocationChange,
  onWeatherUpdate,
  onFarmingDataUpdate,
  showWeather = true
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredLocations, setFilteredLocations] = useState<FarmingAreaData[]>(popularLocations);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [weatherLoading, setWeatherLoading] = useState(false);

  // Get farming data for a specific location
  const getFarmingDataForLocation = (locationName: string): FarmingAreaData | null => {
    return popularLocations.find(loc => 
      loc.name.toLowerCase().includes(locationName.toLowerCase()) ||
      locationName.toLowerCase().includes(loc.name.toLowerCase())
    ) || null;
  };

  // Filter locations based on search query
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredLocations(popularLocations);
    } else {
      const filtered = popularLocations.filter(location =>
        location.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        location.state.toLowerCase().includes(searchQuery.toLowerCase()) ||
        location.primaryCrops.some(crop => crop.toLowerCase().includes(searchQuery.toLowerCase()))
      );
      setFilteredLocations(filtered);
    }
  }, [searchQuery]);

  // Update farming data when location changes
  useEffect(() => {
    if (selectedLocation && onFarmingDataUpdate) {
      const farmingData = getFarmingDataForLocation(selectedLocation);
      onFarmingDataUpdate(farmingData);
    }
  }, [selectedLocation, onFarmingDataUpdate]);

  // Get user's current location
  const getCurrentLocation = () => {
    setIsGettingLocation(true);
    
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by this browser.');
      setIsGettingLocation(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        
        try {
          // Reverse geocoding to get location name
          const response = await fetch(
            `https://api.openweathermap.org/geo/1.0/reverse?lat=${latitude}&lon=${longitude}&appid=${import.meta.env.VITE_OPENWEATHER_API_KEY}`
          );
          
          if (response.ok) {
            const data = await response.json();
            if (data.length > 0) {
              const locationName = `${data[0].name}, ${data[0].state || data[0].country}`;
              onLocationChange(locationName, { lat: latitude, lon: longitude });
              
              if (showWeather) {
                fetchWeather(latitude, longitude);
              }
            }
          }
        } catch (error) {
          console.error('Error getting location details:', error);
          onLocationChange(`Location (${latitude.toFixed(2)}, ${longitude.toFixed(2)})`, 
            { lat: latitude, lon: longitude });
        }
        
        setIsGettingLocation(false);
      },
      (error) => {
        console.error('Error getting location:', error);
        alert('Unable to get your location. Please select manually.');
        setIsGettingLocation(false);
      }
    );
  };

  // Fetch weather data
  const fetchWeather = async (lat: number, lon: number) => {
    if (!showWeather) return;
    
    setWeatherLoading(true);
    try {
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${import.meta.env.VITE_OPENWEATHER_API_KEY}&units=metric`
      );
      
      if (response.ok) {
        const data = await response.json();
        const weatherData: WeatherData = {
          location: data.name,
          temperature: Math.round(data.main.temp),
          humidity: data.main.humidity,
          description: data.weather[0].description,
          windSpeed: Math.round(data.wind?.speed * 3.6 || 0),
          visibility: Math.round((data.visibility || 10000) / 1000),
          pressure: data.main.pressure,
          feelsLike: Math.round(data.main.feels_like)
        };
        
        setWeather(weatherData);
        onWeatherUpdate?.(weatherData);
      }
    } catch (error) {
      console.error('Error fetching weather:', error);
    } finally {
      setWeatherLoading(false);
    }
  };

  const handleLocationSelect = (location: FarmingAreaData) => {
    try {
      if (!location) {
        console.warn('Invalid location selection:', location);
        return;
      }
      
      if (!location.name || !location.state) {
        console.warn('Location missing required fields:', location);
        return;
      }
      
      if (!location.coordinates || typeof location.coordinates.lat !== 'number' || typeof location.coordinates.lon !== 'number') {
        console.warn('Location missing valid coordinates:', location);
        onLocationChange(`${location.name}, ${location.state}`, undefined, location);
        return;
      }
      
      onLocationChange(`${location.name}, ${location.state}`, location.coordinates, location);
      if (showWeather) {
        fetchWeather(location.coordinates.lat, location.coordinates.lon);
      }
    } catch (error) {
      console.error('Error in location selection:', error);
    }
  };

  const handleManualSearch = () => {
    try {
      if (!searchQuery.trim()) {
        console.warn('Empty search query');
        return;
      }
      
      if (searchQuery.trim().length < 2) {
        console.warn('Search query too short:', searchQuery);
        return;
      }
      
      const farmingData = getFarmingDataForLocation(searchQuery.trim());
      onLocationChange(searchQuery.trim(), undefined, farmingData);
    } catch (error) {
      console.error('Error in manual search:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Location Input Header */}
      <div className="text-center">
        <h3 className="text-xl font-semibold text-foreground mb-2 flex items-center justify-center gap-2">
          <MapPin className="w-6 h-6 text-primary" />
          Select Location
        </h3>
        <p className="text-muted-foreground">
          Select your location for accurate weather information
        </p>
      </div>

      {/* Location Search */}
      <Card className="earth-card p-6">
        <div className="space-y-4">
          {/* Search Input */}
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search city name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
                onKeyPress={(e) => e.key === 'Enter' && handleManualSearch()}
              />
            </div>
            <Button variant="outline" onClick={handleManualSearch}>
              <Search className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              onClick={getCurrentLocation}
              disabled={isGettingLocation}
              className="flex items-center gap-2"
            >
              <Navigation className={`w-4 h-4 ${isGettingLocation ? 'animate-spin' : ''}`} />
              GPS
            </Button>
          </div>

          {/* Selected Location Display */}
          {selectedLocation && (
            <div className="flex items-center gap-2 p-3 bg-primary/10 rounded-lg">
              <CheckCircle className="w-5 h-5 text-success" />
              <span className="font-medium text-foreground">{selectedLocation}</span>
            </div>
          )}
        </div>
      </Card>

      {/* Popular Locations */}
      <Card className="earth-card p-6">
        <h4 className="font-semibold text-foreground mb-4 flex items-center gap-2">
          🌟 Popular Farming Areas
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredLocations.map((location, index) => (
            <Button
              key={index}
              variant="outline"
              className={`h-auto p-4 justify-start text-left transition-all duration-300 hover:scale-105 hover:shadow-lg hover:-translate-y-1 ${
                selectedLocation.includes(location.name) 
                  ? 'bg-primary/10 border-primary ring-2 ring-primary/20 scale-105 shadow-lg' 
                  : 'hover:bg-card-soft hover:border-primary/50'
              }`}
              onClick={() => handleLocationSelect(location)}
            >
              <div className="flex items-center gap-3 w-full">
                <MapPin className="w-5 h-5 text-primary flex-shrink-0" />
                <div className="flex-1">
                  <div className="font-medium text-sm">{location.name}</div>
                  <div className="text-xs text-muted-foreground">{location.state}</div>
                </div>
                {selectedLocation.includes(location.name) && (
                  <CheckCircle className="w-4 h-4 text-success" />
                )}
              </div>
            </Button>
          ))}
        </div>
      </Card>

      {/* Major Agricultural States */}
      <Card className="earth-card p-6">
        <h4 className="font-semibold text-foreground mb-4">
          🌾 Major Agricultural States
        </h4>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {majorStates.map((state, index) => (
            <div key={index} className="text-center p-3 bg-card-soft rounded-lg transition-all duration-300 hover:bg-primary/5 hover:scale-[1.02] hover:shadow-md">
              <div className="font-medium text-sm mb-1">{state.name}</div>
              <Badge variant="secondary" className="text-xs">
                {state.crops}
              </Badge>
            </div>
          ))}
        </div>
      </Card>

      {/* Farming Area Details */}
      {selectedLocation && (() => {
        const farmingData = getFarmingDataForLocation(selectedLocation);
        return farmingData ? (
          <Card className="earth-card p-6">
            <h4 className="font-semibold text-foreground mb-4 flex items-center gap-2">
              🌾 {farmingData.name} - Agricultural Profile
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Primary Crops */}
              <div className="space-y-3">
                <h5 className="font-medium text-foreground flex items-center gap-2">
                  <span className="text-lg">🌱</span>
                  Primary Crops
                </h5>
                <div className="flex flex-wrap gap-2">
                  {farmingData.primaryCrops.map((crop, idx) => (
                    <Badge key={idx} variant="secondary" className="text-xs">
                      {crop}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Soil Types */}
              <div className="space-y-3">
                <h5 className="font-medium text-foreground flex items-center gap-2">
                  <span className="text-lg">🟤</span>
                  Soil Types
                </h5>
                <div className="flex flex-wrap gap-2">
                  {farmingData.soilTypes.map((soil, idx) => (
                    <Badge key={idx} variant="outline" className="text-xs capitalize">
                      {soil}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Climate Info */}
              <div className="space-y-3">
                <h5 className="font-medium text-foreground flex items-center gap-2">
                  <Droplets className="w-4 h-4" />
                  Climate Data
                </h5>
                <div className="text-sm text-muted-foreground space-y-1">
                  <div>Rainfall: {farmingData.averageRainfall}mm annually</div>
                  <div>Best Seasons: {farmingData.bestSeasons.join(', ')}</div>
                </div>
              </div>

              {/* Infrastructure */}
              <div className="space-y-3">
                <h5 className="font-medium text-foreground flex items-center gap-2">
                  <span className="text-lg">🏗️</span>
                  Infrastructure
                </h5>
                <div className="text-sm text-muted-foreground space-y-1">
                  <div><strong>Irrigation:</strong> {farmingData.irrigationAvailability}</div>
                  <div><strong>Market:</strong> {farmingData.marketAccess}</div>
                  <div><strong>Facilities:</strong> {farmingData.agriInfrastructure}</div>
                </div>
              </div>
            </div>

            {/* Special Features */}
            <div className="mt-4 space-y-3">
              <h5 className="font-medium text-foreground flex items-center gap-2">
                <span className="text-lg">⭐</span>
                Special Features
              </h5>
              <div className="flex flex-wrap gap-2">
                {farmingData.specialFeatures.map((feature, idx) => (
                  <Badge key={idx} variant="default" className="text-xs">
                    {feature}
                  </Badge>
                ))}
              </div>
            </div>
          </Card>
        ) : null;
      })()}

      {/* Weather Information */}
      {showWeather && (weather || weatherLoading) && (
        <Card className="earth-card p-6">
          <h4 className="font-semibold text-foreground mb-4 flex items-center gap-2">
            <Cloud className="w-5 h-5 text-primary" />
            Weather Information
          </h4>
          
          {weatherLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <div className="text-muted-foreground">Loading weather data...</div>
            </div>
          ) : weather ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-card-soft rounded-lg">
                <Thermometer className="w-6 h-6 text-red-500 mx-auto mb-2" />
                <div className="text-2xl font-bold text-foreground">{weather.temperature}°C</div>
                <div className="text-xs text-muted-foreground">Temperature</div>
                <div className="text-xs text-muted-foreground">Feels like {weather.feelsLike}°C</div>
              </div>
              
              <div className="text-center p-4 bg-card-soft rounded-lg">
                <Droplets className="w-6 h-6 text-blue-500 mx-auto mb-2" />
                <div className="text-2xl font-bold text-foreground">{weather.humidity}%</div>
                <div className="text-xs text-muted-foreground">Humidity</div>
                <div className="text-xs text-muted-foreground">{weather.description}</div>
              </div>

              <div className="text-center p-4 bg-card-soft rounded-lg">
                <Wind className="w-6 h-6 text-green-500 mx-auto mb-2" />
                <div className="text-2xl font-bold text-foreground">{weather.windSpeed}</div>
                <div className="text-xs text-muted-foreground">km/h Wind</div>
                <div className="text-xs text-muted-foreground">{weather.pressure} hPa</div>
              </div>

              <div className="text-center p-4 bg-card-soft rounded-lg">
                <Eye className="w-6 h-6 text-purple-500 mx-auto mb-2" />
                <div className="text-2xl font-bold text-foreground">{weather.visibility}</div>
                <div className="text-xs text-muted-foreground">km Visibility</div>
                <div className="text-xs text-muted-foreground">Clear view</div>
              </div>
            </div>
          ) : null}
        </Card>
      )}
    </div>
  );
};