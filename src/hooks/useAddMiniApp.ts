'use client';

import { useState } from 'react';

interface UseAddMiniAppReturn {
  addMiniApp: () => Promise<void>;
  isAdding: boolean;
  error: string | null;
}

export function useAddMiniApp(): UseAddMiniAppReturn {
  const [isAdding, setIsAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addMiniApp = async (): Promise<void> => {
    setIsAdding(true);
    setError(null);

    try {
      // Stub implementation for standalone deployment
      // In Farcaster context, this would use the SDK
      console.log('Add Mini App called');
      
      // Simulate async operation
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setIsAdding(false);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to add mini app';
      setError(errorMessage);
      setIsAdding(false);
      throw err;
    }
  };

  return { addMiniApp, isAdding, error };
}
