'use client';

import { useEffect } from 'react';

export function ResponseLogger(): null {
  useEffect(() => {
    // Log component mount for debugging
    console.log('ResponseLogger mounted');
  }, []);

  return null;
}
