import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LocationSelector } from '@/components/LocationSelector';
import { useLanguage } from '@/contexts/LanguageContext';
import { MapPin, Cloud, Sun, CloudRain, Wind, Droplets, Eye, Thermometer } from 'lucide-react';

const Weather = () => {
  const { t } = useLanguage();
  const [location, setLocation] = useState('Pune, Maharashtra');
  const [showLocationSelector, setShowLocationSelector] = useState(false);
  const [currentWeather, setCurrentWeather] = useState({
    temperature: 28,
    humidity: 65,
    windSpeed: 12,
    condition: 'Partly Cloudy',
    rainfall: 0,
    uvIndex: 6
  });
  const [weatherData, setWeatherData] = useState(null);

  const weeklyForecast = [
    { day: 'Today', date: 'Jan 15', temp: { min: 18, max: 28 }, condition: 'Partly Cloudy', rain: 20, icon: '⛅' },
    { day: 'Tomorrow', date: 'Jan 16', temp: { min: 20, max: 32 }, condition: 'Sunny', rain: 5, icon: '☀️' },
    { day: 'Wednesday', date: 'Jan 17', temp: { min: 19, max: 30 }, condition: 'Cloudy', rain: 40, icon: '☁️' },
    { day: 'Thursday', date: 'Jan 18', temp: { min: 17, max: 26 }, condition: 'Light Rain', rain: 80, icon: '🌦️' },
    { day: 'Friday', date: 'Jan 19', temp: { min: 16, max: 24 }, condition: 'Heavy Rain', rain: 95, icon: '🌧️' },
    { day: 'Saturday', date: 'Jan 20', temp: { min: 18, max: 27 }, condition: 'Partly Cloudy', rain: 30, icon: '⛅' },
    { day: 'Sunday', date: 'Jan 21', temp: { min: 20, max: 29 }, condition: 'Sunny', rain: 10, icon: '☀️' }
  ];

  const farmingAlerts = [
    {
      type: 'warning',
      title: 'Heavy Rain Expected',
      description: 'Heavy rainfall predicted on Thursday-Friday. Consider protective measures for crops.',
      icon: '⚠️',
      action: 'Prepare drainage systems'
    },
    {
      type: 'info',
      title: 'Ideal Planting Conditions',
      description: 'Next week shows optimal conditions for Kharif crop planting.',
      icon: '🌱',
      action: 'Plan planting schedule'
    },
    {
      type: 'success',
      title: 'Good Irrigation Day',
      description: 'Low humidity and moderate temperature - perfect for irrigation.',
      icon: '💧',
      action: 'Schedule irrigation'
    }
  ];

  const farmingInsights = [
    {
      title: 'Crop Watering Advice',
      advice: 'With 65% humidity and moderate temperature, reduce watering frequency for the next 2 days.',
      icon: '💧',
      relevance: 'High'
    },
    {
      title: 'Disease Risk Assessment',
      advice: 'High humidity levels increase fungal disease risk. Apply preventive treatments.',
      icon: '🦠',
      relevance: 'Medium'
    },
    {
      title: 'Harvesting Window',
      advice: 'Clear weather expected next week - ideal for harvesting mature crops.',
      icon: '🌾',
      relevance: 'High'
    }
  ];

  const getAlertColor = (type: string) => {
    switch (type) {
      case 'warning': return 'border-l-4 border-cta bg-cta/5';
      case 'info': return 'border-l-4 border-primary bg-primary/5';
      case 'success': return 'border-l-4 border-success bg-success/5';
      default: return 'border-l-4 border-muted bg-muted/5';
    }
  };

  const getRelevanceColor = (relevance: string) => {
    switch (relevance) {
      case 'High': return 'bg-destructive/10 text-destructive';
      case 'Medium': return 'bg-cta/10 text-cta';
      case 'Low': return 'bg-muted/10 text-muted-foreground';
      default: return 'bg-muted/10 text-muted-foreground';
    }
  };

  return (
    <div className="min-h-screen sky-gradient">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            {t('location.weather')} 🌤️
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            {t('location.subtitle')}
          </p>
        </div>

        {/* Location Selection */}
        <Card className="earth-card p-6 mb-8 max-w-2xl mx-auto">
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <MapPin className="w-5 h-5 text-primary flex-shrink-0" />
            <div className="flex-1 text-center sm:text-left">
              <div className="font-medium text-foreground">{t('location.title')}</div>
              <div className="text-sm text-muted-foreground">{location}</div>
            </div>
            <Button
              variant="outline"
              onClick={() => setShowLocationSelector(!showLocationSelector)}
              className="whitespace-nowrap"
            >
              <MapPin className="w-4 h-4 mr-2" />
              {t('location.title')}
            </Button>
          </div>
        </Card>

        {/* Location Selector */}
        {showLocationSelector && (
          <Card className="earth-card p-6 mb-8 max-w-4xl mx-auto">
            <LocationSelector
              selectedLocation={location}
              onLocationChange={(loc) => {
                setLocation(loc);
                setShowLocationSelector(false);
              }}
              onWeatherUpdate={(weather) => {
                setWeatherData(weather);
                if (weather) {
                  setCurrentWeather({
                    temperature: Math.round(weather.temperature),
                    humidity: weather.humidity,
                    windSpeed: Math.round(weather.windSpeed * 3.6), // Convert m/s to km/h
                    condition: weather.description,
                    rainfall: 0, // This would need to be calculated from weather data
                    uvIndex: 6 // This would need UV index from weather API
                  });
                }
              }}
              showWeather={true}
            />
          </Card>
        )}

        {/* Current Weather */}
        <Card className="earth-card p-8 mb-8">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-semibold text-foreground mb-2">{t('location.weather')}</h2>
            <p className="text-muted-foreground">{location}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-6xl mb-4">⛅</div>
              <div className="text-4xl font-bold text-foreground mb-2">{currentWeather.temperature}°C</div>
              <div className="text-muted-foreground">{currentWeather.condition}</div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-card-soft rounded-lg">
                <div className="flex items-center space-x-3">
                  <span className="text-xl">💧</span>
                  <span className="text-foreground">{t('location.humidity')}</span>
                </div>
                <span className="font-semibold text-foreground">{currentWeather.humidity}%</span>
              </div>

              <div className="flex items-center justify-between p-3 bg-card-soft rounded-lg">
                <div className="flex items-center space-x-3">
                  <span className="text-xl">💨</span>
                  <span className="text-foreground">{t('location.wind')}</span>
                </div>
                <span className="font-semibold text-foreground">{currentWeather.windSpeed} km/h</span>
              </div>

              <div className="flex items-center justify-between p-3 bg-card-soft rounded-lg">
                <div className="flex items-center space-x-3">
                  <span className="text-xl">🌧️</span>
                  <span className="text-foreground">Rainfall</span>
                </div>
                <span className="font-semibold text-foreground">{currentWeather.rainfall} mm</span>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-card-soft rounded-lg">
                <div className="flex items-center space-x-3">
                  <span className="text-xl">☀️</span>
                  <span className="text-foreground">UV Index</span>
                </div>
                <span className="font-semibold text-foreground">{currentWeather.uvIndex}</span>
              </div>

              <div className="flex items-center justify-between p-3 bg-card-soft rounded-lg">
                <div className="flex items-center space-x-3">
                  <span className="text-xl">🌡️</span>
                  <span className="text-foreground">Feels Like</span>
                </div>
                <span className="font-semibold text-foreground">{currentWeather.temperature + 2}°C</span>
              </div>

              <div className="flex items-center justify-between p-3 bg-card-soft rounded-lg">
                <div className="flex items-center space-x-3">
                  <span className="text-xl">👁️</span>
                  <span className="text-foreground">Visibility</span>
                </div>
                <span className="font-semibold text-foreground">10 km</span>
              </div>
            </div>
          </div>
        </Card>

        {/* 7-Day Forecast */}
        <Card className="earth-card p-8 mb-8">
          <h2 className="text-2xl font-semibold text-foreground mb-6">7-Day Forecast</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
            {weeklyForecast.map((day, index) => (
              <div key={index} className="bg-card-soft p-4 rounded-lg text-center hover:bg-card-soft/80 transition-colors">
                <div className="text-sm font-medium text-foreground mb-2">{day.day}</div>
                <div className="text-xs text-muted-foreground mb-3">{day.date}</div>
                <div className="text-3xl mb-3">{day.icon}</div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-semibold text-foreground">{day.temp.max}°</span>
                    <span className="text-muted-foreground">{day.temp.min}°</span>
                  </div>
                  
                  <div className="flex items-center justify-center space-x-1 text-xs">
                    <span className="text-accent">☔</span>
                    <span className="text-muted-foreground">{day.rain}%</span>
                  </div>
                  
                  <div className="text-xs text-muted-foreground">{day.condition}</div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Farming Alerts */}
          <div>
            <h2 className="text-2xl font-semibold text-foreground mb-6">Farming Alerts</h2>
            <div className="space-y-4">
              {farmingAlerts.map((alert, index) => (
                <Card key={index} className={`earth-card p-6 ${getAlertColor(alert.type)}`}>
                  <div className="flex items-start space-x-4">
                    <div className="text-2xl">{alert.icon}</div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground mb-2">{alert.title}</h3>
                      <p className="text-sm text-muted-foreground mb-3">{alert.description}</p>
                      <Button size="sm" variant="outline">
                        {alert.action}
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Farming Insights */}
          <div>
            <h2 className="text-2xl font-semibold text-foreground mb-6">Farming Insights</h2>
            <div className="space-y-4">
              {farmingInsights.map((insight, index) => (
                <Card key={index} className="earth-card p-6">
                  <div className="flex items-start space-x-4">
                    <div className="text-2xl">{insight.icon}</div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold text-foreground">{insight.title}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRelevanceColor(insight.relevance)}`}>
                          {insight.relevance}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed">{insight.advice}</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {/* Quick Weather Actions */}
            <Card className="earth-card p-6 mt-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">Quick Actions</h3>
              <div className="grid grid-cols-2 gap-3">
                <Button variant="outline" size="sm" className="flex items-center space-x-2">
                  <span>🔔</span>
                  <span>Set Weather Alerts</span>
                </Button>
                <Button variant="outline" size="sm" className="flex items-center space-x-2">
                  <span>📅</span>
                  <span>Plan Activities</span>
                </Button>
                <Button variant="outline" size="sm" className="flex items-center space-x-2">
                  <span>📊</span>
                  <span>Historical Data</span>
                </Button>
                <Button variant="outline" size="sm" className="flex items-center space-x-2">
                  <span>🛰️</span>
                  <span>Satellite View</span>
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Weather;