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

// Localités agricoles du Congo Brazzaville avec données détaillées
const popularLocations: FarmingAreaData[] = [
  {
    name: 'Brazzaville',
    state: 'Pool',
    coordinates: { lat: -4.2634, lon: 15.2429 },
    popular: true,
    primaryCrops: ['Manioc', 'Maïs', 'Banane plantain', 'Légumes', 'Arachides'],
    soilTypes: ['sablo-argileux', 'latéritique', 'alluvionnaire'],
    averageRainfall: 1450,
    bestSeasons: ['Grande saison des pluies (oct-déc)', 'Petite saison des pluies (mars-mai)'],
    irrigationAvailability: 'Bonne — Fleuve Congo, maraîchage périurbain',
    marketAccess: 'Excellent — Marchés centraux, export régional',
    agriInfrastructure: 'Avancée — Marchés, chambres froides, transport',
    specialFeatures: ['Maraîchage intensif', 'Agriculture périurbaine', 'Débouchés commerciaux']
  },
  {
    name: 'Pointe-Noire',
    state: 'Kouilou',
    coordinates: { lat: -4.7762, lon: 11.8636 },
    popular: true,
    primaryCrops: ['Manioc', 'Banane', 'Légumes', 'Ananas', 'Poisson (pêche)'],
    soilTypes: ['sableux', 'sablo-limoneux', 'côtier'],
    averageRainfall: 1200,
    bestSeasons: ['Saison des pluies (oct-mai)', 'Petite saison sèche (jan-fév)'],
    irrigationAvailability: 'Modérée — Cours d\'eau locaux',
    marketAccess: 'Excellent — Port, marché urbain, export',
    agriInfrastructure: 'Bonne — Port commercial, marchés, réseau routier',
    specialFeatures: ['Pêche artisanale', 'Agriculture côtière', 'Débouchés portuaires']
  },
  {
    name: 'Dolisie',
    state: 'Niari',
    coordinates: { lat: -4.1981, lon: 12.6714 },
    popular: true,
    primaryCrops: ['Manioc', 'Maïs', 'Arachides', 'Café', 'Palmier à huile'],
    soilTypes: ['argileux', 'latéritique', 'ferralitique'],
    averageRainfall: 1600,
    bestSeasons: ['Grande saison des pluies (oct-déc)', 'Petite saison (mars-mai)'],
    irrigationAvailability: 'Bonne — Rivière Niari',
    marketAccess: 'Bonne — Carrefour routier, marché régional',
    agriInfrastructure: 'Bonne — Chemin de fer CFCO, stockage',
    specialFeatures: ['Zone sucrière (SARIS)', 'Agriculture vivrière', 'Axe Brazzaville-Pointe-Noire']
  },
  {
    name: 'Owando',
    state: 'Cuvette',
    coordinates: { lat: -0.4833, lon: 15.9000 },
    popular: true,
    primaryCrops: ['Manioc', 'Banane', 'Maïs', 'Riz', 'Igname'],
    soilTypes: ['hydromorphe', 'alluvionnaire', 'argilo-sableux'],
    averageRainfall: 1800,
    bestSeasons: ['Saison des pluies (mars-nov)', 'Courte saison sèche (juil-août)'],
    irrigationAvailability: 'Très bonne — Rivière Likouala-Mossaka',
    marketAccess: 'Modérée — Route nationale, marché local',
    agriInfrastructure: 'En développement — Stockage, pistes rurales',
    specialFeatures: ['Zone forestière humide', 'Pêche fluviale', 'Agriculture de subsistance']
  },
  {
    name: 'Ouesso',
    state: 'Sangha',
    coordinates: { lat: 1.6136, lon: 16.0483 },
    popular: true,
    primaryCrops: ['Manioc', 'Plantain', 'Cacao', 'Café', 'Igname'],
    soilTypes: ['ferralitique', 'argileux', 'forestier'],
    averageRainfall: 1700,
    bestSeasons: ['Grande saison des pluies (août-nov)', 'Petite saison (mars-juin)'],
    irrigationAvailability: 'Excellente — Rivière Sangha, forêt équatoriale',
    marketAccess: 'Limitée — Enclavement partiel, voie fluviale',
    agriInfrastructure: 'Limitée — Pistes rurales, marchés villageois',
    specialFeatures: ['Zone forestière', 'Agriculture sur brûlis', 'Produits forestiers non ligneux']
  },
  {
    name: 'Impfondo',
    state: 'Likouala',
    coordinates: { lat: 1.6167, lon: 18.0667 },
    popular: true,
    primaryCrops: ['Manioc', 'Banane plantain', 'Maïs', 'Riz', 'Légumes'],
    soilTypes: ['hydromorphe', 'alluvionnaire', 'tourbeux'],
    averageRainfall: 1750,
    bestSeasons: ['Saison des pluies (mars-nov)'],
    irrigationAvailability: 'Très bonne — Fleuve Ubangi, zones marécageuses',
    marketAccess: 'Faible — Zone enclavée, transport fluvial',
    agriInfrastructure: 'Basique — Pirogue, marchés locaux',
    specialFeatures: ['Zone humide', 'Pêche fluviale active', 'Agriculture de subsistance']
  },
  {
    name: 'Madingou',
    state: 'Bouenza',
    coordinates: { lat: -4.1538, lon: 13.5497 },
    popular: true,
    primaryCrops: ['Canne à sucre', 'Manioc', 'Maïs', 'Arachides', 'Légumes'],
    soilTypes: ['argileux', 'ferralitique', 'noir volcanique'],
    averageRainfall: 1400,
    bestSeasons: ['Grande saison des pluies (oct-déc)', 'Petite saison (mars-mai)'],
    irrigationAvailability: 'Bonne — Fleuve Bouenza',
    marketAccess: 'Bonne — Axe routier, marché régional Bouenza',
    agriInfrastructure: 'Bonne — SARIS Congo, sucrerie industrielle',
    specialFeatures: ['Agro-industrie sucrière', 'Zone fertile Bouenza', 'Cultures industrielles']
  },
  {
    name: 'Kinkala',
    state: 'Pool',
    coordinates: { lat: -4.3600, lon: 14.7600 },
    popular: true,
    primaryCrops: ['Manioc', 'Maïs', 'Arachides', 'Légumes', 'Banane'],
    soilTypes: ['sablo-argileux', 'latéritique'],
    averageRainfall: 1350,
    bestSeasons: ['Grande saison (oct-déc)', 'Petite saison (mars-mai)'],
    irrigationAvailability: 'Modérée — Cours d\'eau saisonniers',
    marketAccess: 'Bonne — Proximité Brazzaville, RN1',
    agriInfrastructure: 'Modérée — Pistes rurales, marchés',
    specialFeatures: ['Ceinture maraîchère Brazzaville', 'Agriculture vivrière', 'Approvisionnement capitale']
  },
  {
    name: 'Sibiti',
    state: 'Lékoumou',
    coordinates: { lat: -3.6833, lon: 13.3500 },
    popular: true,
    primaryCrops: ['Café', 'Cacao', 'Manioc', 'Plantain', 'Cola'],
    soilTypes: ['ferralitique', 'argileux rouge', 'forestier'],
    averageRainfall: 1600,
    bestSeasons: ['Grande saison des pluies (oct-déc)', 'Petite saison (mars-mai)'],
    irrigationAvailability: 'Bonne — Rivière Lékoumou',
    marketAccess: 'Modérée — Route secondaire, marché local',
    agriInfrastructure: 'Modérée — Stockage café/cacao, pistes',
    specialFeatures: ['Zone caféière et cacaoyère', 'Produits de rente', 'Forêt dense']
  },
  {
    name: 'Gamboma',
    state: 'Plateaux',
    coordinates: { lat: -1.8833, lon: 15.8667 },
    popular: true,
    primaryCrops: ['Manioc', 'Maïs', 'Arachides', 'Riz', 'Igname'],
    soilTypes: ['latéritique', 'sablo-argileux', 'plateau'],
    averageRainfall: 1500,
    bestSeasons: ['Saison des pluies (mars-nov)', 'Courte saison sèche (juil)'],
    irrigationAvailability: 'Modérée — Rivières saisonnières',
    marketAccess: 'Modérée — Route nationale, marché local',
    agriInfrastructure: 'En développement — Pistes rurales',
    specialFeatures: ['Zone des Plateaux', 'Agriculture pluviale', 'Élevage bovin']
  }
];

// Départements du Congo Brazzaville avec profil agricole
const majorStates = [
  { 
    name: 'Pool', 
    code: 'PL', 
    crops: 'Manioc, Maïs, Légumes', 
    soilType: 'Sablo-argileux', 
    rainfall: '1350-1500mm',
    irrigation: 'Bonne',
    speciality: 'Ceinture maraîchère Brazzaville'
  },
  { 
    name: 'Bouenza', 
    code: 'BZ', 
    crops: 'Canne à sucre, Manioc, Maïs', 
    soilType: 'Argileux ferralitique', 
    rainfall: '1400-1600mm',
    irrigation: 'Très bonne',
    speciality: 'Agro-industrie sucrière'
  },
  { 
    name: 'Niari', 
    code: 'NI', 
    crops: 'Manioc, Café, Palmier à huile', 
    soilType: 'Latéritique, argileux', 
    rainfall: '1400-1800mm',
    irrigation: 'Bonne',
    speciality: 'Zone de savane fertile'
  },
  { 
    name: 'Cuvette', 
    code: 'CV', 
    crops: 'Manioc, Riz, Banane, Igname', 
    soilType: 'Alluvionnaire, hydromorphe', 
    rainfall: '1700-2000mm',
    irrigation: 'Excellente',
    speciality: 'Agriculture fluviale'
  },
  { 
    name: 'Sangha', 
    code: 'SG', 
    crops: 'Cacao, Café, Plantain', 
    soilType: 'Ferralitique forestier', 
    rainfall: '1600-1800mm',
    irrigation: 'Excellente',
    speciality: 'Zone forestière équatoriale'
  },
  { 
    name: 'Likouala', 
    code: 'LK', 
    crops: 'Manioc, Riz, Banane, Poisson', 
    soilType: 'Hydromorphe, tourbeux', 
    rainfall: '1700-2000mm',
    irrigation: 'Très bonne',
    speciality: 'Zones humides et pêche'
  },
  { 
    name: 'Plateaux', 
    code: 'PT', 
    crops: 'Manioc, Arachides, Maïs, Élevage', 
    soilType: 'Latéritique de plateau', 
    rainfall: '1500-1700mm',
    irrigation: 'Modérée',
    speciality: 'Élevage bovin et cultures vivrières'
  },
  { 
    name: 'Lékoumou', 
    code: 'LK', 
    crops: 'Café, Cacao, Manioc, Cola', 
    soilType: 'Ferralitique rouge', 
    rainfall: '1500-1700mm',
    irrigation: 'Bonne',
    speciality: 'Cultures de rente (café, cacao)'
  },
  { 
    name: 'Kouilou', 
    code: 'KO', 
    crops: 'Manioc, Banane, Légumes, Pêche', 
    soilType: 'Sableux côtier', 
    rainfall: '1200-1400mm',
    irrigation: 'Modérée',
    speciality: 'Agriculture côtière et pêche'
  },
  { 
    name: 'Cuvette-Ouest', 
    code: 'CO', 
    crops: 'Manioc, Maïs, Cacao, Igname', 
    soilType: 'Ferralitique, argileux', 
    rainfall: '1600-1900mm',
    irrigation: 'Bonne',
    speciality: 'Zone forestière et agriculture vivrière'
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

  const getFarmingDataForLocation = (locationName: string): FarmingAreaData | null => {
    return popularLocations.find(loc => 
      loc.name.toLowerCase().includes(locationName.toLowerCase()) ||
      locationName.toLowerCase().includes(loc.name.toLowerCase())
    ) || null;
  };

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

  useEffect(() => {
    if (selectedLocation && onFarmingDataUpdate) {
      const farmingData = getFarmingDataForLocation(selectedLocation);
      onFarmingDataUpdate(farmingData);
    }
  }, [selectedLocation, onFarmingDataUpdate]);

  const getCurrentLocation = () => {
    setIsGettingLocation(true);
    if (!navigator.geolocation) {
      alert('La géolocalisation n\'est pas supportée par ce navigateur.');
      setIsGettingLocation(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const response = await fetch(
            `https://api.openweathermap.org/geo/1.0/reverse?lat=${latitude}&lon=${longitude}&appid=${import.meta.env.VITE_OPENWEATHER_API_KEY}`
          );
          if (response.ok) {
            const data = await response.json();
            if (data.length > 0) {
              const locationName = `${data[0].name}, ${data[0].state || data[0].country}`;
              onLocationChange(locationName, { lat: latitude, lon: longitude });
              if (showWeather) fetchWeather(latitude, longitude);
            }
          }
        } catch (error) {
          onLocationChange(`Position (${latitude.toFixed(2)}, ${longitude.toFixed(2)})`, { lat: latitude, lon: longitude });
        }
        setIsGettingLocation(false);
      },
      (error) => {
        alert('Impossible d\'obtenir votre position. Veuillez sélectionner manuellement.');
        setIsGettingLocation(false);
      }
    );
  };

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
      console.error('Erreur météo:', error);
    } finally {
      setWeatherLoading(false);
    }
  };

  const handleLocationSelect = (location: FarmingAreaData) => {
    try {
      if (!location?.name || !location?.state) return;
      if (!location.coordinates || typeof location.coordinates.lat !== 'number') {
        onLocationChange(`${location.name}, ${location.state}`, undefined, location);
        return;
      }
      onLocationChange(`${location.name}, ${location.state}`, location.coordinates, location);
      if (showWeather) fetchWeather(location.coordinates.lat, location.coordinates.lon);
    } catch (error) {
      console.error('Erreur sélection localité:', error);
    }
  };

  const handleManualSearch = () => {
    if (!searchQuery.trim() || searchQuery.trim().length < 2) return;
    const farmingData = getFarmingDataForLocation(searchQuery.trim());
    onLocationChange(searchQuery.trim(), undefined, farmingData);
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-xl font-semibold text-foreground mb-2 flex items-center justify-center gap-2">
          <MapPin className="w-6 h-6 text-primary" />
          Sélectionner votre localité
        </h3>
        <p className="text-muted-foreground">
          Choisissez votre ville ou localité au Congo Brazzaville
        </p>
      </div>

      <Card className="earth-card p-6">
        <div className="space-y-4">
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher une ville, département ou culture..."
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

          {selectedLocation && (
            <div className="flex items-center gap-2 p-3 bg-primary/10 rounded-lg">
              <CheckCircle className="w-5 h-5 text-success" />
              <span className="font-medium text-foreground">{selectedLocation}</span>
            </div>
          )}
        </div>
      </Card>

      <Card className="earth-card p-6">
        <h4 className="font-semibold text-foreground mb-4 flex items-center gap-2">
          🌟 Principales zones agricoles du Congo
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
                  <div className="text-xs text-muted-foreground">Dép. {location.state}</div>
                </div>
                {selectedLocation.includes(location.name) && (
                  <CheckCircle className="w-4 h-4 text-success" />
                )}
              </div>
            </Button>
          ))}
        </div>
      </Card>

      <Card className="earth-card p-6">
        <h4 className="font-semibold text-foreground mb-4">
          🗺️ Départements du Congo Brazzaville
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

      {selectedLocation && (() => {
        const farmingData = getFarmingDataForLocation(selectedLocation);
        return farmingData ? (
          <Card className="earth-card p-6">
            <h4 className="font-semibold text-foreground mb-4 flex items-center gap-2">
              🌾 {farmingData.name} — Profil agricole
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <h5 className="font-medium text-foreground flex items-center gap-2">
                  <span className="text-lg">🌱</span> Cultures principales
                </h5>
                <div className="flex flex-wrap gap-2">
                  {farmingData.primaryCrops.map((crop, idx) => (
                    <Badge key={idx} variant="secondary" className="text-xs">{crop}</Badge>
                  ))}
                </div>
              </div>
              <div className="space-y-3">
                <h5 className="font-medium text-foreground flex items-center gap-2">
                  <span className="text-lg">🟤</span> Types de sol
                </h5>
                <div className="flex flex-wrap gap-2">
                  {farmingData.soilTypes.map((soil, idx) => (
                    <Badge key={idx} variant="outline" className="text-xs capitalize">{soil}</Badge>
                  ))}
                </div>
              </div>
              <div className="space-y-3">
                <h5 className="font-medium text-foreground flex items-center gap-2">
                  <Droplets className="w-4 h-4" /> Données climatiques
                </h5>
                <div className="text-sm text-muted-foreground space-y-1">
                  <div>Pluviométrie : {farmingData.averageRainfall}mm/an</div>
                  <div>Meilleures saisons : {farmingData.bestSeasons.join(' / ')}</div>
                </div>
              </div>
              <div className="space-y-3">
                <h5 className="font-medium text-foreground flex items-center gap-2">
                  <span className="text-lg">🏗️</span> Infrastructure
                </h5>
                <div className="text-sm text-muted-foreground space-y-1">
                  <div><strong>Irrigation :</strong> {farmingData.irrigationAvailability}</div>
                  <div><strong>Marché :</strong> {farmingData.marketAccess}</div>
                  <div><strong>Équipements :</strong> {farmingData.agriInfrastructure}</div>
                </div>
              </div>
            </div>
            <div className="mt-4 space-y-3">
              <h5 className="font-medium text-foreground flex items-center gap-2">
                <span className="text-lg">⭐</span> Caractéristiques
              </h5>
              <div className="flex flex-wrap gap-2">
                {farmingData.specialFeatures.map((feature, idx) => (
                  <Badge key={idx} variant="default" className="text-xs">{feature}</Badge>
                ))}
              </div>
            </div>
          </Card>
        ) : null;
      })()}

      {showWeather && (weather || weatherLoading) && (
        <Card className="earth-card p-6">
          <h4 className="font-semibold text-foreground mb-4 flex items-center gap-2">
            <Cloud className="w-5 h-5 text-primary" />
            Météo locale
          </h4>
          {weatherLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <div className="text-muted-foreground">Chargement des données météo...</div>
            </div>
          ) : weather ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-card-soft rounded-lg">
                <Thermometer className="w-6 h-6 text-red-500 mx-auto mb-2" />
                <div className="text-2xl font-bold text-foreground">{weather.temperature}°C</div>
                <div className="text-xs text-muted-foreground">Température</div>
                <div className="text-xs text-muted-foreground">Ressenti {weather.feelsLike}°C</div>
              </div>
              <div className="text-center p-4 bg-card-soft rounded-lg">
                <Droplets className="w-6 h-6 text-blue-500 mx-auto mb-2" />
                <div className="text-2xl font-bold text-foreground">{weather.humidity}%</div>
                <div className="text-xs text-muted-foreground">Humidité</div>
                <div className="text-xs text-muted-foreground">{weather.description}</div>
              </div>
              <div className="text-center p-4 bg-card-soft rounded-lg">
                <Wind className="w-6 h-6 text-green-500 mx-auto mb-2" />
                <div className="text-2xl font-bold text-foreground">{weather.windSpeed}</div>
                <div className="text-xs text-muted-foreground">km/h Vent</div>
                <div className="text-xs text-muted-foreground">{weather.pressure} hPa</div>
              </div>
              <div className="text-center p-4 bg-card-soft rounded-lg">
                <Eye className="w-6 h-6 text-purple-500 mx-auto mb-2" />
                <div className="text-2xl font-bold text-foreground">{weather.visibility}</div>
                <div className="text-xs text-muted-foreground">km Visibilité</div>
              </div>
            </div>
          ) : null}
        </Card>
      )}
    </div>
  );
};
