"use client";

import { useState, useEffect } from "react";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/toaster";
import PWAServiceWorker from "@/components/pwa-service-worker";
import PWAInstallPrompt from "@/components/pwa-install-prompt";
import Footer from "@/components/footer";
import { useAppearance } from "@/hooks/use-appearance";
import ParticlesBackground from "@/components/particles-background";
import { UnifiedStorageService } from "@/services/unified-storage-service";

export default function LayoutContent({ children }: { children: React.ReactNode }) {
  // Initialize appearance settings
  useAppearance();

  const [isStorageReady, setIsStorageReady] = useState(() => UnifiedStorageService.isReady);

  useEffect(() => {
    UnifiedStorageService.initialize().finally(() => {
      setIsStorageReady(true);
    });
  }, []);

  if (!isStorageReady) {
    // Show a minimal loading state while loading from localforage to RAM
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-12 w-12 rounded-full border-4 border-primary border-t-transparent animate-spin mb-4"></div>
          <p className="text-muted-foreground font-space-grotesk text-sm">
            Mindhouse hazırlanıyor...
          </p>
        </div>
      </div>
    );
  }

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
      storageKey="mindhouse-theme"
    >
      <ParticlesBackground />
      <div className="flex-grow relative z-10">{children}</div>
      <Toaster />
      <PWAServiceWorker />
      <PWAInstallPrompt />
      <Footer />
    </ThemeProvider>
  );
}
