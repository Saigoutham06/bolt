import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import HeroSection from './components/HeroSection';
import MapSection from './components/MapSection';
import LoginModal from './components/LoginModal';

type View = 'hero' | 'map';
type LoginType = 'passenger' | 'driver';

function App() {
  const [currentView, setCurrentView] = useState<View>('hero');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [loginType, setLoginType] = useState<LoginType>('passenger');
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setCurrentView('map');
  };

  const handleBackToHero = () => {
    setCurrentView('hero');
    setSearchQuery('');
  };

  const openPassengerLogin = () => {
    setLoginType('passenger');
    setIsLoginModalOpen(true);
  };

  const openDriverLogin = () => {
    setLoginType('driver');
    setIsLoginModalOpen(true);
  };

  const closeLoginModal = () => {
    setIsLoginModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 overflow-x-hidden">
      {currentView === 'hero' && (
        <>
          <Header 
            onPassengerLogin={openPassengerLogin}
            onDriverLogin={openDriverLogin}
            isScrolled={isScrolled}
          />
          <HeroSection 
            onSearch={handleSearch}
            onPassengerLogin={openPassengerLogin}
            onDriverLogin={openDriverLogin}
          />
        </>
      )}
      
      {currentView === 'map' && (
        <>
          <Header 
            onPassengerLogin={openPassengerLogin}
            onDriverLogin={openDriverLogin}
            isScrolled={true}
          />
          <MapSection 
            searchQuery={searchQuery}
            onBack={handleBackToHero}
          />
        </>
      )}

      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={closeLoginModal}
        initialTab={loginType}
      />
    </div>
  );
}

export default App;