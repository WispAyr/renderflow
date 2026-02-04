// ============================================
// StatsDashboard - Statistics Display
// ============================================

import React, { useMemo } from 'react';
import { AbsoluteFill, Img, interpolate, useCurrentFrame, useVideoConfig, spring, staticFile, Easing } from 'remotion';
import { useTheme, ThemeProvider, BrandingConfig, AspectRatio, DIMENSIONS } from '../theme';
import { Glow, GridBackground, Vignette } from '../components/effects';
import { GradientText, CounterText } from '../components/text';
import { ThemedContainer, Card } from '../components/layout';

export interface StatItem {
  id: string;
  label: string;
  value: number | string;
  prefix?: string;
  suffix?: string;
  icon?: string;
  color?: string;
  trend?: 'up' | 'down' | 'flat';
  change?: number;
}

export interface StatsDashboardProps {
  stats: StatItem[];
  title?: string;
  subtitle?: string;
  showTrends?: boolean;
  animated?: boolean;
  branding?: Partial<BrandingConfig>;
  format?: AspectRatio;
}

// Trend indicator component
const TrendIndicator: React.FC<{ trend: 'up' | 'down' | 'flat'; change?: number }> = ({
  trend,
  change,
}) => {
  const trendConfig = {
    up: { icon: '↑', color: '#22c55e' },
    down: { icon: '↓', color: '#ef4444' },
    flat: { icon: '→', color: '#f59e0b' },
  };
  
  const config = trendConfig[trend];
  
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 4,
        color: config.color,
        fontSize: 16,
        fontWeight: 600,
      }}
    >
      <span>{config.icon}</span>
      {change !== undefined && <span>{change > 0 ? '+' : ''}{change}%</span>}
    </div>
  );
};

// Stat card particles
const CardParticles: React.FC<{ color: string }> = ({ color }) => {
  const frame = useCurrentFrame();
  
  return (
    <div
      style={{
        position: 'absolute',
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        borderRadius: 20,
        pointerEvents: 'none',
      }}
    >
      {Array.from({ length: 5 }).map((_, i) => {
        const progress = ((frame + i * 20) % 100) / 100;
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: `${(i * 25 + 10) % 100}%`,
              bottom: `${progress * 120 - 20}%`,
              width: 4,
              height: 4,
              borderRadius: '50%',
              backgroundColor: color,
              opacity: 0.3 * (1 - progress),
            }}
          />
        );
      })}
    </div>
  );
};

// Single stat card
const StatCard: React.FC<{
  stat: StatItem;
  index: number;
  animated: boolean;
  showTrends: boolean;
}> = ({ stat, index, animated, showTrends }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const { colors, fonts, isDark } = useTheme();
  
  const delay = index * 0.12;
  const statColor = stat.color || colors.primary;
  
  // Card entrance animation
  const cardOpacity = interpolate(
    frame,
    [fps * (0.25 + delay), fps * (0.55 + delay)],
    [0, 1],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );
  const cardY = interpolate(
    frame,
    [fps * (0.25 + delay), fps * (0.55 + delay)],
    [50, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.back(1.5)) }
  );
  const cardScale = interpolate(
    frame,
    [fps * (0.25 + delay), fps * (0.45 + delay), fps * (0.55 + delay)],
    [0.8, 1.05, 1],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );
  
  // Value counter animation
  const valueStartFrame = fps * (0.5 + delay);
  const counterDuration = fps * 0.7;
  
  // Glow pulse for the value
  const glowIntensity = interpolate(
    frame,
    [valueStartFrame + counterDuration - 10, valueStartFrame + counterDuration, valueStartFrame + counterDuration + 20],
    [0, 15, 8],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );
  
  return (
    <div
      style={{
        backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)',
        borderRadius: 24,
        padding: 45,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        opacity: cardOpacity,
        transform: `translateY(${cardY}px) scale(${cardScale})`,
        border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`,
        borderBottom: `4px solid ${statColor}`,
        boxShadow: `
          0 0 30px ${statColor}15,
          inset 0 0 60px ${statColor}05,
          0 20px 40px rgba(0,0,0,0.2)
        `,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Card particles */}
      <CardParticles color={statColor} />
      
      {/* Top accent line */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: '20%',
          right: '20%',
          height: 1,
          background: `linear-gradient(90deg, transparent, ${statColor}50, transparent)`,
        }}
      />
      
      {/* Icon */}
      {stat.icon && (
        <div
          style={{
            fontSize: 52,
            marginBottom: 20,
            filter: `drop-shadow(0 0 15px ${statColor}50)`,
          }}
        >
          {stat.icon}
        </div>
      )}
      
      {/* Value */}
      <div
        style={{
          fontSize: 80,
          fontWeight: 800,
          lineHeight: 1,
          fontFamily: fonts.mono || fonts.heading,
        }}
      >
        {typeof stat.value === 'number' && animated ? (
          <CounterText
            value={stat.value}
            startFrame={valueStartFrame}
            duration={counterDuration}
            prefix={stat.prefix}
            suffix={stat.suffix}
            fontSize={80}
          />
        ) : (
          <span
            style={{
              color: statColor,
              textShadow: `0 0 ${glowIntensity}px ${statColor}`,
            }}
          >
            {stat.prefix}
            {typeof stat.value === 'number' ? stat.value.toLocaleString() : stat.value}
            {stat.suffix}
          </span>
        )}
      </div>
      
      {/* Label */}
      <div
        style={{
          fontSize: 22,
          color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)',
          marginTop: 18,
          textTransform: 'uppercase',
          letterSpacing: '0.15em',
          fontWeight: 500,
        }}
      >
        {stat.label}
      </div>
      
      {/* Trend */}
      {showTrends && stat.trend && (
        <div style={{ marginTop: 15 }}>
          <TrendIndicator trend={stat.trend} change={stat.change} />
        </div>
      )}
    </div>
  );
};

const StatsDashboardInner: React.FC<Omit<StatsDashboardProps, 'branding'>> = ({
  stats,
  title = 'Live Statistics',
  subtitle,
  showTrends = true,
  animated = true,
  format = 'landscape',
}) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const { colors, fonts, logo, isDark } = useTheme();
  
  const isPortrait = format === 'portrait';
  const gridColumns = Math.min(stats.length, isPortrait ? 2 : 4);
  
  // Container animations
  const containerOpacity = interpolate(
    frame,
    [0, fps * 0.3, durationInFrames - fps * 0.3, durationInFrames],
    [0, 1, 1, 0],
    { extrapolateRight: 'clamp' }
  );
  const containerScale = interpolate(
    frame,
    [0, fps * 0.4],
    [0.95, 1],
    { extrapolateRight: 'clamp', easing: Easing.out(Easing.ease) }
  );
  
  // Title animation
  const titleY = interpolate(
    frame,
    [0, fps * 0.5],
    [-30, 0],
    { extrapolateRight: 'clamp', easing: Easing.out(Easing.back(1.5)) }
  );
  const titleOpacity = interpolate(frame, [fps * 0.1, fps * 0.4], [0, 1], {
    extrapolateRight: 'clamp',
  });
  
  // Grid line animation
  const gridProgress = interpolate(frame, [0, fps * 0.8], [0, 1], {
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: colors.background,
        fontFamily: fonts.body,
        padding: isPortrait ? 50 : 70,
        opacity: containerOpacity,
        transform: `scale(${containerScale})`,
      }}
    >
      {/* Animated grid background */}
      <GridBackground color={colors.primary} size={50} />
      
      {/* Radial glow */}
      <Glow color={colors.primary} size={1000} blur={100} />
      
      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: isPortrait ? 40 : 60,
          position: 'relative',
          zIndex: 10,
        }}
      >
        <div
          style={{
            opacity: titleOpacity,
            transform: `translateY(${titleY}px)`,
          }}
        >
          <div
            style={{
              fontSize: isPortrait ? 42 : 56,
              fontWeight: 700,
              color: colors.text,
              textShadow: isDark ? `0 0 40px ${colors.primary}30` : 'none',
            }}
          >
            {title}
          </div>
          {subtitle && (
            <div
              style={{
                fontSize: isPortrait ? 18 : 22,
                color: colors.textMuted,
                marginTop: 8,
              }}
            >
              {subtitle}
            </div>
          )}
        </div>
        
        {logo && (
          <Img
            src={logo.startsWith('http') ? logo : staticFile(logo)}
            style={{
              height: isPortrait ? 50 : 70,
              opacity: interpolate(frame, [fps * 0.3, fps * 0.6], [0, 1], {
                extrapolateRight: 'clamp',
              }),
              filter: isDark ? `drop-shadow(0 0 20px ${colors.primary}30)` : 'none',
            }}
          />
        )}
      </div>
      
      {/* Stats grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${gridColumns}, 1fr)`,
          gap: isPortrait ? 25 : 35,
          flex: 1,
          position: 'relative',
          zIndex: 10,
        }}
      >
        {stats.map((stat, index) => (
          <StatCard
            key={stat.id}
            stat={stat}
            index={index}
            animated={animated}
            showTrends={showTrends}
          />
        ))}
      </div>
      
      {/* Footer */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginTop: isPortrait ? 30 : 40,
          fontSize: isPortrait ? 14 : 16,
          color: colors.textMuted,
          position: 'relative',
          zIndex: 10,
        }}
      >
        <span>Powered by RenderFlow</span>
        <span style={{ fontFamily: fonts.mono || fonts.body }}>
          {new Date().toLocaleString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          })}
        </span>
      </div>
      
      <Vignette intensity={0.4} />
    </AbsoluteFill>
  );
};

export const StatsDashboard: React.FC<StatsDashboardProps> = ({ branding, ...props }) => {
  return (
    <ThemeProvider branding={branding}>
      <StatsDashboardInner {...props} />
    </ThemeProvider>
  );
};
