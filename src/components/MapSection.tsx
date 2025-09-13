import React, { useEffect, useRef, useState } from 'react';
import { ArrowLeft, Navigation, Clock, MapPin, Zap, Users, Route as RouteIcon, Filter, RefreshCw } from 'lucide-react';
import { useLanguage } from '../hooks/useLanguage';
import { useBusTracking } from '../hooks/useBusTracking';

interface MapSectionProps {
  searchQuery: string;
  onBack: () => void;
}

interface BusData {
  id: string;
  route: string;
  nextStop: string;
  eta: number;
  passengers: number;
  status: 'on-time' | 'delayed' | 'early';
}

const MapSection: React.FC<MapSectionProps> = ({ searchQuery, onBack }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [selectedBus, setSelectedBus] = useState<any>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { t } = useLanguage();
  const { searchResults, liveLocations, loading: trackingLoading, searchBuses, refreshLiveLocations } = useBusTracking();

  // Transform search results for display
  const busData = searchResults.flatMap(result => 
    result.buses.map(bus => ({
      id: bus.id,
      route: result.route.route_number,
      nextStop: bus.location?.next_stop || 'Unknown',
      eta: bus.location?.estimated_arrival ? 
        Math.ceil((new Date(bus.location.estimated_arrival).getTime() - Date.now()) / (1000 * 60)) : 0,
      passengers: bus.current_passengers,
      status: bus.location?.status || 'unknown'
    }))
  );

  useEffect(() => {
    // Search for buses when component mounts or search query changes
    if (searchQuery) {
      searchBuses(searchQuery);
    }
    
    // Simulate initial loading
    const timer = setTimeout(() => setLoading(false), 1500);

    return () => clearTimeout(timer);
  }, [searchQuery, searchBuses]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    refreshLiveLocations();
    if (searchQuery) {
      searchBuses(searchQuery);
    }
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'on-time': return 'text-green-600 bg-green-100';
      case 'delayed': return 'text-red-600 bg-red-100';
      case 'early': return 'text-blue-600 bg-blue-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <section className="relative h-screen bg-gradient-to-br from-slate-100 to-blue-50 pt-20">
      {/* Top Controls Bar */}
      <div className="absolute top-24 left-0 right-0 z-20 px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row gap-4 max-w-7xl mx-auto">
          {/* Back Button */}
          <button
            onClick={onBack}
            className="flex items-center gap-3 px-6 py-3 bg-white/90 backdrop-blur-xl border border-white/20 text-gray-800 font-semibold rounded-xl shadow-lg hover:bg-white hover:shadow-xl transition-all duration-300 transform hover:scale-105 hover:-translate-y-1"
          >
            <ArrowLeft size={20} />
            <span className="hidden sm:inline">{t('backButton')}</span>
          </button>

          {/* Search Info */}
          <div className="flex-1 bg-white/90 backdrop-blur-xl rounded-xl p-4 shadow-lg border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">
                  Showing results for: <span className="font-semibold text-teal-600">"{searchQuery}"</span>
                </p>
                <p className="text-xs text-gray-500 mt-1">Found 3 routes • Updated just now</p>
              </div>
              <button
                onClick={handleRefresh}
                className={`p-2 text-gray-600 hover:text-teal-600 transition-all duration-300 ${
                  isRefreshing ? 'animate-spin' : 'hover:scale-110'
                }`}
              >
                <RefreshCw size={18} />
              </button>
            </div>
          </div>

          {/* Filter Button */}
          <button className="flex items-center gap-2 px-4 py-3 bg-white/90 backdrop-blur-xl border border-white/20 text-gray-800 font-semibold rounded-xl shadow-lg hover:bg-white hover:shadow-xl transition-all duration-300 transform hover:scale-105">
            <Filter size={18} />
            <span className="hidden sm:inline">Filter</span>
          </button>
        </div>
      </div>

      {/* Side Panel */}
      <div className="absolute top-44 right-4 z-20 w-80 max-w-[calc(100vw-2rem)] sm:max-w-sm">
        <div className="bg-white/95 backdrop-blur-xl rounded-xl shadow-2xl border border-white/20 overflow-hidden">
          {/* Panel Header */}
          <div className="bg-gradient-to-r from-teal-500 to-cyan-500 p-4 text-white">
            <h3 className="font-bold text-lg flex items-center gap-2">
              <Zap size={20} />
              Live Tracking
            </h3>
            <p className="text-teal-100 text-sm">Real-time bus information</p>
          </div>

          {/* Bus List */}
          <div className="max-h-96 overflow-y-auto">
            {trackingLoading ? (
              <div className="p-8 text-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-teal-500 border-t-transparent mb-4"></div>
                <p className="text-gray-600">Loading bus data...</p>
              </div>
            ) : busData.length === 0 ? (
              <div className="p-8 text-center">
                <MapPin className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <p className="text-gray-600">No buses found for "{searchQuery}"</p>
                <p className="text-sm text-gray-500 mt-2">Try searching for a different route or location</p>
              </div>
            ) : (
              busData.map((bus, index) => (
              <div
                key={bus.id}
                onClick={() => setSelectedBus(selectedBus?.id === bus.id ? null : bus)}
                className={`p-4 border-b border-gray-100 cursor-pointer transition-all duration-300 hover:bg-blue-50 ${
                  selectedBus?.id === bus.id ? 'bg-blue-50 border-l-4 border-l-teal-500' : ''
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold text-gray-800">{bus.route}</h4>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(bus.status)}`}>
                    {bus.status}
                  </span>
                </div>
                
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <MapPin size={14} className="text-blue-500" />
                    <span>Next: {bus.nextStop}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock size={14} className="text-green-500" />
                    <span>ETA: {bus.eta} min</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users size={14} className="text-orange-500" />
                    <span>{bus.passengers} passengers</span>
                  </div>
                </div>

                {selectedBus?.id === bus.id && (
                  <div className="mt-3 pt-3 border-t border-gray-200 animate-fade-in">
                    <button className="w-full bg-gradient-to-r from-teal-500 to-cyan-500 text-white py-2 rounded-lg font-medium hover:from-teal-600 hover:to-cyan-600 transition-all duration-300 transform hover:scale-105">
                      Track This Bus
                    </button>
                  </div>
                )}
              </div>
              ))
            )}
          </div>

          {/* Quick Stats */}
          <div className="p-4 bg-gray-50 border-t border-gray-200">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-lg font-bold text-teal-600">{searchResults.length}</div>
                <div className="text-xs text-gray-600">Active Routes</div>
              </div>
              <div>
                <div className="text-lg font-bold text-blue-600">
                  {busData.reduce((total, bus) => total + (bus.passengers || 0), 0)}
                </div>
                <div className="text-xs text-gray-600">Total Passengers</div>
              </div>
              <div>
                <div className="text-lg font-bold text-green-600">
                  {busData.length > 0 ? Math.round(busData.reduce((total, bus) => total + bus.eta, 0) / busData.length) : 0}
                </div>
                <div className="text-xs text-gray-600">Avg ETA (min)</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Map Container */}
      <div className="w-full h-full relative overflow-hidden" style={{ height: 'calc(100vh - 5rem)' }}>
        {loading ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-slate-200 to-blue-100">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-teal-500 border-t-transparent mb-6"></div>
              <p className="text-xl font-semibold text-gray-700 mb-2">Loading map...</p>
              <p className="text-sm text-gray-500">Fetching real-time bus data</p>
              <div className="mt-4 flex justify-center space-x-1">
                {[...Array(3)].map((_, i) => (
                  <div
                    key={i}
                    className="w-2 h-2 bg-teal-500 rounded-full animate-pulse"
                    style={{ animationDelay: `${i * 0.2}s` }}
                  />
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div 
            ref={mapRef}
            className="w-full h-full bg-gradient-to-br from-blue-100 via-teal-50 to-cyan-100 relative animate-fade-in"
            style={{
              backgroundImage: `url('https://images.pexels.com/photos/1486222/pexels-photo-1486222.jpeg')`,
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}
          >
            {/* Overlay for better contrast */}
            <div className="absolute inset-0 bg-white/40"></div>
            
            {/* Simulated Bus Markers */}
            {busData.map((bus, index) => {
              const positions = [
                { left: `${25 + index * 15}%`, top: `${30 + index * 10}%` },
                { left: `${60 - index * 5}%`, top: `${45 + index * 8}%` },
                { left: `${40 + index * 12}%`, top: `${70 - index * 15}%` }
              ];
              const colors = ['bg-blue-500', 'bg-green-500', 'bg-orange-500', 'bg-purple-500', 'bg-red-500'];
              
              return (
              <div
                key={bus.id}
                className={`absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all duration-300 hover:scale-125 ${
                  selectedBus?.id === bus.id ? 'scale-125 z-10' : 'animate-pulse'
                }`}
                style={{ left: positions[index]?.left, top: positions[index]?.top }}
                onClick={() => setSelectedBus(selectedBus?.id === bus.id ? null : bus)}
              >
                <div className={`w-5 h-5 ${colors[index % colors.length]} rounded-full shadow-lg border-3 border-white animate-ping absolute`}></div>
                <div className={`w-5 h-5 ${colors[index % colors.length]} rounded-full shadow-lg border-3 border-white relative`}></div>
                <div className={`absolute top-8 left-1/2 transform -translate-x-1/2 bg-white/95 backdrop-blur-sm px-3 py-2 rounded-lg text-xs font-semibold text-gray-800 whitespace-nowrap shadow-lg transition-all duration-300 ${
                  selectedBus?.id === bus.id ? 'scale-110 border-2 border-teal-400' : ''
                }`}>
                  {bus.route}
                  <div className="text-xs text-gray-600 mt-1">
                    {bus.eta} min • {bus.passengers || 0} passengers
                  </div>
                </div>
              </div>
              );
            })}

            {/* Simulated Bus Stops */}
            {[
              { id: 1, left: '20%', top: '25%', name: 'City Center' },
              { id: 2, left: '55%', top: '40%', name: 'Tech Park' },
              { id: 3, left: '35%', top: '65%', name: 'Mall Junction' },
              { id: 4, left: '70%', top: '20%', name: 'Airport Road' },
              { id: 5, left: '15%', top: '80%', name: 'Railway Station' }
            ].map((stop) => (
              <div
                key={stop.id}
                className="absolute transform -translate-x-1/2 -translate-y-1/2 group cursor-pointer"
                style={{ left: stop.left, top: stop.top }}
              >
                <div className="w-3 h-3 bg-red-500 rounded-full border-2 border-white shadow-md group-hover:scale-150 transition-all duration-300 animate-pulse"></div>
                <div className="absolute top-6 left-1/2 transform -translate-x-1/2 bg-white/95 backdrop-blur-sm px-3 py-2 rounded-lg text-xs font-medium text-gray-800 whitespace-nowrap shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
                  {stop.name}
                  <div className="text-xs text-gray-500 mt-1">Bus Stop</div>
                </div>
              </div>
            ))}

            {/* Route Lines */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-30">
              <defs>
                <linearGradient id="routeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#14b8a6" />
                  <stop offset="100%" stopColor="#06b6d4" />
                </linearGradient>
              </defs>
              <path
                d="M 20% 25% Q 40% 10% 60% 45% T 70% 20%"
                stroke="url(#routeGradient)"
                strokeWidth="3"
                fill="none"
                strokeDasharray="10,5"
                className="animate-pulse"
              />
              <path
                d="M 25% 30% Q 35% 50% 40% 70% T 15% 80%"
                stroke="url(#routeGradient)"
                strokeWidth="3"
                fill="none"
                strokeDasharray="10,5"
                className="animate-pulse"
                style={{ animationDelay: '1s' }}
              />
            </svg>
          </div>
        )}
      </div>
    </section>
  );
};

export default MapSection;