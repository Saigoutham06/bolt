import React, { useState } from 'react';
import { Search, MapPin, Clock, Route, User, UserCheck, Zap, Shield, Smartphone } from 'lucide-react';
import { useLanguage } from '../hooks/useLanguage';

interface HeroSectionProps {
  onSearch: (query: string) => void;
  onPassengerLogin: () => void;
  onDriverLogin: () => void;
}

const HeroSection: React.FC<HeroSectionProps> = ({ 
  onSearch, 
  onPassengerLogin, 
  onDriverLogin 
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const { t } = useLanguage();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      onSearch(searchQuery.trim());
    }
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-blue-900 to-teal-900 animate-gradient-x">
        <div className="absolute inset-0 bg-[url('https://images.pexels.com/photos/378570/pexels-photo-378570.jpeg')] bg-cover bg-center opacity-20 animate-pulse"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/50 to-transparent"></div>
        
        {/* Animated mesh gradient overlay */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl animate-blob"></div>
          <div className="absolute top-0 -right-4 w-72 h-72 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-4000"></div>
        </div>
      </div>

      {/* Floating Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className={`absolute bg-gradient-to-r from-teal-400 to-cyan-400 rounded-full opacity-20 animate-float`}
            style={{
              width: `${Math.random() * 8 + 4}px`,
              height: `${Math.random() * 8 + 4}px`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${i * 0.2}s`,
              animationDuration: `${3 + Math.random() * 4}s`
            }}
          />
        ))}
      </div>

      <div className="relative z-10 container mx-auto px-4 text-center text-white max-w-6xl">
        {/* Main Heading */}
        <div className="max-w-5xl mx-auto mb-16 animate-fade-in-up">
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-6 bg-gradient-to-r from-white via-teal-100 to-cyan-200 bg-clip-text text-transparent leading-tight animate-text-shimmer">
            {t('heroTitle')}
          </h1>
          <p className="text-lg sm:text-xl md:text-2xl text-gray-300 leading-relaxed max-w-3xl mx-auto animate-fade-in-up animation-delay-300">
            {t('heroSubtitle')}
          </p>
        </div>

        {/* Search Section */}
        <div className="max-w-4xl mx-auto mb-20 animate-fade-in-up animation-delay-600">
          <form onSubmit={handleSearch} className="relative group">
            <div className={`absolute inset-0 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-2xl transition-all duration-500 blur-xl ${
              isSearchFocused ? 'opacity-40 scale-105' : 'opacity-20 group-hover:opacity-30'
            }`}></div>
            <div className={`relative bg-white/95 backdrop-blur-xl rounded-2xl p-2 shadow-2xl border transition-all duration-300 ${
              isSearchFocused ? 'border-teal-400 shadow-3xl scale-105' : 'border-white/20 group-hover:shadow-3xl'
            }`}>
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <div className="flex-shrink-0 p-4 sm:p-4">
                  <Search className={`transition-all duration-300 ${
                    isSearchFocused ? 'text-teal-600 scale-110' : 'text-teal-600'
                  }`} size={24} />
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setIsSearchFocused(true)}
                  onBlur={() => setIsSearchFocused(false)}
                  placeholder={t('searchInputPlaceholder')}
                  className="flex-1 w-full sm:w-auto py-4 px-2 bg-transparent text-gray-800 text-lg placeholder-gray-500 focus:outline-none transition-all duration-300"
                />
                <button
                  type="submit"
                  className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white font-semibold rounded-xl transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 shadow-lg hover:shadow-2xl"
                >
                  {t('searchButton')}
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-16 max-w-6xl mx-auto">
          {[
            { icon: MapPin, title: t('liveTracking'), desc: t('liveTracking'), color: "from-blue-500 to-purple-600" },
            { icon: Clock, title: t('nearbyStops'), desc: t('nearbyStops'), color: "from-green-500 to-teal-600" },
            { icon: Route, title: t('routeInfo'), desc: t('routeInfo'), color: "from-orange-500 to-red-600" },
            { icon: Zap, title: t('smartPredictions'), desc: t('smartPredictionsDesc'), color: "from-yellow-500 to-orange-600" },
            { icon: Shield, title: t('safeSecure'), desc: t('safeSecureDesc'), color: "from-indigo-500 to-blue-600" },
            { icon: Smartphone, title: t('mobileFirst'), desc: t('mobileFirstDesc'), color: "from-pink-500 to-purple-600" }
          ].map((feature, index) => (
            <div
              key={index}
              className={`group p-6 bg-white/10 backdrop-blur-md rounded-xl border border-white/20 hover:bg-white/20 transition-all duration-500 transform hover:-translate-y-3 hover:scale-105 animate-fade-in-up ${
                index < 3 ? '' : 'sm:col-span-2 lg:col-span-1'
              }`}
              style={{ animationDelay: `${900 + index * 150}ms` }}
            >
              <div className={`p-3 bg-gradient-to-br ${feature.color} rounded-lg w-fit mx-auto mb-4 group-hover:scale-125 group-hover:rotate-12 transition-all duration-500 shadow-lg group-hover:shadow-2xl`}>
                <feature.icon className="text-white" size={24} />
              </div>
              <h3 className="text-lg font-semibold mb-2 group-hover:text-teal-300 transition-colors duration-300">{feature.title}</h3>
              <p className="text-gray-300 text-sm group-hover:text-gray-200 transition-colors duration-300">{feature.desc}</p>
            </div>
          ))}
        </div>

        {/* Call to Action */}
        <div className="lg:hidden flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto animate-fade-in-up animation-delay-1500">
          <button
            onClick={onPassengerLogin}
            className="flex items-center justify-center gap-3 w-full px-8 py-4 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white font-semibold rounded-xl transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 shadow-lg hover:shadow-2xl"
          >
            <User size={20} />
            {t('passengerLogin')}
          </button>
          <button
            onClick={onDriverLogin}
            className="flex items-center justify-center gap-3 w-full px-8 py-4 bg-white/10 backdrop-blur-md border-2 border-teal-400 hover:bg-teal-400 hover:text-gray-900 text-white font-semibold rounded-xl transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 shadow-lg hover:shadow-2xl"
          >
            <UserCheck size={20} />
            {t('driverLogin')}
          </button>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center">
          <div className="w-1 h-3 bg-white/50 rounded-full mt-2 animate-pulse"></div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;