export function RouteLoading({ label }: { label?: string }) {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      {/* Background grid */}
      <div
        className="fixed inset-0 opacity-10 pointer-events-none"
        style={{
          backgroundImage:
            'linear-gradient(rgba(6,182,212,0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(6,182,212,0.2) 1px, transparent 1px)',
          backgroundSize: '50px 50px',
        }}
      />

      <div className="relative z-10 flex flex-col items-center gap-6">
        {/* Spinner */}
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-cyan-400 border-r-purple-500 animate-spin" />
          <div className="absolute inset-2 rounded-full border-2 border-transparent border-b-pink-500 animate-spin [animation-direction:reverse] [animation-duration:0.8s]" />
        </div>

        {/* Label */}
        <p className="text-gray-400 text-sm tracking-widest uppercase animate-pulse">
          {label ?? 'Loading'}
        </p>
      </div>
    </div>
  );
}
