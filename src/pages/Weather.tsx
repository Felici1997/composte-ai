import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LocationSelector } from '@/components/LocationSelector';
import { useLocationContext } from '@/contexts/LocationContext';
import { MapPin, Cloud, Wind, Droplets, Eye, Thermometer, Loader2, AlertTriangle, CheckCircle, Info } from 'lucide-react';

interface WeatherData {
  temperature: number; humidity: number; windSpeed: number;
  condition: string; feelsLike: number; visibility: number; pressure: number;
}

const Weather = () => {
  const { selectedLocationName, selectedCoordinates, setLocation, hasLocation, primaryCrops, bestSeasons, averageRainfall } = useLocationContext();
  const [showSelector, setShowSelector] = useState(!hasLocation);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (selectedCoordinates) fetchWeather(selectedCoordinates.lat, selectedCoordinates.lon);
  }, [selectedCoordinates]);

  const fetchWeather = async (lat: number, lon: number) => {
    setLoading(true);
    try {
      const res = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${import.meta.env.VITE_OPENWEATHER_API_KEY}&units=metric`);
      if (res.ok) {
        const d = await res.json();
        setWeather({ temperature: Math.round(d.main.temp), humidity: d.main.humidity, windSpeed: Math.round((d.wind?.speed||0)*3.6), condition: d.weather[0]?.description||'', feelsLike: Math.round(d.main.feels_like), visibility: Math.round((d.visibility||10000)/1000), pressure: d.main.pressure });
      }
    } catch(e) { console.error(e); } finally { setLoading(false); }
  };

  const getAlerts = () => {
    if (!weather) return [];
    const crops = primaryCrops.length > 0 ? primaryCrops.join(', ') : 'vos cultures';
    const alerts = [];
    if (weather.humidity > 80) alerts.push({ type:'warning', icon:'⚠️', title:'Risque fongique élevé', description:`Humidité ${weather.humidity}% — risque pour ${crops}.`, action:'Pulvériser du neem' });
    if (weather.temperature > 32) alerts.push({ type:'warning', icon:'🌡️', title:'Chaleur intense', description:`${weather.temperature}°C — arrosez tôt le matin et en soirée.`, action:'Pailler le sol' });
    if (weather.humidity < 50) alerts.push({ type:'info', icon:'☀️', title:'Air sec', description:`Humidité ${weather.humidity}% — augmentez l'arrosage.`, action:"Vérifier l'irrigation" });
    if (alerts.length === 0) alerts.push({ type:'success', icon:'✅', title:'Conditions favorables', description:`Bonne météo pour ${crops}.`, action:'Continuer normalement' });
    return alerts;
  };

  const getInsights = () => {
    const insights = [];
    if (weather) {
      insights.push({ icon:'💧', title:'Arrosage', advice: weather.humidity>70 ? "Humidité suffisante — réduisez l'arrosage de 30%." : "Arrosez en soirée pour limiter l'évaporation.", rel:'Élevée' });
      insights.push({ icon:'🌱', title:'Activité du jour', advice: weather.temperature<28 ? 'Températures idéales pour semis, désherbage et traitements.' : 'Travaillez avant 9h ou après 17h.', rel:'Élevée' });
    }
    if (bestSeasons.length > 0) insights.push({ icon:'📅', title:'Calendrier cultural', advice:`Meilleures saisons : ${bestSeasons.join(' et ')}.`, rel:'Moyenne' });
    if (averageRainfall) insights.push({ icon:'🌧️', title:'Pluviométrie', advice:`Votre zone reçoit ~${averageRainfall}mm/an. Planifiez l'irrigation en conséquence.`, rel:'Moyenne' });
    return insights;
  };

  const alertStyle = (t:string) => t==='warning'?'border-l-4 border-yellow-500 bg-yellow-50':t==='success'?'border-l-4 border-green-500 bg-green-50':'border-l-4 border-primary bg-primary/5';
  const relBadge = (r:string) => r==='Élevée'?'bg-red-100 text-red-700':r==='Moyenne'?'bg-yellow-100 text-yellow-700':'bg-gray-100 text-gray-600';

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-3">Météo Agricole 🌤️</h1>
          <p className="text-muted-foreground">Prévisions et conseils adaptés à votre localité au Congo Brazzaville</p>
        </div>

        {/* Barre localisation */}
        <Card className="earth-card p-5 mb-6 max-w-2xl mx-auto">
          <div className="flex items-center gap-4">
            <MapPin className="w-5 h-5 text-primary flex-shrink-0" />
            <div className="flex-1">
              <div className="font-medium text-foreground">{hasLocation ? selectedLocationName : 'Aucune localité sélectionnée'}</div>
              {primaryCrops.length > 0 && <div className="text-xs text-muted-foreground mt-0.5">Cultures : {primaryCrops.slice(0,3).join(', ')}</div>}
            </div>
            <Button variant="outline" size="sm" onClick={() => setShowSelector(!showSelector)}>
              <MapPin className="w-4 h-4 mr-2" />{hasLocation ? 'Changer' : 'Choisir'}
            </Button>
          </div>
        </Card>

        {showSelector && (
          <Card className="earth-card p-6 mb-6 max-w-4xl mx-auto">
            <LocationSelector selectedLocation={selectedLocationName} onLocationChange={(n,c,d) => { setLocation(n,c,d); setShowSelector(false); }} showWeather={false} />
          </Card>
        )}

        {!hasLocation ? (
          <Card className="earth-card p-12 text-center max-w-xl mx-auto">
            <MapPin className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Sélectionnez votre localité</h3>
            <p className="text-muted-foreground mb-4">Choisissez votre ville pour afficher la météo et les conseils agricoles adaptés.</p>
            <Button onClick={() => setShowSelector(true)}><MapPin className="w-4 h-4 mr-2" />Choisir ma localité</Button>
          </Card>
        ) : (
          <>
            {/* Météo actuelle */}
            <Card className="earth-card p-8 mb-8">
              <h2 className="text-xl font-semibold mb-6 flex items-center gap-2"><Cloud className="w-5 h-5 text-primary" />Conditions actuelles — {selectedLocationName}</h2>
              {loading ? (
                <div className="flex items-center justify-center py-10 gap-3 text-muted-foreground"><Loader2 className="w-5 h-5 animate-spin" />Chargement...</div>
              ) : weather ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                  {[
                    { icon:<Thermometer className="w-6 h-6 text-red-500"/>, val:`${weather.temperature}°C`, lbl:'Température', sub:`Ressenti ${weather.feelsLike}°C` },
                    { icon:<Droplets className="w-6 h-6 text-blue-500"/>, val:`${weather.humidity}%`, lbl:'Humidité', sub:weather.condition },
                    { icon:<Wind className="w-6 h-6 text-green-500"/>, val:`${weather.windSpeed}km/h`, lbl:'Vent', sub:`${weather.pressure}hPa` },
                    { icon:<Eye className="w-6 h-6 text-purple-500"/>, val:`${weather.visibility}km`, lbl:'Visibilité', sub:'' },
                    { icon:<span className="text-2xl">🌧️</span>, val:averageRainfall?`${averageRainfall}mm`:'—', lbl:'Pluie/an (zone)', sub:'' },
                    { icon:<span className="text-2xl">🌱</span>, val:primaryCrops[0]||'—', lbl:'Culture principale', sub:'' },
                  ].map((item,i) => (
                    <div key={i} className="text-center p-4 bg-card-soft rounded-xl">
                      <div className="flex justify-center mb-2">{item.icon}</div>
                      <div className="text-xl font-bold text-foreground">{item.val}</div>
                      <div className="text-xs text-muted-foreground">{item.lbl}</div>
                      {item.sub && <div className="text-xs text-muted-foreground mt-1">{item.sub}</div>}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-6">Vérifiez votre clé API OpenWeather dans les variables d'environnement.</p>
              )}
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Alertes */}
              <div>
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2"><AlertTriangle className="w-5 h-5 text-yellow-500" />Alertes agricoles</h2>
                <div className="space-y-4">
                  {getAlerts().map((a,i) => (
                    <Card key={i} className={`earth-card p-5 ${alertStyle(a.type)}`}>
                      <div className="flex items-start gap-4">
                        <span className="text-2xl">{a.icon}</span>
                        <div className="flex-1">
                          <h3 className="font-semibold mb-1">{a.title}</h3>
                          <p className="text-sm text-muted-foreground mb-3">{a.description}</p>
                          <Button size="sm" variant="outline">{a.action}</Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Conseils */}
              <div>
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2"><CheckCircle className="w-5 h-5 text-green-500" />Conseils pour votre zone</h2>
                <div className="space-y-4">
                  {getInsights().map((ins,i) => (
                    <Card key={i} className="earth-card p-5">
                      <div className="flex items-start gap-4">
                        <span className="text-2xl">{ins.icon}</span>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <h3 className="font-semibold">{ins.title}</h3>
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${relBadge(ins.rel)}`}>{ins.rel}</span>
                          </div>
                          <p className="text-sm text-muted-foreground">{ins.advice}</p>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>

                {(primaryCrops.length>0 || bestSeasons.length>0) && (
                  <Card className="earth-card p-5 mt-4">
                    <h3 className="font-semibold mb-3 flex items-center gap-2"><Info className="w-4 h-4 text-primary"/>Profil de votre zone</h3>
                    {primaryCrops.length>0 && <div className="mb-3"><div className="text-xs text-muted-foreground mb-2">Cultures adaptées :</div><div className="flex flex-wrap gap-2">{primaryCrops.map((c,i)=><Badge key={i} variant="secondary" className="text-xs">{c}</Badge>)}</div></div>}
                    {bestSeasons.length>0 && <div><div className="text-xs text-muted-foreground mb-2">Meilleures saisons :</div><div className="flex flex-wrap gap-2">{bestSeasons.map((s,i)=><Badge key={i} variant="outline" className="text-xs">{s}</Badge>)}</div></div>}
                  </Card>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
export default Weather;
