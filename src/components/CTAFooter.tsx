import React from 'react';
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, Zap, Users } from 'lucide-react';
import { Link } from 'react-router-dom';

const CTAFooter: React.FC = () => {
  return (
    <section className="py-24 relative overflow-hidden">
      {/* Dynamic Background */}
      <div className="absolute inset-0 hero-gradient" />
      <div className="absolute inset-0 opacity-30">
        <div className="w-full h-full" style={{
          backgroundImage: `
            radial-gradient(circle at 25% 25%, rgba(0, 255, 183, 0.2) 0%, transparent 50%),
            radial-gradient(circle at 75% 75%, rgba(255, 184, 0, 0.2) 0%, transparent 50%)
          `
        }} />
      </div>
      
      {/* Floating Elements */}
      <div className="absolute top-20 left-20 w-24 h-24 bg-primary/20 rounded-full blur-xl animate-float" />
      <div className="absolute bottom-20 right-20 w-32 h-32 bg-accent/20 rounded-full blur-2xl animate-bounce-gentle" />
      <div className="absolute top-1/2 left-1/3 w-16 h-16 bg-cta/25 rounded-full blur-lg animate-pulse-glow" />
      
      <div className="max-w-6xl mx-auto px-6 text-center relative z-10">
        <div className="fade-in-up space-y-8">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-card-glass backdrop-blur-xl rounded-full px-6 py-3 border border-primary/30 mb-6">
            <Sparkles className="w-5 h-5 text-primary animate-pulse-glow" />
            <span className="font-mono text-sm font-medium text-foreground">
              Ready to Transform Your Farm?
            </span>
          </div>
          
          {/* Main Headline */}
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-display font-bold text-foreground mb-6 sm:mb-8 leading-tight px-4 sm:px-0">
            Rejoignez la
            <span className="block electric-gradient bg-clip-text text-transparent">
              Révolution Agricole
            </span>
          </h2>
          
          <p className="text-lg sm:text-xl md:text-2xl text-muted-foreground mb-8 sm:mb-12 max-w-4xl mx-auto leading-relaxed px-4 sm:px-0">
            Commencez votre parcours avec Composte AI. Obtenez des recommandations personnalisées,
            un suivi en temps réel et rejoignez une communauté d'agriculteurs connectés.
          </p>
          
          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center items-center mb-12 sm:mb-16 px-4 sm:px-0">
            <Link to="/auth" className="w-full sm:w-auto">
              <button className="btn-holographic group w-full sm:w-auto text-sm sm:text-base">
                <Zap className="w-5 h-5 sm:w-6 sm:h-6 mr-2 sm:mr-3 group-hover:animate-magnetic" />
                Commencer gratuitement
                <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 ml-2 sm:ml-3 group-hover:translate-x-1 transition-transform" />
              </button>
            </Link>
            
            <Link to="/dashboard" className="w-full sm:w-auto">
              <button className="btn-glass group w-full sm:w-auto text-sm sm:text-base">
                <Users className="w-5 h-5 sm:w-6 sm:h-6 mr-2 sm:mr-3" />
                Voir la démo
              </button>
            </Link>
          </div>
          
          {/* Trust Indicators */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8 max-w-4xl mx-auto px-4 sm:px-0">
            <div className="glass-card group p-4 sm:p-6">
              <div className="text-2xl sm:text-3xl mb-2 sm:mb-3">🚀</div>
              <div className="font-display font-bold text-foreground mb-1 sm:mb-2 text-sm sm:text-base">Launch in 5 Minutes</div>
              <div className="text-xs sm:text-sm text-muted-foreground">No complex setup required</div>
            </div>
            
            <div className="glass-card group p-4 sm:p-6">
              <div className="text-2xl sm:text-3xl mb-2 sm:mb-3">🛡️</div>
              <div className="font-display font-bold text-foreground mb-1 sm:mb-2 text-sm sm:text-base">Enterprise Security</div>
              <div className="text-xs sm:text-sm text-muted-foreground">Bank-level data protection</div>
            </div>
            
            <div className="glass-card group p-4 sm:p-6">
              <div className="text-2xl sm:text-3xl mb-2 sm:mb-3">🎯</div>
              <div className="font-display font-bold text-foreground mb-1 sm:mb-2 text-sm sm:text-base">24/7 AI Support</div>
              <div className="text-xs sm:text-sm text-muted-foreground">Always-on agricultural assistance</div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Footer Links */}
      <footer className="mt-16 sm:mt-24 pt-8 sm:pt-12 border-t border-border/20 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 mb-8 sm:mb-12">
            <div className="sm:col-span-2 md:col-span-1">
              <div className="flex items-center space-x-3 mb-3 sm:mb-4">
                <img src="/composte-logo.jpg" alt="Composte AI" className="w-8 h-8 rounded-full object-cover" />
                <h3 className="font-display font-bold text-foreground text-base sm:text-lg">Composte AI</h3>
              </div>
              <p className="text-muted-foreground text-xs sm:text-sm leading-relaxed">
                Agriculture intelligente alimentée par l'IA pour cultiver mieux et durablement.
              </p>
            </div>
            
            <div>
              <h4 className="font-display font-semibold text-foreground mb-3 sm:mb-4 text-sm sm:text-base">Platform</h4>
              <ul className="space-y-1 sm:space-y-2 text-xs sm:text-sm text-muted-foreground">
                <li><Link to="/soil-analysis" className="hover:text-primary transition-colors">Soil Analysis</Link></li>
                <li><Link to="/disease-scanner" className="hover:text-primary transition-colors">Disease Detection</Link></li>
                <li><Link to="/weather-analytics" className="hover:text-primary transition-colors">Weather Intelligence</Link></li>
                <li><Link to="/market" className="hover:text-primary transition-colors">Market Analytics</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-display font-semibold text-foreground mb-3 sm:mb-4 text-sm sm:text-base">Resources</h4>
              <ul className="space-y-1 sm:space-y-2 text-xs sm:text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-primary transition-colors">Documentation</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">API Reference</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Community</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Support</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-display font-semibold text-foreground mb-3 sm:mb-4 text-sm sm:text-base">Company</h4>
              <ul className="space-y-1 sm:space-y-2 text-xs sm:text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-primary transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Press</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Contact</a></li>
              </ul>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row justify-between items-center pt-6 sm:pt-8 border-t border-border/20">
            <div className="text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-0">
              © 2025 Composte AI. Tous droits réservés.
            </div>
            <div className="flex items-center gap-4 sm:gap-6 text-xs sm:text-sm text-muted-foreground">
              <a href="#" className="hover:text-primary transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-primary transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-primary transition-colors">Cookie Policy</a>
            </div>
          </div>
        </div>
      </footer>
    </section>
  );
};

export default CTAFooter;
