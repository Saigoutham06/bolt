import { useState, useEffect, createContext, useContext } from 'react';
import { supabase, authAPI } from '../lib/supabase';

interface User {
  id: string;
  email?: string;
  user_type: 'passenger' | 'driver';
  profile: any;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signUp: (type: 'passenger' | 'driver', data: any) => Promise<void>;
  signIn: (type: 'passenger' | 'driver', credentials: any) => Promise<void>;
  signOut: () => Promise<void>;
  sendDriverOTP: (employeeId: string) => Promise<any>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const useAuthProvider = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        loadUserProfile(session.user);
      } else {
        setLoading(false);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          await loadUserProfile(session.user);
        } else {
          setUser(null);
          setLoading(false);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const loadUserProfile = async (authUser: any) => {
    try {
      const userType = authUser.user_metadata?.user_type || 'passenger';
      const table = userType === 'driver' ? 'drivers' : 'passengers';
      
      const { data: profile, error } = await supabase
        .from(table)
        .select('*')
        .eq('id', authUser.id)
        .single();

      if (error) {
        console.error('Error loading profile:', error);
        setUser(null);
      } else {
        setUser({
          id: authUser.id,
          email: authUser.email,
          user_type: userType,
          profile,
        });
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (type: 'passenger' | 'driver', data: any) => {
    setLoading(true);
    try {
      if (type === 'passenger') {
        await authAPI.passengerSignup(data);
        // For passengers, we can sign them in immediately
        const response = await authAPI.passengerLogin(data.email, data.password);
        if (response.session) {
          await supabase.auth.setSession(response.session);
        }
      } else {
        await authAPI.driverSignup(data);
        // Drivers need verification, so we don't sign them in
      }
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (type: 'passenger' | 'driver', credentials: any) => {
    setLoading(true);
    try {
      if (type === 'passenger') {
        const response = await authAPI.passengerLogin(credentials.email, credentials.password);
        if (response.session) {
          await supabase.auth.setSession(response.session);
        }
      } else {
        const response = await authAPI.driverLogin(credentials.employee_id, credentials.otp);
        // For drivers, we handle sessions differently since they use OTP
        // Store driver session in localStorage for demo purposes
        localStorage.setItem('driver_session', JSON.stringify(response));
        setUser({
          id: response.driver.id,
          user_type: 'driver',
          profile: response.driver,
        });
      }
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    setLoading(true);
    try {
      await supabase.auth.signOut();
      localStorage.removeItem('driver_session');
      setUser(null);
    } catch (error) {
      console.error('Error signing out:', error);
    } finally {
      setLoading(false);
    }
  };

  const sendDriverOTP = async (employeeId: string) => {
    return await authAPI.sendDriverOTP(employeeId);
  };

  return {
    user,
    loading,
    signUp,
    signIn,
    signOut,
    sendDriverOTP,
  };
};

export { AuthContext };