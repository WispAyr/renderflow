// ============================================
// Text Components for RenderFlow
// ============================================

import React from 'react';
import { interpolate, useCurrentFrame, useVideoConfig, spring } from 'remotion';
import { useTheme } from '../theme';

// ============ SHIMMER TEXT ============

interface ShimmerTextProps {
  children: React.ReactNode;
  fontSize?: number;
  color?: string;
  secondaryColor?: string;
  style?: React.CSSProperties;
}

export const ShimmerText: React.FC<ShimmerTextProps> = ({
  children,
  fontSize = 64,
  color,
  secondaryColor,
  style = {},
}) => {
  const frame = useCurrentFrame();
  const { colors, fonts } = useTheme();
  const primaryColor = color || colors.primary;
  const secondary = secondaryColor || colors.secondary || colors.primary;
  const shimmerPos = interpolate(frame % 90, [0, 90], [0, 200]);

  return (
    <span
      style={{
        fontFamily: fonts.accent || fonts.heading,
        fontSize,
        fontWeight: 700,
        letterSpacing: '0.1em',
        background: `linear-gradient(135deg, 
          ${primaryColor} 0%, 
          ${secondary} 25%,
          #fff 50%,
          ${secondary} 75%, 
          ${primaryColor} 100%)`,
        backgroundSize: '200% 200%',
        backgroundPosition: `${shimmerPos}% 50%`,
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
        filter: `drop-shadow(0 0 30px ${primaryColor}80)`,
        ...style,
      }}
    >
      {children}
    </span>
  );
};

// ============ GRADIENT TEXT ============

interface GradientTextProps {
  children: React.ReactNode;
  fontSize?: number;
  colors?: string[];
  angle?: number;
  style?: React.CSSProperties;
}

export const GradientText: React.FC<GradientTextProps> = ({
  children,
  fontSize = 64,
  colors: gradientColors,
  angle = 135,
  style = {},
}) => {
  const { colors, fonts } = useTheme();
  const finalColors = gradientColors || [colors.primary, colors.secondary || colors.primary];

  return (
    <span
      style={{
        fontFamily: fonts.heading,
        fontSize,
        fontWeight: 700,
        background: `linear-gradient(${angle}deg, ${finalColors.join(', ')})`,
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
        ...style,
      }}
    >
      {children}
    </span>
  );
};

// ============ TYPEWRITER TEXT ============

interface TypewriterTextProps {
  text: string;
  fontSize?: number;
  startFrame?: number;
  charsPerFrame?: number;
  showCursor?: boolean;
  style?: React.CSSProperties;
}

export const TypewriterText: React.FC<TypewriterTextProps> = ({
  text,
  fontSize = 48,
  startFrame = 0,
  charsPerFrame = 0.3,
  showCursor = true,
  style = {},
}) => {
  const frame = useCurrentFrame();
  const { colors, fonts } = useTheme();
  
  const activeFrame = frame - startFrame;
  const charsVisible = Math.min(
    Math.floor(activeFrame * charsPerFrame),
    text.length
  );
  const cursorBlink = Math.sin(frame * 0.4) > 0;

  return (
    <span
      style={{
        fontFamily: fonts.mono || fonts.body,
        fontSize,
        fontWeight: 600,
        color: colors.text,
        ...style,
      }}
    >
      {text.slice(0, charsVisible)}
      {showCursor && (
        <span style={{ opacity: cursorBlink ? 1 : 0, color: colors.primary }}>▊</span>
      )}
    </span>
  );
};

// ============ ANIMATED TITLE ============

interface AnimatedTitleProps {
  title: string;
  subtitle?: string;
  startFrame?: number;
  style?: React.CSSProperties;
}

export const AnimatedTitle: React.FC<AnimatedTitleProps> = ({
  title,
  subtitle,
  startFrame = 0,
  style = {},
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { colors, fonts } = useTheme();
  
  const localFrame = frame - startFrame;
  
  const titleSpring = spring({
    frame: localFrame,
    fps,
    config: { damping: 15, stiffness: 80 },
  });
  
  const titleY = interpolate(titleSpring, [0, 1], [60, 0]);
  const titleOpacity = interpolate(localFrame, [0, fps * 0.4], [0, 1], {
    extrapolateRight: 'clamp',
  });
  
  const subtitleOpacity = interpolate(localFrame, [fps * 0.5, fps * 0.9], [0, 1], {
    extrapolateRight: 'clamp',
  });
  const subtitleY = interpolate(localFrame, [fps * 0.5, fps * 0.9], [30, 0], {
    extrapolateRight: 'clamp',
  });

  return (
    <div style={{ textAlign: 'center', ...style }}>
      <div
        style={{
          transform: `translateY(${titleY}px)`,
          opacity: titleOpacity,
        }}
      >
        <ShimmerText fontSize={title.length > 25 ? 64 : 80}>
          {title.toUpperCase()}
        </ShimmerText>
      </div>
      {subtitle && (
        <div
          style={{
            fontFamily: fonts.accent || fonts.heading,
            fontSize: 36,
            fontWeight: 500,
            fontStyle: 'italic',
            color: colors.secondary || colors.primary,
            opacity: subtitleOpacity,
            transform: `translateY(${subtitleY}px)`,
            marginTop: 15,
            textShadow: `0 0 30px ${colors.secondary || colors.primary}60`,
          }}
        >
          {subtitle}
        </div>
      )}
    </div>
  );
};

// ============ COUNTER TEXT ============

interface CounterTextProps {
  value: number;
  startFrame?: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
  fontSize?: number;
  decimals?: number;
  style?: React.CSSProperties;
}

export const CounterText: React.FC<CounterTextProps> = ({
  value,
  startFrame = 0,
  duration = 30,
  prefix = '',
  suffix = '',
  fontSize = 72,
  decimals = 0,
  style = {},
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { colors, fonts } = useTheme();
  
  const localFrame = frame - startFrame;
  const progress = interpolate(
    localFrame,
    [0, duration],
    [0, 1],
    { extrapolateRight: 'clamp' }
  );
  
  const displayValue = (value * progress).toFixed(decimals);
  
  const glowIntensity = interpolate(
    localFrame,
    [duration - 10, duration, duration + 10],
    [0, 20, 10],
    { extrapolateRight: 'clamp' }
  );

  return (
    <span
      style={{
        fontFamily: fonts.mono || fonts.heading,
        fontSize,
        fontWeight: 800,
        color: colors.primary,
        textShadow: `0 0 ${glowIntensity}px ${colors.primary}`,
        ...style,
      }}
    >
      {prefix}
      {Number(displayValue).toLocaleString()}
      {suffix}
    </span>
  );
};
