export function DecorativeShapes() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
      {/* Top right circle */}
      <div className="absolute -top-16 -right-16 sm:-top-20 sm:-right-20 w-40 h-40 sm:w-64 sm:h-64 bg-tertiary/10 rounded-full animate-float" />
      
      {/* Bottom left blob */}
      <div className="absolute -bottom-12 -left-12 sm:-bottom-16 sm:-left-16 w-32 h-32 sm:w-48 sm:h-48 bg-primary/10 rounded-blob animate-float animation-delay-500" />
      
      {/* Floating triangles - hide on mobile */}
      <div 
        className="hidden sm:block absolute top-1/4 right-8 lg:right-12 w-0 h-0 animate-float animation-delay-200"
        style={{
          borderLeft: '16px solid transparent',
          borderRight: '16px solid transparent',
          borderBottom: '28px solid hsl(var(--secondary) / 0.15)',
        }}
      />
      
      {/* Small circles - smaller on mobile */}
      <div className="absolute top-1/3 left-1/4 w-4 h-4 sm:w-6 sm:h-6 bg-quaternary/15 rounded-full animate-float animation-delay-700" />
      <div className="hidden sm:block absolute bottom-1/4 right-1/3 w-4 h-4 bg-tertiary/20 rounded-full animate-float" />
      
      {/* Squiggle line - hide on mobile */}
      <svg
        className="hidden lg:block absolute bottom-20 left-1/3 w-24 lg:w-32 h-6 lg:h-8 text-secondary/15 animate-float animation-delay-500"
        viewBox="0 0 120 30"
        fill="none"
      >
        <path
          d="M0 15 Q 15 0, 30 15 T 60 15 T 90 15 T 120 15"
          stroke="currentColor"
          strokeWidth="4"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}
