import React from 'react';
import { Button } from "@/components/ui/button";
import { Sparkles, Zap, TrendingUp, Leaf, Microscope, CloudRain, BarChart3 } from 'lucide-react';
import { Link } from 'react-router-dom';

const HeroSection: React.FC = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Green Gradient Background matching Composte AI logo */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#1B4D35] via-[#2d6b4a] to-[#1a3d2b] opacity-95" />
      
      {/* Animated Particles */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(30)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-white/20 rounded-full animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 3}s`
            }}
          />
        ))}
      </div>
      
      {/* Main Content */}
      <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 text-center">
        <div className="fade-in-up space-y-6 sm:space-y-8">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-xl rounded-full px-4 sm:px-6 py-2 sm:py-3 border border-white/30 mb-4 sm:mb-6">
            <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-white animate-pulse" />
            <span className="font-mono text-xs sm:text-sm font-medium text-white">
              🌱 Composte AI — Agriculture Intelligente
            </span>
          </div>
          
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-display font-bold text-gray-900 mb-4 sm:mb-6 leading-tight">
            Cultivez mieux avec
            <span className="block sm:inline text-white drop-shadow-lg">
              {" "}l'Intelligence Artificielle
            </span>
          </h1>
          
          <p className="text-base sm:text-lg md:text-xl text-gray-800 mb-6 sm:mb-8 max-w-4xl mx-auto leading-relaxed px-2 sm:px-4">
            Recommandations de cultures personnalisées grâce à la
            <span className="font-semibold text-gray-900"> fusion de données en temps réel</span>,
            l'analyse prédictive et des
            <span className="font-semibold text-gray-900"> insights agricoles intelligents</span>
          </p>
          
          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center mb-8 sm:mb-12 px-2 sm:px-4">
            <Link to="/soil-analysis" className="w-full sm:w-auto max-w-xs sm:max-w-none">
              <Button className="bg-gray-900 hover:bg-gray-800 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-semibold text-sm sm:text-base w-full transition-all duration-300 hover:scale-105 shadow-lg">
                <Zap className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                Analyser mon sol
              </Button>
            </Link>
            
            <Link to="/dashboard" className="w-full sm:w-auto max-w-xs sm:max-w-none">
              <Button className="bg-[#FFB800] hover:bg-[#e6a600] text-gray-900 px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-semibold text-sm sm:text-base w-full transition-all duration-300 hover:scale-105 shadow-lg">
                <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                Voir le tableau de bord
              </Button>
            </Link>
          </div>
          
          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-6 max-w-4xl mx-auto px-2 sm:px-4">
            <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-4 sm:p-6 border border-white/20 hover:bg-white/20 transition-all duration-300">
              <div className="text-2xl sm:text-3xl font-display font-bold text-white mb-1 sm:mb-2">98.7%</div>
              <div className="text-xs sm:text-sm font-medium text-gray-200">Prediction Accuracy</div>
              <div className="w-full h-1 bg-white/30 rounded-full mt-2 sm:mt-3 overflow-hidden">
                <div className="w-[98.7%] h-full bg-white rounded-full animate-pulse" />
              </div>
            </div>
            
            <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-4 sm:p-6 border border-white/20 hover:bg-white/20 transition-all duration-300">
              <div className="text-2xl sm:text-3xl font-display font-bold text-white mb-1 sm:mb-2">50M+</div>
              <div className="text-xs sm:text-sm font-medium text-gray-200">Crops Analyzed</div>
              <div className="w-full h-1 bg-white/30 rounded-full mt-2 sm:mt-3 overflow-hidden">
                <div className="w-full h-full bg-[#FFB800] rounded-full animate-pulse" />
              </div>
            </div>
            
            <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-4 sm:p-6 border border-white/20 hover:bg-white/20 transition-all duration-300">
              <div className="text-2xl sm:text-3xl font-display font-bold text-white mb-1 sm:mb-2">180+</div>
              <div className="text-xs sm:text-sm font-medium text-gray-200">Countries Served</div>
              <div className="w-full h-1 bg-white/30 rounded-full mt-2 sm:mt-3 overflow-hidden">
                <div className="w-full h-full bg-white rounded-full animate-pulse" />
              </div>
            </div>
          </div>
          
          {/* Quick Access Feature Icons */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 max-w-2xl mx-auto mt-8 sm:mt-12 px-2 sm:px-4">
            <Link to="/soil-analysis" className="group">
              <div className="bg-white/10 backdrop-blur-xl rounded-xl p-3 sm:p-4 border border-white/20 hover:bg-white/20 transition-all duration-300 hover:scale-105">
                <Leaf className="w-6 h-6 sm:w-8 sm:h-8 text-white mx-auto mb-1 sm:mb-2 group-hover:animate-bounce" />
                <div className="text-xs sm:text-sm font-medium text-white">🌱 Soil Analysis</div>
              </div>
            </Link>
            
            <Link to="/disease-scanner" className="group">
              <div className="bg-white/10 backdrop-blur-xl rounded-xl p-3 sm:p-4 border border-white/20 hover:bg-white/20 transition-all duration-300 hover:scale-105">
                <Microscope className="w-6 h-6 sm:w-8 sm:h-8 text-white mx-auto mb-1 sm:mb-2 group-hover:animate-bounce" />
                <div className="text-xs sm:text-sm font-medium text-white">🔍 Disease Scanner</div>
              </div>
            </Link>
            
            <Link to="/weather-analytics" className="group">
              <div className="bg-white/10 backdrop-blur-xl rounded-xl p-3 sm:p-4 border border-white/20 hover:bg-white/20 transition-all duration-300 hover:scale-105">
                <CloudRain className="w-6 h-6 sm:w-8 sm:h-8 text-white mx-auto mb-1 sm:mb-2 group-hover:animate-bounce" />
                <div className="text-xs sm:text-sm font-medium text-white">🌤️ Weather</div>
              </div>
            </Link>
            
            <Link to="/market" className="group">
              <div className="bg-white/10 backdrop-blur-xl rounded-xl p-3 sm:p-4 border border-white/20 hover:bg-white/20 transition-all duration-300 hover:scale-105">
                <BarChart3 className="w-6 h-6 sm:w-8 sm:h-8 text-white mx-auto mb-1 sm:mb-2 group-hover:animate-bounce" />
                <div className="text-xs sm:text-sm font-medium text-white">📈 Market</div>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
