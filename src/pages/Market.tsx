import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { LocationSelector } from '@/components/LocationSelector';
import { 
  TrendingUp, 
  TrendingDown, 
  Bell, 
  MapPin, 
  Clock, 
  DollarSign, 
  BarChart3, 
  RefreshCw,
  Zap,
  Target,
  AlertCircle,
  CheckCircle,
  Activity,
  Volume2,
  Droplets,
  Star
} from 'lucide-react';

interface PriceAlert {
  id: string;
  crop: string;
  targetPrice: number;
  currentPrice: number;
  type: 'above' | 'below';
  created: Date;
  mandi: string;
}

const Market = () => {
  const [selectedState, setSelectedState] = useState('maharashtra');
  const [selectedCrop, setSelectedCrop] = useState('rice');
  const [liveUpdates, setLiveUpdates] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [priceAlerts, setPriceAlerts] = useState<PriceAlert[]>([]);
  const [userLocation, setUserLocation] = useState('Pune, Maharashtra');
  const [showPriceChart, setShowPriceChart] = useState(false);
  const [marketVolatility, setMarketVolatility] = useState(2.8);
  const [sortBy, setSortBy] = useState('distance');
  const [targetPrice, setTargetPrice] = useState('');
  const [showLocationSelector, setShowLocationSelector] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [dataTransition, setDataTransition] = useState(false);
  const { toast } = useToast();

  // Enhanced market data with comprehensive information for all states
  const marketData = {
    maharashtra: {
      rice: [
        { 
          mandi: 'Pune APMC', 
          price: 2150, 
          change: 5.2, 
          lastUpdated: '2 hours ago',
          volume: '1,250 quintals',
          quality: 'Grade A',
          moisture: '12%',
          minPrice: 2000,
          maxPrice: 2300,
          marketStatus: 'active',
          distance: '45 km',
          priceHistory: [2000, 2050, 2100, 2120, 2150],
          volatility: 'Low',
          recommendation: 'Buy',
          traders: 34
        },
        { 
          mandi: 'Mumbai APMC', 
          price: 2280, 
          change: -1.5, 
          lastUpdated: '1 hour ago',
          volume: '2,100 quintals',
          quality: 'Grade A+',
          moisture: '11%',
          minPrice: 2100,
          maxPrice: 2400,
          marketStatus: 'active',
          distance: '120 km',
          priceHistory: [2200, 2250, 2300, 2320, 2280],
          volatility: 'Medium',
          recommendation: 'Hold',
          traders: 58
        },
        { 
          mandi: 'Nashik APMC', 
          price: 2100, 
          change: 3.8, 
          lastUpdated: '3 hours ago',
          volume: '980 quintals',
          quality: 'Grade B+',
          moisture: '13%',
          minPrice: 1950,
          maxPrice: 2200,
          marketStatus: 'active',
          distance: '85 km',
          priceHistory: [1950, 2000, 2050, 2080, 2100],
          volatility: 'Low',
          recommendation: 'Buy',
          traders: 28
        },
        { 
          mandi: 'Aurangabad APMC', 
          price: 2050, 
          change: 2.1, 
          lastUpdated: '2 hours ago',
          volume: '750 quintals',
          quality: 'Grade B',
          moisture: '14%',
          minPrice: 1900,
          maxPrice: 2150,
          marketStatus: 'closing_soon',
          distance: '200 km',
          priceHistory: [1900, 1950, 2000, 2025, 2050],
          volatility: 'High',
          recommendation: 'Sell',
          traders: 19
        }
      ],
      wheat: [
        { 
          mandi: 'Pune APMC', 
          price: 2350, 
          change: 4.2, 
          lastUpdated: '1 hour ago',
          volume: '1,800 quintals',
          quality: 'Grade A',
          moisture: '10%',
          minPrice: 2200,
          maxPrice: 2500,
          marketStatus: 'active',
          distance: '45 km',
          priceHistory: [2200, 2250, 2300, 2325, 2350],
          volatility: 'Low',
          recommendation: 'Hold',
          traders: 42
        },
        { 
          mandi: 'Mumbai APMC', 
          price: 2420, 
          change: -2.1, 
          lastUpdated: '2 hours ago',
          volume: '2,500 quintals',
          quality: 'Grade A+',
          moisture: '9%',
          minPrice: 2300,
          maxPrice: 2600,
          marketStatus: 'active',
          distance: '120 km',
          priceHistory: [2300, 2400, 2450, 2470, 2420],
          volatility: 'Medium',
          recommendation: 'Buy',
          traders: 67
        }
      ],
      cotton: [
        { 
          mandi: 'Pune APMC', 
          price: 5800, 
          change: 8.5, 
          lastUpdated: '2 hours ago',
          volume: '850 bales',
          quality: 'Shankar-6',
          moisture: '7%',
          minPrice: 5400,
          maxPrice: 6200,
          marketStatus: 'active',
          distance: '45 km',
          priceHistory: [5400, 5500, 5650, 5720, 5800],
          volatility: 'High',
          recommendation: 'Sell',
          traders: 31
        }
      ],
      sugarcane: [
        { 
          mandi: 'Pune Sugar Factory', 
          price: 320, 
          change: 2.5, 
          lastUpdated: '1 hour ago',
          volume: '15,000 tonnes',
          quality: 'High Sucrose',
          moisture: '75%',
          minPrice: 300,
          maxPrice: 350,
          marketStatus: 'active',
          distance: '35 km',
          priceHistory: [300, 310, 315, 318, 320],
          volatility: 'Low',
          recommendation: 'Hold',
          traders: 12
        }
      ]
    },
    punjab: {
      rice: [
        { 
          mandi: 'Amritsar Basmati Hub', 
          price: 4850, 
          change: 15.2, 
          lastUpdated: '1 hour ago',
          volume: '2,100 quintals',
          quality: 'Pusa Basmati 1121',
          moisture: '12%',
          minPrice: 4200,
          maxPrice: 5200,
          marketStatus: 'active',
          distance: '18 km',
          priceHistory: [4200, 4350, 4500, 4680, 4850],
          volatility: 'High',
          recommendation: 'Strong Buy',
          traders: 38
        },
        { 
          mandi: 'Gurdaspur Market', 
          price: 4720, 
          change: 12.8, 
          lastUpdated: '2 hours ago',
          volume: '1,650 quintals',
          quality: 'Pusa Basmati 1509',
          moisture: '13%',
          minPrice: 4100,
          maxPrice: 5000,
          marketStatus: 'active',
          distance: '42 km',
          priceHistory: [4100, 4250, 4400, 4580, 4720],
          volatility: 'Medium',
          recommendation: 'Buy',
          traders: 29
        },
        { 
          mandi: 'Kapurthala APMC', 
          price: 3890, 
          change: 8.4, 
          lastUpdated: '3 hours ago',
          volume: '1,950 quintals',
          quality: 'PR-126',
          moisture: '14%',
          minPrice: 3500,
          maxPrice: 4100,
          marketStatus: 'active',
          distance: '51 km',
          priceHistory: [3500, 3600, 3750, 3820, 3890],
          volatility: 'Low',
          recommendation: 'Hold',
          traders: 33
        }
      ],
      wheat: [
        { 
          mandi: 'Amritsar Mandi', 
          price: 2280, 
          change: 7.3, 
          lastUpdated: '1 hour ago',
          volume: '3,500 quintals',
          quality: 'PBW-725',
          moisture: '10%',
          minPrice: 2100,
          maxPrice: 2400,
          marketStatus: 'active',
          distance: '12 km',
          priceHistory: [2100, 2150, 2200, 2240, 2280],
          volatility: 'Low',
          recommendation: 'Strong Buy',
          traders: 52
        },
        { 
          mandi: 'Ludhiana APMC', 
          price: 2265, 
          change: 6.8, 
          lastUpdated: '2 hours ago',
          volume: '4,200 quintals',
          quality: 'HD-3086',
          moisture: '11%',
          minPrice: 2080,
          maxPrice: 2380,
          marketStatus: 'active',
          distance: '28 km',
          priceHistory: [2080, 2120, 2180, 2220, 2265],
          volatility: 'Medium',
          recommendation: 'Buy',
          traders: 48
        },
        { 
          mandi: 'Jalandhar Market', 
          price: 2245, 
          change: 4.2, 
          lastUpdated: '3 hours ago',
          volume: '2,800 quintals',
          quality: 'PBW-550',
          moisture: '12%',
          minPrice: 2050,
          maxPrice: 2350,
          marketStatus: 'active',
          distance: '35 km',
          priceHistory: [2050, 2100, 2160, 2200, 2245],
          volatility: 'Low',
          recommendation: 'Buy',
          traders: 41
        }
      ],
      cotton: [
        { 
          mandi: 'Bathinda Cotton Market', 
          price: 7150, 
          change: 18.5, 
          lastUpdated: '1 hour ago',
          volume: '1,800 bales',
          quality: 'F-2228',
          moisture: '7%',
          minPrice: 6200,
          maxPrice: 7500,
          marketStatus: 'active',
          distance: '65 km',
          priceHistory: [6200, 6450, 6700, 6920, 7150],
          volatility: 'High',
          recommendation: 'Strong Buy',
          traders: 27
        },
        { 
          mandi: 'Faridkot Market', 
          price: 6980, 
          change: 14.7, 
          lastUpdated: '2 hours ago',
          volume: '1,200 bales',
          quality: 'RCH-134',
          moisture: '8%',
          minPrice: 6100,
          maxPrice: 7300,
          marketStatus: 'active',
          distance: '78 km',
          priceHistory: [6100, 6300, 6500, 6750, 6980],
          volatility: 'Medium',
          recommendation: 'Buy',
          traders: 21
        }
      ],
      sugarcane: [
        { 
          mandi: 'Jalandhar Sugar Mill', 
          price: 385, 
          change: 4.1, 
          lastUpdated: '2 hours ago',
          volume: '12,500 tonnes',
          quality: 'CoJ-64',
          moisture: '78%',
          minPrice: 350,
          maxPrice: 420,
          marketStatus: 'active',
          distance: '32 km',
          priceHistory: [350, 360, 370, 378, 385],
          volatility: 'Low',
          recommendation: 'Hold',
          traders: 15
        }
      ]
    },
    haryana: {
      rice: [
        { 
          mandi: 'Karnal Rice Hub', 
          price: 4250, 
          change: 11.2, 
          lastUpdated: '1 hour ago',
          volume: '1,850 quintals',
          quality: 'Pusa 44',
          moisture: '13%',
          minPrice: 3800,
          maxPrice: 4500,
          marketStatus: 'active',
          distance: '25 km',
          priceHistory: [3800, 3950, 4100, 4180, 4250],
          volatility: 'Medium',
          recommendation: 'Strong Buy',
          traders: 35
        },
        { 
          mandi: 'Kurukshetra Market', 
          price: 4180, 
          change: 9.7, 
          lastUpdated: '2 hours ago',
          volume: '1,450 quintals',
          quality: 'PR-114',
          moisture: '14%',
          minPrice: 3750,
          maxPrice: 4400,
          marketStatus: 'active',
          distance: '52 km',
          priceHistory: [3750, 3850, 3950, 4080, 4180],
          volatility: 'Low',
          recommendation: 'Buy',
          traders: 28
        }
      ],
      wheat: [
        { 
          mandi: 'Karnal Mandi', 
          price: 2195, 
          change: 6.1, 
          lastUpdated: '1 hour ago',
          volume: '2,800 quintals',
          quality: 'WH-1105',
          moisture: '11%',
          minPrice: 2050,
          maxPrice: 2300,
          marketStatus: 'active',
          distance: '22 km',
          priceHistory: [2050, 2100, 2140, 2170, 2195],
          volatility: 'Medium',
          recommendation: 'Buy',
          traders: 39
        },
        { 
          mandi: 'Ambala APMC', 
          price: 2175, 
          change: 5.3, 
          lastUpdated: '2 hours ago',
          volume: '3,200 quintals',
          quality: 'HD-2967',
          moisture: '12%',
          minPrice: 2030,
          maxPrice: 2280,
          marketStatus: 'active',
          distance: '38 km',
          priceHistory: [2030, 2080, 2120, 2150, 2175],
          volatility: 'Low',
          recommendation: 'Buy',
          traders: 44
        },
        { 
          mandi: 'Panipat Market', 
          price: 2160, 
          change: 3.8, 
          lastUpdated: '3 hours ago',
          volume: '2,100 quintals',
          quality: 'PBW-343',
          moisture: '13%',
          minPrice: 2020,
          maxPrice: 2250,
          marketStatus: 'active',
          distance: '45 km',
          priceHistory: [2020, 2060, 2100, 2130, 2160],
          volatility: 'Medium',
          recommendation: 'Hold',
          traders: 31
        }
      ],
      cotton: [
        { 
          mandi: 'Sirsa Cotton Market', 
          price: 6950, 
          change: 16.2, 
          lastUpdated: '1 hour ago',
          volume: '1,650 bales',
          quality: 'H-1236',
          moisture: '8%',
          minPrice: 6000,
          maxPrice: 7200,
          marketStatus: 'active',
          distance: '85 km',
          priceHistory: [6000, 6200, 6450, 6700, 6950],
          volatility: 'High',
          recommendation: 'Strong Buy',
          traders: 25
        },
        { 
          mandi: 'Hisar APMC', 
          price: 6820, 
          change: 13.4, 
          lastUpdated: '2 hours ago',
          volume: '1,200 bales',
          quality: 'H-1300',
          moisture: '7%',
          minPrice: 5950,
          maxPrice: 7100,
          marketStatus: 'active',
          distance: '95 km',
          priceHistory: [5950, 6150, 6350, 6580, 6820],
          volatility: 'Medium',
          recommendation: 'Buy',
          traders: 19
        }
      ],
      sugarcane: [
        { 
          mandi: 'Yamuna Nagar Mill', 
          price: 395, 
          change: 3.2, 
          lastUpdated: '2 hours ago',
          volume: '11,200 tonnes',
          quality: 'CoS-767',
          moisture: '79%',
          minPrice: 370,
          maxPrice: 420,
          marketStatus: 'active',
          distance: '48 km',
          priceHistory: [370, 375, 385, 390, 395],
          volatility: 'Low',
          recommendation: 'Hold',
          traders: 13
        }
      ]
    },
    karnataka: {
      rice: [
        { 
          mandi: 'Mysore Rice Market', 
          price: 2980, 
          change: 5.8, 
          lastUpdated: '1 hour ago',
          volume: '1,350 quintals',
          quality: 'BPT-5204',
          moisture: '15%',
          minPrice: 2750,
          maxPrice: 3200,
          marketStatus: 'active',
          distance: '42 km',
          priceHistory: [2750, 2820, 2890, 2940, 2980],
          volatility: 'Medium',
          recommendation: 'Buy',
          traders: 26
        },
        { 
          mandi: 'Mandya APMC', 
          price: 2850, 
          change: 3.2, 
          lastUpdated: '2 hours ago',
          volume: '1,680 quintals',
          quality: 'KMR-3',
          moisture: '16%',
          minPrice: 2650,
          maxPrice: 3050,
          marketStatus: 'active',
          distance: '58 km',
          priceHistory: [2650, 2720, 2780, 2820, 2850],
          volatility: 'Low',
          recommendation: 'Hold',
          traders: 22
        },
        { 
          mandi: 'Hassan Market', 
          price: 2920, 
          change: 4.1, 
          lastUpdated: '3 hours ago',
          volume: '980 quintals',
          quality: 'Jyothi',
          moisture: '14%',
          minPrice: 2700,
          maxPrice: 3100,
          marketStatus: 'active',
          distance: '78 km',
          priceHistory: [2700, 2780, 2850, 2890, 2920],
          volatility: 'Medium',
          recommendation: 'Buy',
          traders: 19
        }
      ],
      wheat: [
        { 
          mandi: 'Bangalore APMC', 
          price: 2080, 
          change: 2.1, 
          lastUpdated: '2 hours ago',
          volume: '1,100 quintals',
          quality: 'Lok-1',
          moisture: '14%',
          minPrice: 1950,
          maxPrice: 2200,
          marketStatus: 'active',
          distance: '35 km',
          priceHistory: [1950, 1980, 2010, 2050, 2080],
          volatility: 'Medium',
          recommendation: 'Hold',
          traders: 24
        },
        { 
          mandi: 'Davangere Market', 
          price: 2045, 
          change: 1.8, 
          lastUpdated: '3 hours ago',
          volume: '850 quintals',
          quality: 'DWR-162',
          moisture: '15%',
          minPrice: 1920,
          maxPrice: 2150,
          marketStatus: 'active',
          distance: '128 km',
          priceHistory: [1920, 1950, 1980, 2010, 2045],
          volatility: 'Low',
          recommendation: 'Hold',
          traders: 18
        }
      ],
      cotton: [
        { 
          mandi: 'Raichur Cotton Hub', 
          price: 6420, 
          change: 8.9, 
          lastUpdated: '1 hour ago',
          volume: '2,850 bales',
          quality: 'Bunny Bt',
          moisture: '9%',
          minPrice: 5800,
          maxPrice: 6800,
          marketStatus: 'active',
          distance: '195 km',
          priceHistory: [5800, 5950, 6100, 6250, 6420],
          volatility: 'Medium',
          recommendation: 'Buy',
          traders: 37
        },
        { 
          mandi: 'Kalaburagi Market', 
          price: 6380, 
          change: 7.2, 
          lastUpdated: '2 hours ago',
          volume: '2,100 bales',
          quality: 'Rasi-134',
          moisture: '8%',
          minPrice: 5750,
          maxPrice: 6750,
          marketStatus: 'active',
          distance: '210 km',
          priceHistory: [5750, 5900, 6050, 6200, 6380],
          volatility: 'Low',
          recommendation: 'Buy',
          traders: 31
        }
      ],
      sugarcane: [
        { 
          mandi: 'Belgaum Sugar Mill', 
          price: 375, 
          change: 1.8, 
          lastUpdated: '2 hours ago',
          volume: '18,500 tonnes',
          quality: 'Co-419',
          moisture: '80%',
          minPrice: 350,
          maxPrice: 400,
          marketStatus: 'active',
          distance: '185 km',
          priceHistory: [350, 355, 365, 370, 375],
          volatility: 'Low',
          recommendation: 'Hold',
          traders: 16
        },
        { 
          mandi: 'Shimoga Mill', 
          price: 382, 
          change: 2.5, 
          lastUpdated: '3 hours ago',
          volume: '14,200 tonnes',
          quality: 'Co-86032',
          moisture: '78%',
          minPrice: 360,
          maxPrice: 410,
          marketStatus: 'active',
          distance: '145 km',
          priceHistory: [360, 365, 372, 378, 382],
          volatility: 'Medium',
          recommendation: 'Hold',
          traders: 11
        }
      ]
    }
  };

  // Market news and insights
  const marketNews = [
    {
      title: 'Rice prices surge due to monsoon delays',
      summary: 'Delayed monsoon in key rice-producing states has led to a 15% increase in rice prices across major mandis.',
      time: '2 hours ago',
      impact: 'positive',
      severity: 'high'
    },
    {
      title: 'Government announces minimum support price increase',
      summary: 'MSP for wheat increased by ₹200 per quintal, benefiting farmers across the country.',
      time: '5 hours ago',
      impact: 'positive',
      severity: 'medium'
    },
    {
      title: 'Export demand for cotton remains strong',
      summary: 'International demand for Indian cotton continues to drive prices upward in domestic markets.',
      time: '1 day ago',
      impact: 'positive',
      severity: 'medium'
    }
  ];

  // Live updates simulation with enhanced feedback
  useEffect(() => {
    if (liveUpdates) {
      const interval = setInterval(() => {
        setLastUpdated(new Date());
        // Simulate price fluctuations
        setMarketVolatility(prev => Math.max(1, Math.min(5, prev + (Math.random() - 0.5) * 0.5)));
        
        // Show real-time update notification
        if (Math.random() > 0.7) { // 30% chance of price update notification
          toast({
            title: "Live Update 📈",
            description: `${selectedCrop} prices updated in ${selectedState}`,
            duration: 3000,
          });
        }
      }, 30000); // Update every 30 seconds
      return () => clearInterval(interval);
    }
  }, [liveUpdates, selectedCrop, selectedState, toast]);

  // Ensure all UI components update when user selections change
  useEffect(() => {
    // Trigger re-render of all computed values when selections change
    const currentData = getCurrentPrices();
    
    if (currentData.length === 0) {
      console.log(`No data available for ${selectedCrop} in ${selectedState}`);
    } else {
      console.log(`Loaded ${currentData.length} market entries for ${selectedCrop} in ${selectedState}`);
    }
    
    // Update the page title to reflect current selection
    document.title = `Market Insights - ${selectedCrop.charAt(0).toUpperCase() + selectedCrop.slice(1)} in ${selectedState.charAt(0).toUpperCase() + selectedState.slice(1)} | AgriTech Platform`;
  }, [selectedState, selectedCrop, sortBy]);

  const getCurrentPrices = () => {
    // Validate that the selected state and crop exist in our market data
    const stateData = marketData[selectedState as keyof typeof marketData];
    if (!stateData) {
      console.warn(`No market data found for state: ${selectedState}`);
      toast({
        title: "Market Data Unavailable",
        description: `No data available for ${selectedState}. Falling back to Maharashtra.`,
        variant: "destructive",
        duration: 4000,
      });
      setSelectedState('maharashtra');
      return [];
    }
    
    const cropData = stateData[selectedCrop as keyof typeof stateData];
    if (!cropData || cropData.length === 0) {
      console.warn(`No ${selectedCrop} data found for ${selectedState}`);
      toast({
        title: "Crop Data Unavailable",
        description: `No ${selectedCrop} data available in ${selectedState}. Try selecting a different crop.`,
        variant: "destructive",
        duration: 4000,
      });
      return [];
    }
    
    const data = cropData || [];
    
    // Sort data based on selected criteria with validation
    return [...data].sort((a, b) => {
      switch (sortBy) {
        case 'price':
          return (b.price || 0) - (a.price || 0);
        case 'volume': {
          const volumeA = parseInt((a.volume || '0').replace(/[^0-9]/g, '')) || 0;
          const volumeB = parseInt((b.volume || '0').replace(/[^0-9]/g, '')) || 0;
          return volumeB - volumeA;
        }
        case 'distance':
        default: {
          const distanceA = parseInt((a.distance || '0').replace(/[^0-9]/g, '')) || 0;
          const distanceB = parseInt((b.distance || '0').replace(/[^0-9]/g, '')) || 0;
          return distanceA - distanceB;
        }
      }
    });
  };

  const getAveragePrice = () => {
    const prices = getCurrentPrices();
    if (prices.length === 0) return 0;
    
    const validPrices = prices.filter(item => item.price && typeof item.price === 'number');
    if (validPrices.length === 0) return 0;
    
    return Math.round(validPrices.reduce((sum, item) => sum + item.price, 0) / validPrices.length);
  };

  const getTrendDirection = () => {
    const prices = getCurrentPrices();
    if (prices.length === 0) return 'neutral';
    
    const validChanges = prices.filter(item => item.change && typeof item.change === 'number');
    if (validChanges.length === 0) return 'neutral';
    
    const avgChange = validChanges.reduce((sum, item) => sum + item.change, 0) / validChanges.length;
    return avgChange > 0 ? 'up' : avgChange < 0 ? 'down' : 'neutral';
  };

  const getTotalVolume = () => {
    const prices = getCurrentPrices();
    if (prices.length === 0) return 0;
    
    return prices.reduce((sum, item) => {
      if (!item.volume) return sum;
      const volume = parseInt(item.volume.replace(/[^0-9,]/g, '').replace(',', '')) || 0;
      return sum + volume;
    }, 0);
  };

  const handleSetPriceAlert = (price: number) => {
    if (!targetPrice) {
      toast({
        title: "Please enter target price",
        description: "Enter a target price to set up the alert",
        variant: "destructive",
      });
      return;
    }

    setPriceAlerts(prev => [...prev, {
      crop: selectedCrop,
      targetPrice: parseInt(targetPrice),
      currentPrice: price,
      createdAt: new Date()
    }]);

    toast({
      title: "Price Alert Set!",
      description: `You'll be notified when ${selectedCrop} reaches ₹${targetPrice}`,
    });

    setTargetPrice('');
  };

  return (
    <div className="min-h-screen warm-gradient">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Enhanced Header */}
        <div className="text-center mb-8">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-4xl font-bold text-foreground">
              Market Insights 📈
            </h1>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  liveUpdates ? 'bg-green-500 animate-pulse shadow-lg shadow-green-500/50' : 'bg-gray-400'
                }`} />
                <span className={`text-sm transition-colors duration-300 ${
                  liveUpdates ? 'text-green-600 font-medium' : 'text-muted-foreground'
                }`}>
                  {liveUpdates ? '🔴 Live Updates Active' : '⏸️ Updates Paused'}
                </span>
              </div>
              <Button
                variant={liveUpdates ? "secondary" : "default"}
                size="sm"
                onClick={() => setLiveUpdates(!liveUpdates)}
              >
                {liveUpdates ? <Zap className="w-4 h-4 mr-2" /> : <RefreshCw className="w-4 h-4 mr-2" />}
                {liveUpdates ? 'Pause' : 'Resume'}
              </Button>
            </div>
          </div>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-2">
            Real-time market prices, trends, and analysis to help you make informed selling decisions
          </p>
          <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <MapPin className="w-4 h-4" />
              <span>Your Location: {userLocation}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowLocationSelector(!showLocationSelector)}
                className="ml-2 h-6 px-2 text-xs"
              >
                <MapPin className="w-3 h-3 mr-1" />
                Change
              </Button>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              <span>Last updated: {lastUpdated.toLocaleTimeString()}</span>
            </div>
            <div className="flex items-center gap-1">
              <Activity className="w-4 h-4" />
              <span>Market Volatility: {marketVolatility.toFixed(1)}%</span>
            </div>
          </div>
        </div>

        {/* Location Selector */}
        {showLocationSelector && (
          <Card className="earth-card p-6 mb-8 max-w-4xl mx-auto">
            <LocationSelector
              selectedLocation={userLocation}
              onLocationChange={(loc) => {
                setIsLoadingData(true);
                setDataTransition(true);
                setUserLocation(loc);
                setShowLocationSelector(false);
                
                // Extract state from location and update market data accordingly
                const stateMapping: { [key: string]: string } = {
                  'maharashtra': 'maharashtra',
                  'mumbai': 'maharashtra',
                  'pune': 'maharashtra',
                  'punjab': 'punjab',
                  'amritsar': 'punjab',
                  'ludhiana': 'punjab',
                  'haryana': 'haryana',
                  'karnal': 'haryana',
                  'ambala': 'haryana',
                  'karnataka': 'karnataka',
                  'bangalore': 'karnataka',
                  'mysore': 'karnataka'
                };
                
                const locLower = loc.toLowerCase();
                const detectedState = Object.keys(stateMapping).find(key => 
                  locLower.includes(key)
                ) || 'maharashtra';
                
                setTimeout(() => {
                  setSelectedState(stateMapping[detectedState]);
                  setIsLoadingData(false);
                  setTimeout(() => setDataTransition(false), 300);
                }, 200);
                
                toast({
                  title: "Location & Market Data Updated",
                  description: `Updated to ${loc} - Loading ${stateMapping[detectedState]} market data`,
                  duration: 3000,
                });
              }}
              showWeather={false} // Market page doesn't need weather data
            />
          </Card>
        )}

        {/* Enhanced Filters */}
        <Card className="earth-card p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Select State
              </label>
              <Select value={selectedState} onValueChange={(value) => {
                setIsLoadingData(true);
                setDataTransition(true);
                setTimeout(() => {
                  setSelectedState(value);
                  setIsLoadingData(false);
                  setTimeout(() => setDataTransition(false), 300);
                }, 150);
                toast({
                  title: "State Updated",
                  description: `Loading market data for ${value}...`,
                  duration: 2000,
                });
              }}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose state" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="maharashtra">Maharashtra</SelectItem>
                  <SelectItem value="punjab">Punjab</SelectItem>
                  <SelectItem value="haryana">Haryana</SelectItem>
                  <SelectItem value="karnataka">Karnataka</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Select Crop
              </label>
              <Select value={selectedCrop} onValueChange={(value) => {
                setIsLoadingData(true);
                setDataTransition(true);
                setTimeout(() => {
                  setSelectedCrop(value);
                  setIsLoadingData(false);
                  setTimeout(() => setDataTransition(false), 300);
                }, 150);
                toast({
                  title: "Crop Updated",
                  description: `Loading ${value} market data...`,
                  duration: 2000,
                });
              }}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose crop" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="rice">🌾 Rice</SelectItem>
                  <SelectItem value="wheat">🌾 Wheat</SelectItem>
                  <SelectItem value="cotton">🌱 Cotton</SelectItem>
                  <SelectItem value="sugarcane">🎋 Sugarcane</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Sort By
              </label>
              <Select value={sortBy} onValueChange={(value) => {
                setDataTransition(true);
                setTimeout(() => {
                  setSortBy(value);
                  setTimeout(() => setDataTransition(false), 200);
                }, 100);
                toast({
                  title: "Sort Updated",
                  description: `Sorting by ${value}...`,
                  duration: 1500,
                });
              }}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="distance">📍 Distance</SelectItem>
                  <SelectItem value="price">💰 Price (High to Low)</SelectItem>
                  <SelectItem value="volume">📦 Volume</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Set Price Alert (₹)
              </label>
              <div className="flex gap-2">
                <Input
                  type="number"
                  placeholder="2500"
                  value={targetPrice}
                  onChange={(e) => setTargetPrice(e.target.value)}
                />
                <Button size="sm" onClick={() => handleSetPriceAlert(getAveragePrice())}>
                  <Bell className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </Card>

        {/* Enhanced Overview Cards */}
        <div className={`grid grid-cols-1 md:grid-cols-4 gap-6 mb-8 transition-all duration-300 ${dataTransition ? 'opacity-70' : 'opacity-100'}`}>
          <Card className="earth-card p-6 text-center border-l-4 border-green-500 transform transition-all duration-300 hover:scale-105 hover:shadow-xl animate-in fade-in-50 duration-700">
            <div className="text-3xl mb-2">💰</div>
            <div className="text-3xl font-bold text-foreground">
              {isLoadingData ? (
                <div className="animate-pulse bg-muted rounded w-20 h-8 mx-auto"></div>
              ) : (
                `₹${getAveragePrice()}`
              )}
            </div>
            <div className="text-sm text-muted-foreground">Average Price/Quintal</div>
            <Progress value={75} className="mt-2" />
          </Card>

          <Card className="earth-card p-6 text-center border-l-4 border-blue-500 transform transition-all duration-300 hover:scale-105 hover:shadow-xl animate-in fade-in-50 duration-700 delay-100">
            <div className="text-3xl mb-2">
              {getTrendDirection() === 'up' ? '📈' : getTrendDirection() === 'down' ? '📉' : '➡️'}
            </div>
            <div className={`text-2xl font-bold ${
              getTrendDirection() === 'up' ? 'text-success' : 
              getTrendDirection() === 'down' ? 'text-destructive' : 'text-muted-foreground'
            }`}>
              {getTrendDirection() === 'up' ? 'Rising' : getTrendDirection() === 'down' ? 'Falling' : 'Stable'}
            </div>
            <div className="text-sm text-muted-foreground">Market Trend</div>
            <Badge className="mt-2" variant={marketVolatility > 3 ? "destructive" : "secondary"}>
              Volatility: {marketVolatility.toFixed(1)}%
            </Badge>
          </Card>

          <Card className="earth-card p-6 text-center border-l-4 border-purple-500 transform transition-all duration-300 hover:scale-105 hover:shadow-xl animate-in fade-in-50 duration-700 delay-200">
            <div className="text-3xl mb-2">🏪</div>
            <div className="text-2xl font-bold text-foreground">
              {isLoadingData ? (
                <div className="animate-pulse bg-muted rounded w-8 h-6 mx-auto"></div>
              ) : (
                getCurrentPrices().length
              )}
            </div>
            <div className="text-sm text-muted-foreground">Active Markets</div>
            <div className="text-xs text-green-600 mt-1">
              Total Volume: {getTotalVolume().toLocaleString()} quintals
            </div>
          </Card>

          <Card className="earth-card p-6 text-center border-l-4 border-orange-500 transform transition-all duration-300 hover:scale-105 hover:shadow-xl animate-in fade-in-50 duration-700 delay-300">
            <div className="text-3xl mb-2">⏰</div>
            <div className="text-2xl font-bold text-foreground">Live</div>
            <div className="text-sm text-muted-foreground">Real-time Data</div>
            <div className="text-xs text-blue-600 mt-1">
              {priceAlerts.length} Active Alerts
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Enhanced Current Prices */}
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-semibold text-foreground mb-6">
              Current {selectedCrop.charAt(0).toUpperCase() + selectedCrop.slice(1)} Prices
            </h2>
            {isLoadingData ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                <div className="ml-4 text-lg text-muted-foreground">Loading market data...</div>
              </div>
            ) : (
              <div className={`space-y-4 transition-all duration-300 ${dataTransition ? 'opacity-50 scale-95' : 'opacity-100 scale-100'}`}>
                {getCurrentPrices().map((mandi, index) => (
                <Card key={index} className="earth-card p-6 border-l-4 border-green-500 transform transition-all duration-300 hover:scale-[1.02] hover:shadow-lg hover:border-green-400 animate-in slide-in-from-left-5 duration-500">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-lg font-semibold text-foreground">{mandi.mandi}</h3>
                        <Badge variant={mandi.marketStatus === 'active' ? "default" : "secondary"}>
                          {mandi.marketStatus === 'active' ? '🟢 Active' : '🟡 Closing Soon'}
                        </Badge>
                        <Badge variant="outline">
                          {mandi.recommendation === 'Buy' && <TrendingUp className="w-3 h-3 mr-1" />}
                          {mandi.recommendation === 'Sell' && <TrendingDown className="w-3 h-3 mr-1" />}
                          {mandi.recommendation}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {mandi.distance}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {mandi.lastUpdated}
                        </span>
                        <span className="flex items-center gap-1">
                          <Activity className="w-3 h-3" />
                          {mandi.traders} traders
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-bold text-foreground">₹{mandi.price}</div>
                      <div className={`text-sm font-medium flex items-center justify-end ${
                        mandi.change > 0 ? 'text-success' : 'text-destructive'
                      }`}>
                        <span className="mr-1">{mandi.change > 0 ? '📈' : '📉'}</span>
                        {Math.abs(mandi.change)}%
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        Range: ₹{mandi.minPrice} - ₹{mandi.maxPrice}
                      </div>
                    </div>
                  </div>
                  
                  {/* Comprehensive Market Details */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                    <div className="bg-blue-50 dark:bg-blue-950 p-3 rounded-lg">
                      <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
                        <Volume2 className="w-3 h-3" />
                        VOLUME
                      </div>
                      <div className="text-sm font-semibold text-blue-600">{mandi.volume}</div>
                    </div>
                    <div className="bg-purple-50 dark:bg-purple-950 p-3 rounded-lg">
                      <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
                        <Star className="w-3 h-3" />
                        QUALITY
                      </div>
                      <div className="text-sm font-semibold text-purple-600">{mandi.quality}</div>
                    </div>
                    <div className="bg-orange-50 dark:bg-orange-950 p-3 rounded-lg">
                      <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
                        <Droplets className="w-3 h-3" />
                        MOISTURE
                      </div>
                      <div className="text-sm font-semibold text-orange-600">{mandi.moisture}</div>
                    </div>
                    <div className="bg-green-50 dark:bg-green-950 p-3 rounded-lg">
                      <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
                        <Target className="w-3 h-3" />
                        VOLATILITY
                      </div>
                      <div className="text-sm font-semibold text-green-600">{mandi.volatility}</div>
                    </div>
                  </div>

                  {/* Price Trend Chart */}
                  <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg mb-4">
                    <div className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
                      <BarChart3 className="w-3 h-3" />
                      PRICE TREND (LAST 5 UPDATES)
                    </div>
                    <div className="flex items-end gap-1 h-12">
                      {mandi.priceHistory.map((price, idx) => {
                        const height = ((price - mandi.minPrice) / (mandi.maxPrice - mandi.minPrice)) * 100;
                        return (
                          <div
                            key={idx}
                            className="bg-gradient-to-t from-green-500 to-green-400 rounded-sm flex-1"
                            style={{ height: `${Math.max(height, 10)}%` }}
                            title={`₹${price}`}
                          />
                        );
                      })}
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground mt-1">
                      <span>₹{Math.min(...mandi.priceHistory)}</span>
                      <span>₹{Math.max(...mandi.priceHistory)}</span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="flex-1">
                      <Bell className="w-4 h-4 mr-2" />
                      Set Alert
                    </Button>
                    <Button size="sm" className="flex-1 bg-cta">
                      <DollarSign className="w-4 h-4 mr-2" />
                      Contact Trader
                    </Button>
                  </div>
                </Card>
                ))}
              </div>
            )}
          </div>

          {/* Enhanced Sidebar */}
          <div className="space-y-6">
            {/* AI Market Analysis */}
            <Card className="earth-card p-6">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  AI Market Analysis
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-green-50 dark:bg-green-950 p-3 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-sm font-medium">Best Selling Opportunity</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {getCurrentPrices().length > 0 && getCurrentPrices()[0].mandi} offers the highest price for {selectedCrop} at ₹{getCurrentPrices()[0]?.price}. Consider selling within 2-3 days.
                  </p>
                </div>
                <div className="bg-blue-50 dark:bg-blue-950 p-3 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="w-4 h-4 text-blue-600" />
                    <span className="text-sm font-medium">Market Forecast</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Expect 2-4% price increase next week. Quality grades A+ showing stronger demand in urban markets.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Market News */}
            <Card className="earth-card p-6">
              <CardHeader className="pb-3">
                <CardTitle>Market News & Updates</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {marketNews.map((news, index) => (
                    <div key={index} className="border-b border-gray-100 dark:border-gray-800 pb-3 last:border-b-0">
                      <div className="flex items-start gap-2">
                        <Badge variant={news.impact === 'positive' ? 'default' : 'destructive'}>
                          {news.impact === 'positive' ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                        </Badge>
                        <div className="flex-1">
                          <h4 className="text-sm font-medium">{news.title}</h4>
                          <p className="text-xs text-muted-foreground mt-1">{news.summary}</p>
                          <p className="text-xs text-muted-foreground mt-1">{news.time}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Active Price Alerts */}
            <Card className="earth-card p-6">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2">
                  <Bell className="w-5 h-5" />
                  Price Alerts ({priceAlerts.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {priceAlerts.length > 0 ? (
                  <div className="space-y-2">
                    {priceAlerts.map((alert, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-yellow-50 dark:bg-yellow-950 rounded">
                        <div>
                          <div className="text-sm font-medium">{alert.crop}</div>
                          <div className="text-xs text-muted-foreground">Target: ₹{alert.targetPrice}</div>
                        </div>
                        <Badge variant="secondary">Active</Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No active alerts. Set price alerts to get notified when your target price is reached.</p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Market;