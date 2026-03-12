'use client';
import Link from 'next/link';

interface RouteErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
  pageName?: string;
}

export function RouteError({ error, reset, pageName = 'Page' }: RouteErrorProps) {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4">
      {/* Background grid */}
      <div
        className="fixed inset-0 opacity-10 pointer-events-none"
        style={{
          backgroundImage:
            'linear-gradient(rgba(6,182,212,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(6,182,212,0.3) 1px, transparent 1px)',
          backgroundSize: '50px 50px',
        }}
      />

      <div className="relative z-10 text-center max-w-lg mx-auto space-y-6">
        {/* Icon */}
        <div className="text-6xl">⚡</div>

        {/* Heading */}
        <h1 className="text-5xl font-bold bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
          Something went wrong
        </h1>

        {/* Subheading */}
        <p className="text-xl text-gray-300">{pageName} encountered an unexpected error.</p>

        {/* Error detail (dev only) */}
        {process.env.NODE_ENV === 'development' && error?.message && (
          <pre className="text-left text-xs text-red-400 bg-gray-900 border border-red-900 rounded-lg p-4 overflow-auto max-h-32">
            {error.message}
          </pre>
        )}

        {/* Digest */}
        {error?.digest && (
          <p className="text-xs text-gray-600 font-mono">Error ID: {error.digest}</p>
        )}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
          <button
            onClick={reset}
            className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-purple-600 text-white font-semibold rounded-lg hover:opacity-90 transition-opacity"
          >
            Try again
          </button>
          <Link
            href="/"
            className="px-6 py-3 border border-gray-700 text-gray-300 font-semibold rounded-lg hover:border-cyan-500 hover:text-white transition-colors"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}
