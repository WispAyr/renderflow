// ============================================
// Shared Visual Effects for RenderFlow
// ============================================

import React, { useMemo } from 'react';
import { interpolate, useCurrentFrame, useVideoConfig } from 'remotion';
import { useTheme } from '../theme';

// ============ PARTICLES ============

interface ParticlesProps {
  count?: number;
  color?: string;
  speed?: number;
  minSize?: number;
  maxSize?: number;
}

export const Particles: React.FC<ParticlesProps> = ({
  count = 40,
  color,
  speed = 1,
  minSize = 2,
  maxSize = 6,
}) => {
  const frame = useCurrentFrame();
  const { colors } = useTheme();
  const particleColor = color || colors.primary;

  const particles = useMemo(
    () =>
      Array.from({ length: count }).map((_, i) => ({
        x: (i * 37 + 13) % 100,
        delay: i * 7,
        speed: (0.4 + (i % 5) * 0.2) * speed,
        size: minSize + (i % (maxSize - minSize + 1)),
        drift: Math.sin(i) * 20,
      })),
    [count, speed, minSize, maxSize]
  );

  return (
    <>
      {particles.map((p, i) => {
        const progress = ((frame * p.speed + p.delay) % 180) / 180;
        const y = interpolate(progress, [0, 1], [110, -10]);
        const x = p.x + Math.sin(progress * Math.PI * 2) * p.drift * 0.1;
        const opacity = interpolate(progress, [0, 0.1, 0.8, 1], [0, 0.9, 0.9, 0]);
        const scale = interpolate(progress, [0, 0.5, 1], [0.5, 1, 0.3]);

        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: `${x}%`,
              top: `${y}%`,
              width: p.size * scale,
              height: p.size * scale,
              borderRadius: '50%',
              backgroundColor: particleColor,
              opacity,
              boxShadow: `0 0 ${p.size * 3}px ${particleColor}, 0 0 ${p.size * 6}px ${particleColor}50`,
            }}
          />
        );
      })}
    </>
  );
};

// ============ LENS FLARE ============

interface LensFlareProps {
  x: number;
  y: number;
  intensity?: number;
  color?: string;
}

export const LensFlare: React.FC<LensFlareProps> = ({ x, y, intensity = 1, color }) => {
  const { colors } = useTheme();
  const flareColor = color || colors.primary;

  return (
    <div
      style={{
        position: 'absolute',
        left: `${x}%`,
        top: `${y}%`,
        transform: 'translate(-50%, -50%)',
        pointerEvents: 'none',
      }}
    >
      <div
        style={{
          width: 300 * intensity,
          height: 300 * intensity,
          background: `radial-gradient(ellipse at center, ${flareColor}40 0%, ${flareColor}20 30%, transparent 70%)`,
          filter: 'blur(20px)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 100 * intensity,
          height: 100 * intensity,
          background: `radial-gradient(circle at center, white 0%, ${flareColor} 20%, transparent 60%)`,
          filter: 'blur(10px)',
          opacity: 0.8,
        }}
      />
    </div>
  );
};

// ============ LIGHT STREAK ============

interface LightStreakProps {
  angle?: number;
  opacity?: number;
  color?: string;
}

export const LightStreak: React.FC<LightStreakProps> = ({ angle = 30, opacity = 0.5, color }) => {
  const { colors } = useTheme();
  const streakColor = color || colors.primary;

  return (
    <div
      style={{
        position: 'absolute',
        width: '200%',
        height: 3,
        left: '-50%',
        top: '50%',
        background: `linear-gradient(90deg, transparent, ${streakColor}00, ${streakColor}, ${streakColor}00, transparent)`,
        transform: `rotate(${angle}deg)`,
        opacity,
        filter: 'blur(2px)',
      }}
    />
  );
};

// ============ ANIMATED GRID ============

interface GridBackgroundProps {
  color?: string;
  size?: number;
  perspective?: boolean;
}

export const GridBackground: React.FC<GridBackgroundProps> = ({
  color,
  size = 80,
  perspective = false,
}) => {
  const frame = useCurrentFrame();
  const { colors } = useTheme();
  const gridColor = color || colors.primary;

  return (
    <div
      style={{
        position: 'absolute',
        width: perspective ? '200%' : '100%',
        height: perspective ? '200%' : '100%',
        left: perspective ? '-50%' : 0,
        top: perspective ? '-50%' : 0,
        background: `
          linear-gradient(${gridColor}08 1px, transparent 1px),
          linear-gradient(90deg, ${gridColor}08 1px, transparent 1px)
        `,
        backgroundSize: `${size}px ${size}px`,
        transform: perspective
          ? `perspective(500px) rotateX(60deg) translateY(${frame * 0.8}px)`
          : undefined,
        opacity: 0.6,
      }}
    />
  );
};

// ============ CINEMATIC BARS ============

interface CinematicBarsProps {
  height?: number;
}

export const CinematicBars: React.FC<CinematicBarsProps> = ({ height = 12 }) => {
  return (
    <>
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: `${height}%`,
          background: '#000',
          zIndex: 100,
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: `${height}%`,
          background: '#000',
          zIndex: 100,
        }}
      />
    </>
  );
};

// ============ VIGNETTE ============

interface VignetteProps {
  intensity?: number;
  color?: string;
}

export const Vignette: React.FC<VignetteProps> = ({ intensity = 0.6, color = 'black' }) => {
  return (
    <div
      style={{
        position: 'absolute',
        width: '100%',
        height: '100%',
        background: `radial-gradient(ellipse at center, transparent 40%, ${color} 100%)`,
        opacity: intensity,
        pointerEvents: 'none',
        zIndex: 50,
      }}
    />
  );
};

// ============ GLOW ============

interface GlowProps {
  color?: string;
  size?: number;
  blur?: number;
  x?: string;
  y?: string;
}

export const Glow: React.FC<GlowProps> = ({
  color,
  size = 800,
  blur = 60,
  x = '50%',
  y = '50%',
}) => {
  const { colors } = useTheme();
  const glowColor = color || colors.primary;

  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        transform: 'translate(-50%, -50%)',
        width: size,
        height: size,
        background: `radial-gradient(ellipse at center, ${glowColor}40 0%, transparent 60%)`,
        filter: `blur(${blur}px)`,
      }}
    />
  );
};

// ============ SCAN LINE ============

interface ScanLineProps {
  color?: string;
  speed?: number;
}

export const ScanLine: React.FC<ScanLineProps> = ({ color, speed = 3 }) => {
  const frame = useCurrentFrame();
  const { colors } = useTheme();
  const lineColor = color || colors.primary;
  const scanY = (frame * speed) % 100;

  return (
    <div
      style={{
        position: 'absolute',
        width: '100%',
        height: 4,
        top: `${scanY}%`,
        background: `linear-gradient(90deg, transparent, ${lineColor}60, transparent)`,
        boxShadow: `0 0 20px ${lineColor}`,
      }}
    />
  );
};

// ============ NOISE OVERLAY ============

interface NoiseOverlayProps {
  opacity?: number;
}

export const NoiseOverlay: React.FC<NoiseOverlayProps> = ({ opacity = 0.03 }) => {
  return (
    <div
      style={{
        position: 'absolute',
        width: '100%',
        height: '100%',
        opacity,
        background: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        pointerEvents: 'none',
      }}
    />
  );
};
