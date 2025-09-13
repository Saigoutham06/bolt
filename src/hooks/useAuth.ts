import { useState, useEffect, createContext, useContext } from 'react';
import { authAPI } from '../lib/mockAPI';

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
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Check for existing session in localStorage
    const savedSession = localStorage.getItem('auth_session');
    if (savedSession) {
      try {
        const session = JSON.parse(savedSession);
        if (session.expires_at > Date.now()) {
          setUser(session.user);
        } else {
          localStorage.removeItem('auth_session');
        }
      } catch (error) {
        localStorage.removeItem('auth_session');
      }
    }
  }, []);

  const signUp = async (type: 'passenger' | 'driver', data: any) => {
    setLoading(true);
    try {
      if (type === 'passenger') {
        const response = await authAPI.passengerSignup(data);
        // Auto sign in after successful signup
        const loginResponse = await authAPI.passengerLogin(data.email, data.password);
        
        const userData = {
          id: response.user.id,
          email: response.user.email,
          user_type: 'passenger' as const,
          profile: response.user,
        };
        
        setUser(userData);
        
        // Save session
        const session = {
          user: userData,
          expires_at: Date.now() + 3600000, // 1 hour
        };
        localStorage.setItem('auth_session', JSON.stringify(session));
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
        
        const userData = {
          id: response.user.id,
          email: response.user.email,
          user_type: 'passenger' as const,
          profile: response.user,
        };
        
        setUser(userData);
        
        // Save session
        const session = {
          user: userData,
          expires_at: Date.now() + 3600000, // 1 hour
        };
        localStorage.setItem('auth_session', JSON.stringify(session));
      } else {
        const response = await authAPI.driverLogin(credentials.employee_id, credentials.otp);
        
        const userData = {
          id: response.driver.id,
          user_type: 'driver' as const,
          profile: response.driver,
        };
        
        setUser(userData);
        
        // Save driver session
        const session = {
          user: userData,
          expires_at: Date.now() + 3600000, // 1 hour
        };
        localStorage.setItem('auth_session', JSON.stringify(session));
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
      localStorage.removeItem('auth_session');
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