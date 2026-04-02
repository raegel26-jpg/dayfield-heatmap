import React, { useEffect, useRef, ReactNode } from 'react';

interface GlowCardProps {
  children: ReactNode;
  className?: string;
  glowColor?: 'blue' | 'purple' | 'green' | 'red' | 'orange' | 'rgb' | 'white';
  size?: 'sm' | 'md' | 'lg';
  width?: string | number;
  height?: string | number;
  customSize?: boolean; // When true, ignores size prop and uses width/height or className
}

const glowColorMap = {
  blue: { base: 220, spread: 200, saturation: 100 },
  purple: { base: 280, spread: 300, saturation: 100 },
  green: { base: 120, spread: 200, saturation: 100 },
  red: { base: 0, spread: 200, saturation: 100 },
  orange: { base: 30, spread: 200, saturation: 100 },
  rgb: { base: 0, spread: 360, saturation: 100 },
  white: { base: 0, spread: 0, saturation: 0 }
};

const sizeMap = {
  sm: 'w-48 h-64',
  md: 'w-64 h-80',
  lg: 'w-80 h-96'
};

// --- Gyroscope singleton for mobile glow ---
let gyroInitialized = false;
let gyroSmX = typeof window !== 'undefined' ? window.innerWidth / 2 : 0;
let gyroSmY = typeof window !== 'undefined' ? window.innerHeight / 2 : 0;
const gyroSubs = new Set<(x: number, y: number) => void>();

function onOrientation(e: DeviceOrientationEvent) {
  const gamma = e.gamma ?? 0; // left-right tilt
  const beta = e.beta ?? 0;   // front-back tilt

  // Map tilt to screen coordinates (narrow range → responsive movement)
  const targetX = Math.max(0, Math.min(window.innerWidth, ((gamma + 30) / 60) * window.innerWidth));
  const targetY = Math.max(0, Math.min(window.innerHeight, ((Math.min(Math.max(beta, 40), 100) - 40) / 60) * window.innerHeight));

  // Lerp for smooth movement
  gyroSmX += (targetX - gyroSmX) * 0.12;
  gyroSmY += (targetY - gyroSmY) * 0.12;

  gyroSubs.forEach(cb => cb(gyroSmX, gyroSmY));
}

function initGyro() {
  if (gyroInitialized || typeof window === 'undefined') return;
  gyroInitialized = true;

  const DOE = DeviceOrientationEvent as unknown as { requestPermission?: () => Promise<string> };
  if (typeof DOE.requestPermission === 'function') {
    // iOS 13+ — needs user gesture
    const onTouch = () => {
      DOE.requestPermission!().then(r => {
        if (r === 'granted') window.addEventListener('deviceorientation', onOrientation);
      }).catch(() => {});
    };
    window.addEventListener('touchstart', onTouch, { once: true });
  } else if ('DeviceOrientationEvent' in window) {
    window.addEventListener('deviceorientation', onOrientation);
  }
}

let glowStylesInjected = false;

const GLOW_STYLES = `
  [data-glow]::before,
  [data-glow]::after {
    pointer-events: none;
    content: "";
    position: absolute;
    inset: calc(var(--border-size) * -1);
    border: var(--border-size) solid transparent;
    border-radius: calc(var(--radius) * 1px);
    background-attachment: fixed;
    background-size: calc(100% + (2 * var(--border-size))) calc(100% + (2 * var(--border-size)));
    background-repeat: no-repeat;
    background-position: 50% 50%;
    -webkit-mask: linear-gradient(transparent, transparent), linear-gradient(white, white);
    -webkit-mask-clip: padding-box, border-box;
    -webkit-mask-composite: source-in;
    mask: linear-gradient(transparent, transparent), linear-gradient(white, white);
    mask-clip: padding-box, border-box;
    mask-composite: intersect;
  }

  [data-glow]::before {
    background-image: radial-gradient(
      calc(var(--spotlight-size) * 0.75) calc(var(--spotlight-size) * 0.75) at
      calc(var(--x, 0) * 1px)
      calc(var(--y, 0) * 1px),
      hsl(var(--hue, 210) calc(var(--saturation, 100) * 1%) calc(var(--lightness, 50) * 1%) / var(--border-spot-opacity, 1)), transparent 100%
    );
    filter: brightness(2);
  }

  [data-glow]::after {
    background-image: radial-gradient(
      calc(var(--spotlight-size) * 0.5) calc(var(--spotlight-size) * 0.5) at
      calc(var(--x, 0) * 1px)
      calc(var(--y, 0) * 1px),
      hsl(0 100% 100% / var(--border-light-opacity, 1)), transparent 100%
    );
  }

  [data-glow] [data-glow] {
    position: absolute;
    inset: 0;
    will-change: filter;
    opacity: var(--outer, 1);
    border-radius: calc(var(--radius) * 1px);
    border-width: calc(var(--border-size) * 20);
    filter: blur(calc(var(--border-size) * 10));
    background: none;
    pointer-events: none;
    border: none;
  }

  [data-glow] > [data-glow]::before {
    inset: -10px;
    border-width: 10px;
  }
`;

const GlowCard: React.FC<GlowCardProps> = ({
  children,
  className = '',
  glowColor = 'blue',
  size = 'md',
  width,
  height,
  customSize = false
}) => {
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    initGyro();

    const setVars = (x: number, y: number) => {
      if (!cardRef.current) return;
      cardRef.current.style.setProperty('--x', x.toFixed(2));
      cardRef.current.style.setProperty('--xp', (x / window.innerWidth).toFixed(2));
      cardRef.current.style.setProperty('--y', y.toFixed(2));
      cardRef.current.style.setProperty('--yp', (y / window.innerHeight).toFixed(2));
    };

    const syncPointer = (e: PointerEvent) => setVars(e.clientX, e.clientY);
    const syncGyro = (x: number, y: number) => setVars(x, y);

    document.addEventListener('pointermove', syncPointer);
    gyroSubs.add(syncGyro);
    return () => {
      document.removeEventListener('pointermove', syncPointer);
      gyroSubs.delete(syncGyro);
    };
  }, []);

  const { base, spread, saturation } = glowColorMap[glowColor];

  // Determine sizing
  const getSizeClasses = () => {
    if (customSize) {
      return ''; // Let className or inline styles handle sizing
    }
    return sizeMap[size];
  };

  const getInlineStyles = () => {
    const baseStyles: Record<string, string | number> = {
      '--base': base,
      '--spread': spread,
      '--radius': '14',
      '--border': '1',
      '--backdrop': 'hsl(0 0% 60% / 0.05)',
      '--backup-border': 'var(--backdrop)',
      '--size': '100',
      '--outer': '1',
      '--border-size': 'calc(var(--border, 2) * 1px)',
      '--spotlight-size': 'calc(var(--size, 150) * 1px)',
      '--saturation': saturation,
      '--hue': 'calc(var(--base) + (var(--xp, 0) * var(--spread, 0)))',
      backgroundImage: `radial-gradient(
        var(--spotlight-size) var(--spotlight-size) at
        calc(var(--x, 0) * 1px)
        calc(var(--y, 0) * 1px),
        hsl(var(--hue, 210) calc(var(--saturation, 100) * 1%) calc(var(--lightness, 70) * 1%) / var(--bg-spot-opacity, 0.1)), transparent
      )`,
      backgroundColor: 'var(--backdrop, transparent)',
      backgroundSize: 'calc(100% + (2 * var(--border-size))) calc(100% + (2 * var(--border-size)))',
      backgroundPosition: '50% 50%',
      backgroundAttachment: 'fixed',
      border: 'var(--border-size) solid var(--backup-border)',
      position: 'relative',
      touchAction: 'none',
    };

    // Add width and height if provided
    if (width !== undefined) {
      baseStyles.width = typeof width === 'number' ? `${width}px` : width;
      baseStyles.maxWidth = '100%';
    }
    if (height !== undefined) {
      baseStyles.height = typeof height === 'number' ? `${height}px` : height;
    }

    return baseStyles;
  };

  useEffect(() => {
    if (glowStylesInjected) return;
    glowStylesInjected = true;
    const style = document.createElement('style');
    style.textContent = GLOW_STYLES;
    document.head.appendChild(style);
  }, []);

  return (
    <>
      <div
        ref={cardRef}
        data-glow
        style={getInlineStyles() as React.CSSProperties}
        className={`
          ${getSizeClasses()}
          ${!customSize ? 'aspect-[3/4]' : ''}
          rounded-2xl
          relative
          shadow-[0_1rem_2rem_-1rem_rgba(0,0,0,0.4)]
          p-4
          backdrop-blur-[2px]
          ${className}
        `}
      >
        {/* Distortion layer */}
        <div
          className="glass-layer absolute inset-0 z-0 overflow-hidden rounded-2xl pointer-events-none"
          style={{
            backdropFilter: 'blur(2px)',
            isolation: 'isolate',
          }}
        />
        {/* Edge highlight */}
        <div
          className="glass-layer absolute inset-0 z-[1] rounded-2xl pointer-events-none"
          style={{
            boxShadow:
              'inset 1px 1px 1px 0 rgba(255,255,255,0.15), inset -1px -1px 1px 0 rgba(255,255,255,0.08)',
          }}
        />
        <div data-glow className="pointer-events-none"></div>
        <div className="relative z-10 flex flex-col items-center justify-start w-full h-full">{children}</div>
      </div>
    </>
  );
};

export { GlowCard }
