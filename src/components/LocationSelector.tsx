import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  MapPin, Search, Navigation, CheckCircle,
  Thermometer, Droplets, Wind, Eye, Cloud, Loader2
} from 'lucide-react';
import { useLocations, type Location } from '@/hooks/useLocations';

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

interface LocationSelectorProps {
  selectedLocation: string;
  onLocationChange: (location: string, coordinates?: { lat: number; lon: number }, locationData?: Location) => void;
  onWeatherUpdate?: (weather: WeatherData) => void;
  onLocationDataUpdate?: (data: Location | null) => void;
  showWeather?: boolean;
}

export const LocationSelector: React.FC<LocationSelectorProps> = ({
  selectedLocation,
  onLocationChange,
  onWeatherUpdate,
  onLocationDataUpdate,
  showWeather = true
}) => {
  const { locations, departments, loading, error, searchLocations, findLocation } = useLocations();
  const [searchQuery, setSearchQuery] = useState('');
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [weatherLoading, setWeatherLoading] = useState(false);

  const filteredLocations = searchLocations(searchQuery);

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
    } catch (err) {
      console.error('Erreur météo:', err);
    } finally {
      setWeatherLoading(false);
    }
  };

  const handleLocationSelect = (loc: Location) => {
    const deptName = loc.department?.name || '';
    const label = `${loc.name}, ${deptName}`;
    onLocationChange(label, { lat: Number(loc.latitude), lon: Number(loc.longitude) }, loc);
    onLocationDataUpdate?.(loc);
    if (showWeather) fetchWeather(Number(loc.latitude), Number(loc.longitude));
  };

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
              const name = `${data[0].name}, ${data[0].state || data[0].country}`;
              onLocationChange(name, { lat: latitude, lon: longitude }, findLocation(data[0].name) || undefined);
              if (showWeather) fetchWeather(latitude, longitude);
            }
          }
        } catch {
          onLocationChange(`Position GPS (${latitude.toFixed(2)}, ${longitude.toFixed(2)})`, { lat: latitude, lon: longitude });
        }
        setIsGettingLocation(false);
      },
      () => {
        alert('Impossible d\'obtenir votre position. Veuillez sélectionner manuellement.');
        setIsGettingLocation(false);
      }
    );
  };

  const handleManualSearch = () => {
    if (!searchQuery.trim() || searchQuery.trim().length < 2) return;
    const found = findLocation(searchQuery.trim());
    if (found) {
      handleLocationSelect(found);
    } else {
      onLocationChange(searchQuery.trim());
    }
  };

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="text-center">
        <h3 className="text-xl font-semibold text-foreground mb-2 flex items-center justify-center gap-2">
          <MapPin className="w-6 h-6 text-primary" />
          Sélectionner votre localité
        </h3>
        <p className="text-muted-foreground">Choisissez votre ville ou localité au Congo Brazzaville</p>
      </div>

      {/* Recherche */}
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
            <Button variant="outline" onClick={getCurrentLocation} disabled={isGettingLocation} className="flex items-center gap-2">
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

      {/* Localités populaires */}
      <Card className="earth-card p-6">
        <h4 className="font-semibold text-foreground mb-4 flex items-center gap-2">
          🌟 Principales zones agricoles du Congo
        </h4>

        {loading ? (
          <div className="flex items-center justify-center py-10 gap-3 text-muted-foreground">
            <Loader2 className="w-5 h-5 animate-spin" />
            Chargement des localités...
          </div>
        ) : error ? (
          <div className="text-center py-6 text-destructive text-sm">
            Erreur de chargement. Vérifiez votre connexion Supabase.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredLocations.map((loc) => (
              <Button
                key={loc.id}
                variant="outline"
                className={`h-auto p-4 justify-start text-left transition-all duration-300 hover:scale-105 hover:shadow-lg hover:-translate-y-1 ${
                  selectedLocation.includes(loc.name)
                    ? 'bg-primary/10 border-primary ring-2 ring-primary/20 scale-105 shadow-lg'
                    : 'hover:bg-card-soft hover:border-primary/50'
                }`}
                onClick={() => handleLocationSelect(loc)}
              >
                <div className="flex items-center gap-3 w-full">
                  <MapPin className="w-5 h-5 text-primary flex-shrink-0" />
                  <div className="flex-1">
                    <div className="font-medium text-sm">{loc.name}</div>
                    <div className="text-xs text-muted-foreground">Dép. {loc.department?.name}</div>
                  </div>
                  {selectedLocation.includes(loc.name) && <CheckCircle className="w-4 h-4 text-success" />}
                </div>
              </Button>
            ))}
            {filteredLocations.length === 0 && !loading && (
              <p className="col-span-3 text-center text-muted-foreground py-4">
                Aucune localité trouvée pour "{searchQuery}"
              </p>
            )}
          </div>
        )}
      </Card>

      {/* Départements */}
      <Card className="earth-card p-6">
        <h4 className="font-semibold text-foreground mb-4">
          🗺️ Départements du Congo Brazzaville
        </h4>
        {loading ? (
          <div className="flex items-center justify-center py-6 gap-2 text-muted-foreground">
            <Loader2 className="w-4 h-4 animate-spin" /> Chargement...
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            {departments.map((dept) => (
              <div key={dept.id} className="text-center p-3 bg-card-soft rounded-lg transition-all duration-300 hover:bg-primary/5 hover:scale-[1.02] hover:shadow-md">
                <div className="font-medium text-sm mb-1">{dept.name}</div>
                <Badge variant="secondary" className="text-xs">
                  {dept.primary_crops.slice(0, 2).join(', ')}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Profil agricole de la localité sélectionnée */}
      {selectedLocation && (() => {
        const loc = findLocation(selectedLocation);
        return loc ? (
          <Card className="earth-card p-6">
            <h4 className="font-semibold text-foreground mb-4 flex items-center gap-2">
              🌾 {loc.name} — Profil agricole
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <h5 className="font-medium text-foreground flex items-center gap-2">
                  <span className="text-lg">🌱</span> Cultures principales
                </h5>
                <div className="flex flex-wrap gap-2">
                  {loc.primary_crops.map((crop, i) => (
                    <Badge key={i} variant="secondary" className="text-xs">{crop}</Badge>
                  ))}
                </div>
              </div>
              <div className="space-y-3">
                <h5 className="font-medium text-foreground flex items-center gap-2">
                  <span className="text-lg">🟤</span> Types de sol
                </h5>
                <div className="flex flex-wrap gap-2">
                  {loc.soil_types.map((soil, i) => (
                    <Badge key={i} variant="outline" className="text-xs capitalize">{soil}</Badge>
                  ))}
                </div>
              </div>
              <div className="space-y-3">
                <h5 className="font-medium text-foreground flex items-center gap-2">
                  <Droplets className="w-4 h-4" /> Données climatiques
                </h5>
                <div className="text-sm text-muted-foreground space-y-1">
                  {loc.average_rainfall_mm && <div>Pluviométrie : {loc.average_rainfall_mm}mm/an</div>}
                  <div>Meilleures saisons : {loc.best_seasons.join(' / ')}</div>
                </div>
              </div>
              <div className="space-y-3">
                <h5 className="font-medium text-foreground flex items-center gap-2">
                  <span className="text-lg">🏗️</span> Infrastructure
                </h5>
                <div className="text-sm text-muted-foreground space-y-1">
                  {loc.irrigation_availability && <div><strong>Irrigation :</strong> {loc.irrigation_availability}</div>}
                  {loc.market_access && <div><strong>Marché :</strong> {loc.market_access}</div>}
                  {loc.agri_infrastructure && <div><strong>Équipements :</strong> {loc.agri_infrastructure}</div>}
                </div>
              </div>
            </div>
            {loc.special_features.length > 0 && (
              <div className="mt-4 space-y-3">
                <h5 className="font-medium text-foreground flex items-center gap-2">
                  <span className="text-lg">⭐</span> Caractéristiques
                </h5>
                <div className="flex flex-wrap gap-2">
                  {loc.special_features.map((f, i) => (
                    <Badge key={i} variant="default" className="text-xs">{f}</Badge>
                  ))}
                </div>
              </div>
            )}
          </Card>
        ) : null;
      })()}

      {/* Météo */}
      {showWeather && (weather || weatherLoading) && (
        <Card className="earth-card p-6">
          <h4 className="font-semibold text-foreground mb-4 flex items-center gap-2">
            <Cloud className="w-5 h-5 text-primary" /> Météo locale
          </h4>
          {weatherLoading ? (
            <div className="flex items-center justify-center py-8 gap-3 text-muted-foreground">
              <Loader2 className="w-5 h-5 animate-spin" /> Chargement des données météo...
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
