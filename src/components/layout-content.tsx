"use client";

import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/toaster";
import PWAServiceWorker from "@/components/pwa-service-worker";
import PWAInstallPrompt from "@/components/pwa-install-prompt";
import Footer from "@/components/footer";
import { useAppearance } from "@/hooks/use-appearance";
import ParticlesBackground from "@/components/particles-background";

export default function LayoutContent({ children }: { children: React.ReactNode }) {
  // Initialize appearance settings
  useAppearance();

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
