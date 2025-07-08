import "../app/globals.css"; 
import LoadingBar from "@/components/loadingbar";
import DevConsole from "@/components/DevConsole";
import { LoadingProvider } from "@/context/LoadingContext";
import { ServiceWorkerInitializer } from "@/components/ServiceWorkerInitializer";
import { Metadata, Viewport } from 'next';

export const metadata: Metadata = {
  title: {
    template: "Beer de Vreeze - %s",
    default: "Beer de Vreeze - Portfolio"
  },
  description: "Game Developer Portfolio",
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
  viewportFit: 'cover', // Important for iPhone X and newer
  // Remove userScalable: false and maximumScale to allow proper mobile scrolling
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {  return (
    <html lang="en">
      <head>
        <meta name="theme-color" content="#000000" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </head>
      <body className="bg-black text-white custom-scrollbar min-h-screen">
        <LoadingProvider>
          <ServiceWorkerInitializer />
          <LoadingBar />
          <DevConsole />
          {children}
        </LoadingProvider>
      </body>
    </html>
  );
}

