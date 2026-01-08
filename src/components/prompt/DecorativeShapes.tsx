export function DecorativeShapes() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Top right circle */}
      <div className="absolute -top-20 -right-20 w-64 h-64 bg-tertiary/10 rounded-full animate-float" />
      
      {/* Bottom left blob */}
      <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-primary/10 rounded-blob animate-float animation-delay-500" />
      
      {/* Floating triangles */}
      <div 
        className="absolute top-1/4 right-12 w-0 h-0 animate-float animation-delay-200"
        style={{
          borderLeft: '20px solid transparent',
          borderRight: '20px solid transparent',
          borderBottom: '35px solid hsl(var(--secondary) / 0.2)',
        }}
      />
      
      {/* Small circles */}
      <div className="absolute top-1/3 left-1/4 w-6 h-6 bg-quaternary/20 rounded-full animate-float animation-delay-700" />
      <div className="absolute bottom-1/4 right-1/3 w-4 h-4 bg-tertiary/30 rounded-full animate-float" />
      
      {/* Squiggle line */}
      <svg
        className="absolute bottom-20 left-1/3 w-32 h-8 text-secondary/20 animate-float animation-delay-500"
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
