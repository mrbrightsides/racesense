'use client';

import { useEffect } from 'react';

export function ReadyNotifier(): null {
  useEffect(() => {
    // Notify parent window that the mini-app is ready
    if (typeof window !== 'undefined' && window.parent !== window) {
      window.parent.postMessage({ type: 'MINI_APP_READY' }, '*');
    }
  }, []);

  return null;
}
