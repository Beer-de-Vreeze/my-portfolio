import "../app/globals.css"; 
import LoadingBar from "@/components/loadingbar";
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Beer de Vreeze - Portfolio",
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
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-black text-white custom-scrollbar">
        <LoadingBar />
        {children}
      </body>
    </html>
  );
}

