import "../app/globals.css"; 
import "../styles/mobile.css";
import LoadingBar from "@/components/loadingbar";
import DevConsole from "@/components/DevConsole";
import { LoadingProvider } from "@/context/LoadingContext";
import { ModalProvider } from "@/context/ModalContext";
import { ServiceWorkerInitializer } from "@/components/ServiceWorkerInitializer";
import { Metadata, Viewport } from 'next';

export const metadata: Metadata = {
  title: {
    template: "Beer de Vreeze - %s",
    default: "Beer de Vreeze - Portfolio"
  },
  description: "Game Developer Portfolio - Systems & Tools Game Developer specializing in Unity, C#, and AI",
  keywords: ["game developer", "unity", "c#", "portfolio", "beer de vreeze", "indie games"],
  authors: [{ name: "Beer de Vreeze" }],
  creator: "Beer de Vreeze",
  publisher: "Beer de Vreeze",
  icons: {
    icon: [
      { url: '/favicon/favicon.ico', sizes: 'any' },
      { url: '/favicon/favicon-16x16.png', sizes: '16x16' },
      { url: '/favicon/favicon-32x32.png', sizes: '32x32' },
      { url: '/icons/controller-favicon.png', sizes: '48x48' }
    ],
    shortcut: '/favicon/favicon.ico',
    apple: '/favicon/apple-touch-icon.png',
    other: [
      { rel: 'android-chrome', url: '/favicon/android-chrome-192x192.png', sizes: '192x192' },
      { rel: 'android-chrome', url: '/favicon/android-chrome-512x512.png', sizes: '512x512' }
    ]
  },
  manifest: '/favicon/site.webmanifest',
  other: {
    'apple-mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-status-bar-style': 'black-translucent',
    'format-detection': 'telephone=no',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#000000',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {  
  return (
    <html lang="en">
      <head>
        <meta name="theme-color" content="#000000" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* Preload critical resources */}
        <link rel="preload" href="/images/Beer.webp" as="image" type="image/webp" />
        <link rel="dns-prefetch" href="https://img.itch.zone" />
        {/* 
          🎮 Developer Easter Egg:
          Try the classic gaming sequence: ↑↑↓↓←→←→BA
          (Use arrow keys and B, A keys on your keyboard)
          What could it unlock? 🤔
        */}
      </head>
      <body className="bg-black text-white custom-scrollbar min-h-screen">
        <LoadingProvider>
          <ModalProvider>
            <ServiceWorkerInitializer />
            <LoadingBar />
            <DevConsole />
            <main>
              {children}
            </main>
          </ModalProvider>
        </LoadingProvider>
      </body>
    </html>
  );
}

