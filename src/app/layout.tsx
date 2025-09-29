import "../app/globals.css"; 
import "../styles/mobile.css";
import "../styles/performance.css";
import "../styles/critical.css";
import LoadingBar from "@/components/performance/loadingbar";
import DevConsole from "@/components/features/DevConsole";
import NotificationContainer from "@/components/ui/NotificationContainer";
import WebsiteStructuredData from "@/components/seo/WebsiteStructuredData";
import { LoadingProvider } from "@/context/LoadingContext";
import { ModalProvider } from "@/context/ModalContext";
import { ThemeProvider } from "@/context/ThemeContext";
import { NotificationProvider } from "@/context/NotificationContext";
import { PreferenceProvider } from "@/context/PreferenceContext";
import { ErrorProvider } from "@/context/ErrorContext";
import { UIProvider } from "@/context/UIContext";
import { ServiceWorkerInitializer } from "@/components/features/ServiceWorkerInitializer";
import { PerformanceWrapper } from "@/components/performance/PerformanceWrapper";
import { PerformanceDashboard } from "@/components/performance/PerformanceDashboard";
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { Metadata, Viewport } from 'next';

export const metadata: Metadata = {
  title: {
    template: "Beer de Vreeze - %s",
    default: "Beer de Vreeze - Portfolio"
  },
  description: "Game Developer Portfolio - Systems & Tools Game Developer specializing in Unity, C#, and AI",
  keywords: [
    'game developer', 'Unity developer', 'C# programming', 'AI machine learning', 
    'game development', 'interactive experiences', 'systems programming', 'tools development',
    'Beer de Vreeze', 'portfolio', 'indie games', 'game design'
  ],
  authors: [{ name: 'Beer de Vreeze' }],
  creator: 'Beer de Vreeze',
  publisher: 'Beer de Vreeze',
  formatDetection: {
    telephone: false,
    date: false,
    address: false,
    email: false,
  },
  metadataBase: new URL('https://beerdevreeze.vercel.app'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://beerdevreeze.vercel.app',
    siteName: 'Beer de Vreeze - Game Developer Portfolio',
    title: 'Beer de Vreeze - Game Developer Portfolio',
    description: 'Systems & Tools Game Developer specializing in Unity, C#, and AI. Explore my interactive projects and game development journey.',
    images: [
      {
        url: '/images/Beer.webp',
        width: 1200,
        height: 630,
        alt: 'Beer de Vreeze - Game Developer',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Beer de Vreeze - Game Developer Portfolio',
    description: 'Systems & Tools Game Developer specializing in Unity, C#, and AI',
    images: ['/images/Beer.webp'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
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
  verification: {
    google: 'your-google-verification-code', // Replace with actual verification code
  },
  category: 'portfolio',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#000000' }
  ],
  colorScheme: 'dark light',
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
        <ErrorProvider>
          <PreferenceProvider>
            <ThemeProvider>
              <NotificationProvider>
                <UIProvider>
                  <PerformanceWrapper>
                    <LoadingProvider>
                      <ModalProvider>
                        <ServiceWorkerInitializer />
                        <LoadingBar />
                        <NotificationContainer />
                        <WebsiteStructuredData />
                        <DevConsole />
                        <PerformanceDashboard />
                        <main>
                          {children}
                        </main>
                        <Analytics />
                        <SpeedInsights />
                      </ModalProvider>
                    </LoadingProvider>
                  </PerformanceWrapper>
                </UIProvider>
              </NotificationProvider>
            </ThemeProvider>
          </PreferenceProvider>
        </ErrorProvider>
      </body>
    </html>
  );
}

