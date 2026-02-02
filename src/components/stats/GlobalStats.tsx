import { useState, useEffect, useRef } from 'react';
import { Flame, Users, Zap, Wifi, WifiOff } from 'lucide-react';
import { useGlobalStats } from '@/hooks/useGlobalStats';
import { cn } from '@/lib/utils';

/**
 * Animated number component that smoothly transitions between values
 */
function AnimatedNumber({ 
  value, 
  className 
}: { 
  value: number; 
  className?: string;
}) {
  const [displayValue, setDisplayValue] = useState(value);
  const [isAnimating, setIsAnimating] = useState(false);
  const prevValueRef = useRef(value);

  useEffect(() => {
    if (value !== prevValueRef.current) {
      setIsAnimating(true);
      
      // Animate the number change
      const diff = value - prevValueRef.current;
      const steps = Math.min(Math.abs(diff), 20);
      const stepDuration = 300 / steps;
      let currentStep = 0;
      
      const interval = setInterval(() => {
        currentStep++;
        const progress = currentStep / steps;
        const currentValue = Math.round(
          prevValueRef.current + diff * progress
        );
        setDisplayValue(currentValue);
        
        if (currentStep >= steps) {
          clearInterval(interval);
          setDisplayValue(value);
          setIsAnimating(false);
          prevValueRef.current = value;
        }
      }, stepDuration);

      return () => clearInterval(interval);
    }
  }, [value]);

  // Format number with commas
  const formattedValue = displayValue.toLocaleString();

  return (
    <span 
      className={cn(
        'tabular-nums transition-all duration-150',
        isAnimating && 'scale-110 text-primary',
        className
      )}
    >
      {formattedValue}
    </span>
  );
}

/**
 * Stat item component
 */
function StatItem({
  icon: Icon,
  value,
  label,
  iconColor,
  pulse = false,
}: {
  icon: React.ElementType;
  value: number;
  label: string;
  iconColor: string;
  pulse?: boolean;
}) {
  return (
    <div className="flex items-center gap-1.5 sm:gap-2">
      <div className={cn('relative', pulse && 'animate-pulse')}>
        <Icon className={cn('h-3.5 w-3.5 sm:h-4 sm:w-4', iconColor)} strokeWidth={2.5} />
      </div>
      <span className="text-xs sm:text-sm font-semibold">
        <AnimatedNumber value={value} />
      </span>
      <span className="text-xs text-muted-foreground hidden sm:inline">
        {label}
      </span>
    </div>
  );
}

/**
 * Global Stats Display Component
 * 
 * Shows real-time statistics in a floating bar:
 * - Total prompts generated
 * - Online users
 * - Currently generating
 */
export function GlobalStats() {
  const { stats, isConnected } = useGlobalStats();
  const [isVisible, setIsVisible] = useState(false);

  // Fade in on mount
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div 
      className={cn(
        'fixed bottom-4 left-1/2 -translate-x-1/2 z-50',
        'transition-all duration-500 ease-out',
        isVisible 
          ? 'opacity-100 translate-y-0' 
          : 'opacity-0 translate-y-4'
      )}
    >
      <div 
        className={cn(
          'flex items-center gap-3 sm:gap-5',
          'px-4 py-2 sm:px-6 sm:py-2.5',
          'bg-background/95 backdrop-blur-md',
          'border-2 border-border-strong rounded-full',
          'shadow-hard-sm',
          'transition-all duration-300',
          'hover:shadow-hard hover:-translate-y-0.5'
        )}
      >
        {/* Connection status indicator */}
        <div className="flex items-center gap-1.5">
          {isConnected ? (
            <Wifi className="h-3 w-3 text-green-500" strokeWidth={2.5} />
          ) : (
            <WifiOff className="h-3 w-3 text-muted-foreground animate-pulse" strokeWidth={2.5} />
          )}
          <span className="text-[10px] text-muted-foreground hidden lg:inline">
            {isConnected ? 'Live' : 'Connecting...'}
          </span>
        </div>

        {/* Divider */}
        <div className="w-px h-4 bg-border" />

        {/* Total prompts */}
        <StatItem
          icon={Flame}
          value={stats.totalPrompts}
          label="prompts"
          iconColor="text-orange-500"
        />

        {/* Divider */}
        <div className="w-px h-4 bg-border hidden sm:block" />

        {/* Online users */}
        <StatItem
          icon={Users}
          value={stats.onlineUsers}
          label="online"
          iconColor="text-blue-500"
        />

        {/* Divider */}
        <div className="w-px h-4 bg-border hidden sm:block" />

        {/* Generating users */}
        <StatItem
          icon={Zap}
          value={stats.generatingUsers}
          label="generating"
          iconColor="text-yellow-500"
          pulse={stats.generatingUsers > 0}
        />
      </div>
    </div>
  );
}

export default GlobalStats;
