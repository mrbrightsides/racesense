'use client';

import { useState, useCallback } from 'react';

interface QuickAuthUser {
  fid: number;
  username: string;
  displayName: string;
  pfpUrl: string;
}

interface UseQuickAuthReturn {
  user: QuickAuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  signIn: () => Promise<void>;
  signOut: () => void;
}

export function useQuickAuth(): UseQuickAuthReturn {
  const [user, setUser] = useState<QuickAuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const signIn = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      // Stub implementation for standalone deployment
      // In Farcaster context, this would use Quick Auth
      console.log('Quick Auth sign in called');
      
      // Simulate async operation
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock user data for standalone testing
      const mockUser: QuickAuthUser = {
        fid: 12345,
        username: 'racer',
        displayName: 'Race Driver',
        pfpUrl: ''
      };
      
      setUser(mockUser);
      setIsLoading(false);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Authentication failed';
      setError(errorMessage);
      setIsLoading(false);
      throw err;
    }
  }, []);

  const signOut = useCallback((): void => {
    setUser(null);
    setError(null);
    console.log('Quick Auth sign out called');
  }, []);

  return {
    user,
    isAuthenticated: !!user,
    isLoading,
    error,
    signIn,
    signOut
  };
}
