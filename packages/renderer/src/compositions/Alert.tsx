// ============================================
// Alert - Announcement Banner
// ============================================

import React from 'react';
import { AbsoluteFill, Img, interpolate, useCurrentFrame, useVideoConfig, spring, staticFile } from 'remotion';
import { useTheme, ThemeProvider, BrandingConfig, AspectRatio, DIMENSIONS } from '../theme';
import { Particles, Glow, Vignette, NoiseOverlay } from '../components/effects';
import { ShimmerText, GradientText } from '../components/text';
import { ThemedContainer, Badge, LogoDisplay } from '../components/layout';

export type AlertLevel = 'info' | 'success' | 'warning' | 'error' | 'critical' | 'promo';

export interface AlertProps {
  message: string;
  title?: string;
  level?: AlertLevel;
  icon?: string;
  details?: string;
  ctaText?: string;
  ctaUrl?: string;
  branding?: Partial<BrandingConfig>;
  format?: AspectRatio;
}

// Alert level configurations
const ALERT_CONFIGS: Record<AlertLevel, { 
  defaultIcon: string; 
  gradientColors: string[]; 
  backgroundColor: string;
  pulseColor: string;
}> = {
  info: {
    defaultIcon: 'ℹ️',
    gradientColors: ['#3b82f6', '#60a5fa'],
    backgroundColor: '#1e3a5f',
    pulseColor: '#3b82f6',
  },
  success: {
    defaultIcon: '✅',
    gradientColors: ['#22c55e', '#4ade80'],
    backgroundColor: '#14532d',
    pulseColor: '#22c55e',
  },
  warning: {
    defaultIcon: '⚠️',
    gradientColors: ['#f59e0b', '#fbbf24'],
    backgroundColor: '#78350f',
    pulseColor: '#f59e0b',
  },
  error: {
    defaultIcon: '❌',
    gradientColors: ['#ef4444', '#f87171'],
    backgroundColor: '#7f1d1d',
    pulseColor: '#ef4444',
  },
  critical: {
    defaultIcon: '🚨',
    gradientColors: ['#dc2626', '#ef4444'],
    backgroundColor: '#450a0a',
    pulseColor: '#dc2626',
  },
  promo: {
    defaultIcon: '🎉',
    gradientColors: ['#8b5cf6', '#a855f7'],
    backgroundColor: '#2e1065',
    pulseColor: '#8b5cf6',
  },
};

const AlertInner: React.FC<Omit<AlertProps, 'branding'>> = ({
  message,
  title,
  level = 'info',
  icon,
  details,
  ctaText,
  ctaUrl,
  format = 'landscape',
}) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const { colors, fonts, logo, isDark } = useTheme();
  
  const config = ALERT_CONFIGS[level];
  const alertIcon = icon || config.defaultIcon;
  const isPortrait = format === 'portrait';
  const isSquare = format === 'square';
  const isCritical = level === 'critical' || level === 'error';
  
  // === ANIMATIONS ===
  
  // Overall fade
  const containerOpacity = interpolate(
    frame,
    [0, fps * 0.3, durationInFrames - fps * 0.3, durationInFrames],
    [0, 1, 1, 0],
    { extrapolateRight: 'clamp' }
  );
  
  // Icon bounce
  const iconBounce = spring({
    frame: frame - fps * 0.2,
    fps,
    config: { damping: 10, stiffness: 150 },
  });
  const iconScale = interpolate(iconBounce, [0, 1], [0, 1.2]) * 
    (1 + (isCritical ? Math.sin(frame * 0.5) * 0.1 : 0));
  
  // Title slide
  const titleSlide = spring({
    frame: frame - fps * 0.4,
    fps,
    config: { damping: 15, stiffness: 100 },
  });
  const titleY = interpolate(titleSlide, [0, 1], [50, 0]);
  const titleOpacity = interpolate(titleSlide, [0, 0.5], [0, 1], { extrapolateRight: 'clamp' });
  
  // Message slide
  const messageSlide = spring({
    frame: frame - fps * 0.6,
    fps,
    config: { damping: 15, stiffness: 100 },
  });
  const messageY = interpolate(messageSlide, [0, 1], [40, 0]);
  const messageOpacity = interpolate(messageSlide, [0, 0.5], [0, 1], { extrapolateRight: 'clamp' });
  
  // Details fade
  const detailsOpacity = interpolate(frame, [fps * 1, fps * 1.5], [0, 1], {
    extrapolateRight: 'clamp',
  });
  
  // CTA pulse
  const ctaPulse = 0.9 + Math.sin(frame * 0.2) * 0.1;
  const ctaGlow = interpolate(Math.sin(frame * 0.15), [-1, 1], [10, 30]);
  
  // Alert bar animation (for critical)
  const alertBarProgress = (frame * 3) % 100;
  
  // Pulse overlay for critical alerts
  const pulseOpacity = isCritical
    ? interpolate(Math.sin(frame * 0.3), [-1, 1], [0.05, 0.15])
    : 0;

  return (
    <AbsoluteFill
      style={{
        backgroundColor: isDark ? colors.background : config.backgroundColor,
        fontFamily: fonts.body,
        opacity: containerOpacity,
        overflow: 'hidden',
      }}
    >
      {/* Background gradient based on alert level */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: `
            radial-gradient(ellipse 80% 60% at 50% 0%, ${config.pulseColor}25 0%, transparent 60%),
            radial-gradient(ellipse at 50% 100%, ${config.pulseColor}15 0%, transparent 50%),
            linear-gradient(to bottom, ${colors.background} 0%, ${colors.backgroundAlt || colors.background} 100%)
          `,
        }}
      />
      
      {/* Pulse overlay for critical */}
      {isCritical && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundColor: config.pulseColor,
            opacity: pulseOpacity,
            pointerEvents: 'none',
          }}
        />
      )}
      
      {/* Animated alert bar for critical */}
      {isCritical && (
        <>
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: 6,
              background: `linear-gradient(90deg, 
                transparent ${alertBarProgress - 20}%, 
                ${config.pulseColor} ${alertBarProgress}%, 
                transparent ${alertBarProgress + 20}%
              )`,
              boxShadow: `0 0 20px ${config.pulseColor}`,
            }}
          />
          <div
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: 6,
              background: `linear-gradient(90deg, 
                transparent ${100 - alertBarProgress - 20}%, 
                ${config.pulseColor} ${100 - alertBarProgress}%, 
                transparent ${100 - alertBarProgress + 20}%
              )`,
              boxShadow: `0 0 20px ${config.pulseColor}`,
            }}
          />
        </>
      )}
      
      {/* Glow */}
      <Glow color={config.pulseColor} size={800} blur={100} />
      
      {/* Particles for promo */}
      {level === 'promo' && <Particles color={config.pulseColor} count={50} />}
      
      {/* Main content */}
      <AbsoluteFill
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          padding: isPortrait ? '80px 50px' : '60px 100px',
          textAlign: 'center',
        }}
      >
        {/* Icon */}
        <div
          style={{
            fontSize: isPortrait ? 80 : 100,
            transform: `scale(${iconScale})`,
            filter: `drop-shadow(0 0 30px ${config.pulseColor}80)`,
            marginBottom: 30,
          }}
        >
          {alertIcon}
        </div>
        
        {/* Title (if provided) */}
        {title && (
          <div
            style={{
              transform: `translateY(${titleY}px)`,
              opacity: titleOpacity,
              marginBottom: 20,
            }}
          >
            <GradientText 
              fontSize={isPortrait ? 36 : 48} 
              colors={config.gradientColors}
            >
              {title.toUpperCase()}
            </GradientText>
          </div>
        )}
        
        {/* Message */}
        <div
          style={{
            transform: `translateY(${messageY}px)`,
            opacity: messageOpacity,
            fontFamily: fonts.heading,
            fontSize: isPortrait ? 42 : 64,
            fontWeight: 700,
            color: colors.text,
            lineHeight: 1.2,
            maxWidth: 1200,
            textShadow: `0 0 40px ${config.pulseColor}40`,
          }}
        >
          {message}
        </div>
        
        {/* Details */}
        {details && (
          <div
            style={{
              marginTop: 30,
              fontSize: isPortrait ? 22 : 28,
              color: colors.textMuted,
              maxWidth: 900,
              lineHeight: 1.5,
              opacity: detailsOpacity,
            }}
          >
            {details}
          </div>
        )}
        
        {/* CTA Button */}
        {ctaText && (
          <div
            style={{
              marginTop: 50,
              opacity: interpolate(frame, [fps * 1.5, fps * 2], [0, 1], {
                extrapolateRight: 'clamp',
              }),
            }}
          >
            <div
              style={{
                display: 'inline-block',
                padding: isPortrait ? '18px 40px' : '22px 50px',
                background: `linear-gradient(135deg, ${config.gradientColors[0]}, ${config.gradientColors[1]})`,
                borderRadius: 12,
                fontFamily: fonts.heading,
                fontSize: isPortrait ? 22 : 28,
                fontWeight: 700,
                color: 'white',
                letterSpacing: '0.1em',
                transform: `scale(${ctaPulse})`,
                boxShadow: `0 0 ${ctaGlow}px ${config.pulseColor}, 0 10px 40px rgba(0,0,0,0.3)`,
              }}
            >
              {ctaText.toUpperCase()}
            </div>
            {ctaUrl && (
              <div
                style={{
                  marginTop: 15,
                  fontSize: isPortrait ? 18 : 22,
                  color: config.gradientColors[0],
                  fontWeight: 600,
                }}
              >
                {ctaUrl}
              </div>
            )}
          </div>
        )}
      </AbsoluteFill>
      
      {/* Logo watermark */}
      {logo && (
        <div
          style={{
            position: 'absolute',
            bottom: 30,
            right: 40,
            opacity: 0.5,
          }}
        >
          <Img
            src={logo.startsWith('http') ? logo : staticFile(logo)}
            style={{ height: 40 }}
          />
        </div>
      )}
      
      {/* Alert level indicator */}
      <div
        style={{
          position: 'absolute',
          top: 30,
          left: 40,
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          opacity: interpolate(frame, [fps * 0.5, fps * 1], [0, 0.8], {
            extrapolateRight: 'clamp',
          }),
        }}
      >
        <div
          style={{
            width: 12,
            height: 12,
            borderRadius: '50%',
            backgroundColor: config.gradientColors[0],
            boxShadow: `0 0 15px ${config.gradientColors[0]}`,
            animation: isCritical ? 'pulse 1s infinite' : undefined,
          }}
        />
        <span
          style={{
            fontFamily: fonts.mono || fonts.body,
            fontSize: 14,
            fontWeight: 600,
            color: config.gradientColors[0],
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
          }}
        >
          {level}
        </span>
      </div>
      
      <Vignette intensity={0.5} />
      {isCritical && <NoiseOverlay opacity={0.02} />}
    </AbsoluteFill>
  );
};

export const Alert: React.FC<AlertProps> = ({ branding, ...props }) => {
  return (
    <ThemeProvider branding={branding}>
      <AlertInner {...props} />
    </ThemeProvider>
  );
};
