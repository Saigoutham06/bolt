import { useState, useEffect, useCallback } from 'react';
import { busAPI, subscriptions } from '../lib/mockAPI';

interface BusTrackingData {
  route: {
    id: string;
    route_number: string;
    route_name: string;
    start_location: string;
    end_location: string;
    estimated_duration: number;
  };
  buses: Array<{
    id: string;
    bus_number: string;
    current_passengers: number;
    capacity: number;
    location: {
      latitude: number;
      longitude: number;
      speed: number;
      status: 'on-time' | 'delayed' | 'early' | 'breakdown';
      estimated_arrival: string;
      next_stop: string;
      last_updated: string;
    } | null;
  }>;
}

export const useBusTracking = () => {
  const [searchResults, setSearchResults] = useState<BusTrackingData[]>([]);
  const [liveLocations, setLiveLocations] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Search buses
  const searchBuses = useCallback(async (query: string, latitude?: number, longitude?: number) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await busAPI.searchBuses(query, latitude, longitude);
      setSearchResults(response.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to search buses');
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Get live locations
  const refreshLiveLocations = useCallback(async () => {
    try {
      const response = await busAPI.getLiveLocations();
      setLiveLocations(response.data || []);
    } catch (err) {
      console.error('Failed to refresh live locations:', err);
    }
  }, []);

  // Subscribe to real-time updates
  useEffect(() => {
    const subscription = subscriptions.subscribeToBusLocations((payload) => {
      console.log('Bus location update:', payload);
      // Refresh live locations when there's an update
      refreshLiveLocations();
    });

    // Initial load of live locations
    refreshLiveLocations();

    return () => {
      subscription.unsubscribe();
    };
  }, [refreshLiveLocations]);

  return {
    searchResults,
    liveLocations,
    loading,
    error,
    searchBuses,
    refreshLiveLocations,
  };
};

export const useRouteDetails = (routeId: string | null) => {
  const [routeDetails, setRouteDetails] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!routeId) {
      setRouteDetails(null);
      return;
    }

    const fetchRouteDetails = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const response = await busAPI.getRouteDetails(routeId);
        setRouteDetails(response.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to get route details');
        setRouteDetails(null);
      } finally {
        setLoading(false);
      }
    };

    fetchRouteDetails();
  }, [routeId]);

  return { routeDetails, loading, error };
};

export const useNearbyStops = (latitude?: number, longitude?: number, radius = 2) => {
  const [nearbyStops, setNearbyStops] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!latitude || !longitude) {
      setNearbyStops([]);
      return;
    }

    const fetchNearbyStops = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const response = await busAPI.getNearbyStops(latitude, longitude, radius);
        setNearbyStops(response.data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to get nearby stops');
        setNearbyStops([]);
      } finally {
        setLoading(false);
      }
    };

    fetchNearbyStops();
  }, [latitude, longitude, radius]);

  return { nearbyStops, loading, error };
};

export const useBusSubscription = (busId: string | null) => {
  const [busData, setBusData] = useState<any>(null);

  useEffect(() => {
    if (!busId) {
      setBusData(null);
      return;
    }

    const subscription = subscriptions.subscribeToBus(busId, (payload) => {
      console.log('Bus update:', payload);
      setBusData(payload.new);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [busId]);

  return { busData };
};