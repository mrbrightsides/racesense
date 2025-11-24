'use client';

import { useState, useEffect } from 'react';

export function useIsInFarcaster(): boolean {
  const [isInFarcaster, setIsInFarcaster] = useState(false);

  useEffect(() => {
    // Check if running in Farcaster context
    // This checks for Farcaster SDK availability
    const checkFarcasterContext = (): boolean => {
      if (typeof window === 'undefined') return false;
      
      // Check for Farcaster SDK or frame context
      // @ts-ignore - Farcaster SDK may not be typed
      return !!(window.farcaster || window.parent !== window);
    };

    setIsInFarcaster(checkFarcasterContext());
  }, []);

  return isInFarcaster;
}
