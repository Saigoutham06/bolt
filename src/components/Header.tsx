import React from 'react';
import { Bus, User, UserCheck, Menu, X } from 'lucide-react';
import { useLanguage } from '../hooks/useLanguage';
import LanguageSwitcher from './LanguageSwitcher';

interface HeaderProps {
  onPassengerLogin: () => void;
  onDriverLogin: () => void;
  isScrolled?: boolean;
}

const Header: React.FC<HeaderProps> = ({ onPassengerLogin, onDriverLogin, isScrolled = false }) => {
  const { currentLanguage, changeLanguage, t } = useLanguage();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
      isScrolled 
        ? 'bg-white/95 backdrop-blur-xl shadow-2xl border-b border-white/20' 
        : 'bg-gradient-to-b from-black/30 to-transparent backdrop-blur-sm'
    }`}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-teal-400 to-blue-500 rounded-xl transform hover:scale-110 transition-transform duration-300 hover:rotate-3">
              <Bus className="text-white animate-pulse" size={24} />
            </div>
            <div>
              <h1 className={`text-2xl font-bold tracking-tight transition-colors duration-300 ${
                isScrolled ? 'text-gray-900' : 'text-white'
              }`}>
                BusWhere<span className="text-teal-400">+</span>
              </h1>
              <p className={`text-xs transition-colors duration-300 ${
                isScrolled ? 'text-gray-600' : 'text-gray-300'
              }`}>{t('liveTracking')}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <LanguageSwitcher 
              currentLanguage={currentLanguage}
              onLanguageChange={changeLanguage}
              isScrolled={isScrolled}
            />
            
            {/* Desktop Menu */}
            <div className="hidden lg:flex items-center gap-3">
              <button
                onClick={onPassengerLogin}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white font-semibold rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-2xl hover:-translate-y-1"
              >
                <User size={16} />
                {t('passengerLogin')}
              </button>
              <button
                onClick={onDriverLogin}
                className={`flex items-center gap-2 px-6 py-3 backdrop-blur-md border-2 border-teal-400 font-semibold rounded-xl transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 ${
                  isScrolled 
                    ? 'bg-white/20 hover:bg-teal-400 hover:text-white text-gray-900' 
                    : 'bg-white/10 hover:bg-teal-400 hover:text-gray-900 text-white'
                }`}
              >
                <UserCheck size={16} />
                {t('driverLogin')}
              </button>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className={`lg:hidden p-2 rounded-lg transition-all duration-300 ${
                isScrolled ? 'text-gray-900 hover:bg-gray-100' : 'text-white hover:bg-white/10'
              }`}
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <div className={`lg:hidden overflow-hidden transition-all duration-500 ease-in-out ${
          isMobileMenuOpen ? 'max-h-96 opacity-100 mt-6' : 'max-h-0 opacity-0'
        }`}>
          <div className="flex flex-col gap-4 py-4 border-t border-white/20">
            <button
              onClick={() => {
                onPassengerLogin();
                setIsMobileMenuOpen(false);
              }}
              className="flex items-center justify-center gap-2 w-full px-6 py-4 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white font-semibold rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              <User size={18} />
              {t('passengerLogin')}
            </button>
            <button
              onClick={() => {
                onDriverLogin();
                setIsMobileMenuOpen(false);
              }}
              className={`flex items-center justify-center gap-2 w-full px-6 py-4 backdrop-blur-md border-2 border-teal-400 font-semibold rounded-xl transition-all duration-300 transform hover:scale-105 ${
                isScrolled 
                  ? 'bg-white/20 hover:bg-teal-400 hover:text-white text-gray-900' 
                  : 'bg-white/10 hover:bg-teal-400 hover:text-gray-900 text-white'
              }`}
            >
              <UserCheck size={18} />
              {t('driverLogin')}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;