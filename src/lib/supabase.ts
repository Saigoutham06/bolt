// This file is kept for compatibility but now uses mock data
// All Supabase functionality has been replaced with mock implementations

export * from './mockAPI';
export * from './mockData';

// Legacy exports for compatibility
export const supabase = {
  auth: {
    getSession: () => Promise.resolve({ data: { session: null } }),
    onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
    signOut: () => Promise.resolve({ error: null }),
    setSession: () => Promise.resolve({ data: { session: null }, error: null }),
  },
};