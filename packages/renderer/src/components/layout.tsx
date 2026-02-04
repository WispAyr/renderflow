// ============================================
// Layout Components for RenderFlow
// ============================================

import React from 'react';
import { AbsoluteFill, Img, staticFile, interpolate, useCurrentFrame, useVideoConfig } from 'remotion';
import { useTheme } from '../theme';
import { Vignette, Particles } from './effects';

// ============ THEMED CONTAINER ============

interface ThemedContainerProps {
  children: React.ReactNode;
  showVignette?: boolean;
  showParticles?: boolean;
  backgroundGradient?: boolean;
  style?: React.CSSProperties;
}

export const ThemedContainer: React.FC<ThemedContainerProps> = ({
  children,
  showVignette = true,
  showParticles = false,
  backgroundGradient = true,
  style = {},
}) => {
  const { colors, fonts, isDark } = useTheme();

  return (
    <AbsoluteFill
      style={{
        backgroundColor: colors.background,
        fontFamily: fonts.body,
        overflow: 'hidden',
        ...style,
      }}
    >
      {/* Background gradient */}
      {backgroundGradient && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: `
              radial-gradient(ellipse 80% 50% at 50% 0%, ${colors.primary}15 0%, transparent 50%),
              radial-gradient(ellipse at 30% 70%, ${colors.secondary || colors.primary}10 0%, transparent 40%),
              radial-gradient(ellipse at 70% 60%, ${colors.primary}08 0%, transparent 40%),
              linear-gradient(to bottom, ${colors.background} 0%, ${colors.backgroundAlt || colors.background} 100%)
            `,
          }}
        />
      )}

      {/* Particles */}
      {showParticles && <Particles />}

      {/* Main content */}
      {children}

      {/* Vignette */}
      {showVignette && <Vignette />}
    </AbsoluteFill>
  );
};

// ============ LOGO DISPLAY ============

interface LogoDisplayProps {
  src?: string;
  size?: number;
  position?: 'center' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  glow?: boolean;
  style?: React.CSSProperties;
}

export const LogoDisplay: React.FC<LogoDisplayProps> = ({
  src,
  size = 200,
  position = 'center',
  glow = true,
  style = {},
}) => {
  const { colors, logo } = useTheme();
  const logoSrc = src || logo;

  if (!logoSrc) return null;

  const positionStyles: Record<string, React.CSSProperties> = {
    center: { position: 'relative' },
    'top-left': { position: 'absolute', top: 40, left: 40 },
    'top-right': { position: 'absolute', top: 40, right: 40 },
    'bottom-left': { position: 'absolute', bottom: 40, left: 40 },
    'bottom-right': { position: 'absolute', bottom: 40, right: 40 },
  };

  // Determine if it's a static file or remote URL
  const imgSrc = logoSrc.startsWith('http') ? logoSrc : staticFile(logoSrc);

  return (
    <div
      style={{
        ...positionStyles[position],
        filter: glow ? `drop-shadow(0 0 30px ${colors.primary}80)` : undefined,
        ...style,
      }}
    >
      <Img src={imgSrc} style={{ width: size, height: 'auto' }} />
    </div>
  );
};

// ============ CARD ============

interface CardProps {
  children: React.ReactNode;
  padding?: number;
  borderRadius?: number;
  glow?: boolean;
  accentBorder?: 'top' | 'bottom' | 'left' | 'right' | 'none';
  style?: React.CSSProperties;
}

export const Card: React.FC<CardProps> = ({
  children,
  padding = 40,
  borderRadius = 20,
  glow = true,
  accentBorder = 'bottom',
  style = {},
}) => {
  const { colors, isDark } = useTheme();

  const borderStyles: Record<string, React.CSSProperties> = {
    top: { borderTop: `4px solid ${colors.primary}` },
    bottom: { borderBottom: `4px solid ${colors.primary}` },
    left: { borderLeft: `4px solid ${colors.primary}` },
    right: { borderRight: `4px solid ${colors.primary}` },
    none: {},
  };

  return (
    <div
      style={{
        backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)',
        border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`,
        borderRadius,
        padding,
        boxShadow: glow
          ? `0 0 30px ${colors.primary}15, inset 0 0 60px ${colors.primary}05, 0 20px 40px rgba(0,0,0,0.2)`
          : '0 10px 30px rgba(0,0,0,0.2)',
        ...borderStyles[accentBorder],
        ...style,
      }}
    >
      {children}
    </div>
  );
};

// ============ BADGE ============

interface BadgeProps {
  children: React.ReactNode;
  color?: string;
  size?: 'sm' | 'md' | 'lg';
  icon?: string;
  style?: React.CSSProperties;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  color,
  size = 'md',
  icon,
  style = {},
}) => {
  const { colors, fonts } = useTheme();
  const badgeColor = color || colors.primary;

  const sizeStyles: Record<string, { padding: string; fontSize: number }> = {
    sm: { padding: '6px 12px', fontSize: 12 },
    md: { padding: '10px 20px', fontSize: 14 },
    lg: { padding: '14px 28px', fontSize: 16 },
  };

  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 8,
        backgroundColor: badgeColor,
        borderRadius: 8,
        fontFamily: fonts.body,
        fontWeight: 600,
        color: 'white',
        letterSpacing: '0.05em',
        boxShadow: `0 4px 20px ${badgeColor}60`,
        ...sizeStyles[size],
        ...style,
      }}
    >
      {icon && <span style={{ fontSize: sizeStyles[size].fontSize + 4 }}>{icon}</span>}
      {children}
    </div>
  );
};

// ============ LOWER THIRD ============

interface LowerThirdProps {
  title: string;
  subtitle?: string;
  logo?: string;
  position?: 'left' | 'right';
  style?: React.CSSProperties;
}

export const LowerThird: React.FC<LowerThirdProps> = ({
  title,
  subtitle,
  logo,
  position = 'left',
  style = {},
}) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const { colors, fonts } = useTheme();

  // Slide in animation
  const slideIn = interpolate(frame, [0, fps * 0.5], [100, 0], {
    extrapolateRight: 'clamp',
  });
  const slideOut = interpolate(
    frame,
    [durationInFrames - fps * 0.5, durationInFrames],
    [0, 100],
    { extrapolateLeft: 'clamp' }
  );
  const translateX = (position === 'left' ? -1 : 1) * (slideIn + slideOut);

  const barWidth = interpolate(frame, [fps * 0.1, fps * 0.5], [0, 100], {
    extrapolateRight: 'clamp',
  });
  const contentOpacity = interpolate(frame, [fps * 0.2, fps * 0.4], [0, 1], {
    extrapolateRight: 'clamp',
  });

  return (
    <div
      style={{
        position: 'absolute',
        bottom: 100,
        [position]: 80,
        transform: `translateX(${translateX}%)`,
        ...style,
      }}
    >
      {/* Top accent line */}
      <div
        style={{
          width: `${barWidth}%`,
          maxWidth: 500,
          height: 3,
          background: `linear-gradient(90deg, ${colors.primary}, ${colors.secondary || colors.primary}, transparent)`,
          boxShadow: `0 0 15px ${colors.primary}`,
          marginBottom: 10,
        }}
      />

      {/* Main container */}
      <div
        style={{
          background: 'linear-gradient(135deg, rgba(0,0,0,0.95) 0%, rgba(20,20,30,0.9) 100%)',
          border: `1px solid ${colors.primary}30`,
          borderLeft: position === 'left' ? `5px solid ${colors.primary}` : undefined,
          borderRight: position === 'right' ? `5px solid ${colors.primary}` : undefined,
          padding: '25px 35px',
          display: 'flex',
          alignItems: 'center',
          gap: 25,
          backdropFilter: 'blur(10px)',
          boxShadow: `0 10px 40px rgba(0,0,0,0.5), inset 0 0 30px ${colors.primary}10`,
          opacity: contentOpacity,
        }}
      >
        {/* Logo */}
        {logo && (
          <Img
            src={logo.startsWith('http') ? logo : staticFile(logo)}
            style={{ height: 50 }}
          />
        )}

        {/* Text */}
        <div>
          <div
            style={{
              fontFamily: fonts.heading,
              fontSize: 32,
              fontWeight: 700,
              color: colors.text,
              textShadow: `0 0 20px ${colors.primary}50`,
            }}
          >
            {title}
          </div>
          {subtitle && (
            <div
              style={{
                fontFamily: fonts.body,
                fontSize: 18,
                color: colors.primary,
                marginTop: 4,
                fontWeight: 500,
              }}
            >
              {subtitle}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ============ FOOTER BAR ============

interface FooterBarProps {
  left?: React.ReactNode;
  center?: React.ReactNode;
  right?: React.ReactNode;
  style?: React.CSSProperties;
}

export const FooterBar: React.FC<FooterBarProps> = ({
  left,
  center,
  right,
  style = {},
}) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const { colors } = useTheme();

  const slideIn = interpolate(frame, [fps * 0.5, fps * 1], [100, 0], {
    extrapolateRight: 'clamp',
  });
  const fadeOut = interpolate(
    frame,
    [durationInFrames - fps * 0.3, durationInFrames],
    [1, 0],
    { extrapolateLeft: 'clamp' }
  );

  return (
    <div
      style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: '40px 80px',
        background: 'linear-gradient(to top, rgba(0,0,0,0.95), rgba(0,0,0,0.7), transparent)',
        transform: `translateY(${slideIn}%)`,
        opacity: fadeOut,
        zIndex: 25,
        ...style,
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          maxWidth: 1600,
          margin: '0 auto',
        }}
      >
        <div>{left}</div>
        <div style={{ textAlign: 'center' }}>{center}</div>
        <div style={{ textAlign: 'right' }}>{right}</div>
      </div>
    </div>
  );
};
