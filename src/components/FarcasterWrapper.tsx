'use client';

import type { ReactNode } from 'react';

interface FarcasterWrapperProps {
  children: ReactNode;
}

export default function FarcasterWrapper({ children }: FarcasterWrapperProps): JSX.Element {
  // Stub wrapper for standalone deployment
  // In Farcaster context, this would include SDK initialization
  return <>{children}</>;
}
