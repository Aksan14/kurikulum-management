"use client"

import { AuthProvider } from '@/contexts';
import { AlertProvider } from '@/components/ui/custom-alert';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <AlertProvider>
        {children}
      </AlertProvider>
    </AuthProvider>
  );
}
