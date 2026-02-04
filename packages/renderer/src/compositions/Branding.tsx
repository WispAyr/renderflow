// ============================================
// Branding - Logo Reveal with Effects
// ============================================

import React, { useMemo } from 'react';
import { AbsoluteFill, Img, interpolate, useCurrentFrame, useVideoConfig, spring, staticFile, Easing } from 'remotion';
import { useTheme, ThemeProvider, BrandingConfig, AspectRatio, DIMENSIONS } from '../theme';
import { Particles, Glow, LensFlare, LightStreak, GridBackground, CinematicBars, Vignette } from '../components/effects';
import { ShimmerText, TypewriterText } from '../components/text';

export type BrandingEffect = 
  | 'reveal' 
  | 'bounce' 
  | 'glitch' 
  | 'spin' 
  | 'particles'
  | 'cinematic';

export interface BrandingProps {
  logo?: string;
  tagline?: string;
  effect?: BrandingEffect;
  branding?: Partial<BrandingConfig>;
  format?: AspectRatio;
}

// ============ LOGO REVEAL - CINEMATIC ============
const LogoReveal: React.FC<{ logo: string; tagline: string }> = ({ logo, tagline }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const { colors } = useTheme();
  
  // Logo entrance
  const logoScale = spring({
    frame: frame - fps * 0.2,
    fps,
    config: { damping: 15, stiffness: 80, mass: 1 },
  });
  const scaleValue = interpolate(logoScale, [0, 1], [0.6, 1]);
  const logoOpacity = interpolate(
    frame,
    [0, fps * 0.5, durationInFrames - fps * 0.4, durationInFrames],
    [0, 1, 1, 0],
    { extrapolateRight: 'clamp' }
  );
  
  // Glow pulse
  const glowPulse = interpolate(
    frame,
    [fps * 0.3, fps * 1, fps * 2, fps * 3],
    [0, 0.6, 0.35, 0.45],
    { extrapolateRight: 'clamp' }
  );
  
  // Tagline entrance
  const taglineProgress = spring({
    frame: frame - fps * 1,
    fps,
    config: { damping: 20, stiffness: 100 },
  });
  const taglineY = interpolate(taglineProgress, [0, 1], [40, 0]);
  const taglineOpacity = interpolate(
    frame,
    [fps * 0.9, fps * 1.3, durationInFrames - fps * 0.3, durationInFrames],
    [0, 1, 1, 0],
    { extrapolateRight: 'clamp' }
  );
  
  // Lens flare
  const flareIntensity = interpolate(
    frame,
    [fps * 0.4, fps * 0.8, fps * 1.5, fps * 2],
    [0, 1.2, 0.3, 0],
    { extrapolateRight: 'clamp' }
  );
  const flareX = interpolate(frame, [fps * 0.4, fps * 1.5], [30, 70], {
    extrapolateRight: 'clamp',
  });
  
  // Light streak
  const streakProgress = interpolate(
    frame,
    [fps * 0.3, fps * 0.6, fps * 1],
    [0, 1, 0],
    { extrapolateRight: 'clamp' }
  );

  return (
    <>
      <GridBackground color={colors.primary} perspective />
      
      {/* Main glow */}
      <Glow 
        color={colors.primary} 
        size={1000 * (0.8 + glowPulse * 0.4)} 
        blur={80}
      />
      
      <Particles count={40} />
      
      <LightStreak angle={-30} opacity={streakProgress} />
      
      {flareIntensity > 0 && (
        <LensFlare x={flareX} y={45} intensity={flareIntensity} />
      )}
      
      {/* Logo */}
      <div
        style={{
          transform: `scale(${scaleValue})`,
          opacity: logoOpacity,
          filter: `drop-shadow(0 0 ${40 * glowPulse}px ${colors.primary}) drop-shadow(0 0 ${80 * glowPulse}px ${colors.primary}50)`,
          zIndex: 10,
        }}
      >
        <Img src={logo} style={{ width: 700, height: 'auto' }} />
      </div>
      
      {/* Tagline */}
      <div
        style={{
          opacity: taglineOpacity,
          transform: `translateY(${taglineY}px)`,
          marginTop: 50,
          zIndex: 10,
        }}
      >
        <ShimmerText fontSize={38}>{tagline.toUpperCase()}</ShimmerText>
      </div>
      
      <CinematicBars 
        height={interpolate(frame, [0, fps * 0.3], [0, 12], { extrapolateRight: 'clamp' })} 
      />
    </>
  );
};

// ============ LOGO BOUNCE ============
const LogoBounce: React.FC<{ logo: string; tagline: string }> = ({ logo, tagline }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const { colors } = useTheme();
  
  // Bounce physics
  const bounce1 = spring({ frame, fps, config: { damping: 8, stiffness: 120, mass: 1 } });
  const bounce2 = spring({
    frame: frame - fps * 0.15,
    fps,
    config: { damping: 12, stiffness: 200, mass: 0.5 },
  });
  
  const logoY = interpolate(bounce1, [0, 1], [-500, 0]) +
    interpolate(bounce2, [0, 0.5, 1], [0, -30, 0]);
  const logoOpacity = interpolate(
    frame,
    [0, fps * 0.15, durationInFrames - fps * 0.3, durationInFrames],
    [0, 1, 1, 0],
    { extrapolateRight: 'clamp' }
  );
  
  // Squash and stretch
  const squash = interpolate(bounce1, [0.7, 0.85, 0.95, 1], [1, 1.3, 0.9, 1], {
    extrapolateRight: 'clamp',
  });
  const stretch = interpolate(bounce1, [0.7, 0.85, 0.95, 1], [1, 0.75, 1.1, 1], {
    extrapolateRight: 'clamp',
  });
  
  // Impact effects
  const impactProgress = interpolate(
    frame,
    [fps * 0.25, fps * 0.35, fps * 0.6],
    [0, 1, 0],
    { extrapolateRight: 'clamp' }
  );
  const ringScale = interpolate(frame, [fps * 0.25, fps * 0.8], [0, 4], {
    extrapolateRight: 'clamp',
  });
  const ringOpacity = interpolate(frame, [fps * 0.25, fps * 0.5, fps * 0.8], [0.8, 0.4, 0], {
    extrapolateRight: 'clamp',
  });
  
  // Shadow
  const shadowScale = interpolate(bounce1, [0, 1], [0.3, 1]);
  const shadowOpacity = interpolate(bounce1, [0, 1], [0.1, 0.4]);
  
  const taglineOpacity = interpolate(
    frame,
    [fps * 0.8, fps * 1.2, durationInFrames - fps * 0.3, durationInFrames],
    [0, 1, 1, 0],
    { extrapolateRight: 'clamp' }
  );

  return (
    <>
      {/* Ambient glow */}
      <Glow color={colors.primary} y="70%" />
      
      {/* Impact ring */}
      <div
        style={{
          position: 'absolute',
          width: 200,
          height: 60,
          bottom: '28%',
          borderRadius: '50%',
          border: `3px solid ${colors.primary}`,
          transform: `scale(${ringScale})`,
          opacity: ringOpacity,
          boxShadow: `0 0 20px ${colors.primary}, inset 0 0 20px ${colors.primary}50`,
        }}
      />
      
      {/* Ground glow */}
      <div
        style={{
          position: 'absolute',
          width: 400,
          height: 100,
          bottom: '25%',
          background: `radial-gradient(ellipse at center, ${colors.primary}${Math.round(impactProgress * 150).toString(16).padStart(2, '0')} 0%, transparent 70%)`,
          filter: 'blur(20px)',
        }}
      />
      
      {/* Shadow */}
      <div
        style={{
          position: 'absolute',
          width: 300,
          height: 30,
          bottom: '26%',
          background: `radial-gradient(ellipse at center, rgba(0,0,0,${shadowOpacity}) 0%, transparent 70%)`,
          transform: `scaleX(${shadowScale})`,
          filter: 'blur(10px)',
        }}
      />
      
      {/* Logo */}
      <div
        style={{
          transform: `translateY(${logoY}px) scaleX(${squash}) scaleY(${stretch})`,
          opacity: logoOpacity,
          filter: `drop-shadow(0 20px 40px ${colors.primary}60)`,
          zIndex: 10,
        }}
      >
        <Img src={logo} style={{ width: 600, height: 'auto' }} />
      </div>
      
      {/* Tagline */}
      <div
        style={{
          position: 'absolute',
          bottom: '15%',
          opacity: taglineOpacity,
          zIndex: 10,
        }}
      >
        <ShimmerText fontSize={34}>{tagline.toUpperCase()}</ShimmerText>
      </div>
      
      {impactProgress > 0 && <Particles count={20} />}
    </>
  );
};

// ============ LOGO GLITCH ============
const LogoGlitch: React.FC<{ logo: string; tagline: string }> = ({ logo, tagline }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const { colors } = useTheme();
  
  // Glitch intensity
  const glitchIntensity = useMemo(() => {
    const t = frame / fps;
    const burst1 = t > 0.3 && t < 0.5 ? Math.sin(frame * 2) * 0.5 + 0.5 : 0;
    const burst2 = t > 1 && t < 1.3 ? Math.sin(frame * 3) * 0.5 + 0.5 : 0;
    const burst3 = t > 2 && t < 2.2 ? Math.sin(frame * 2.5) * 0.5 + 0.5 : 0;
    const micro = Math.random() > 0.95 ? 0.3 : 0;
    return Math.max(burst1, burst2, burst3, micro);
  }, [frame, fps]);
  
  const shakeX = glitchIntensity * (Math.random() - 0.5) * 20;
  const shakeY = glitchIntensity * (Math.random() - 0.5) * 15;
  const chromaOffset = glitchIntensity * 12;
  
  const logoOpacity = interpolate(
    frame,
    [0, fps * 0.2, durationInFrames - fps * 0.3, durationInFrames],
    [0, 1, 1, 0],
    { extrapolateRight: 'clamp' }
  );
  const scanY = (frame * 6) % 100;

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        transform: `translate(${shakeX}px, ${shakeY}px)`,
      }}
    >
      {/* Noise */}
      <div
        style={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          opacity: 0.03 + glitchIntensity * 0.05,
          background: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        }}
      />
      
      {/* Scan lines */}
      <div
        style={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          background:
            'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.1) 2px, rgba(0,0,0,0.1) 4px)',
        }}
      />
      
      {/* Moving scan line */}
      <div
        style={{
          position: 'absolute',
          width: '100%',
          height: 4,
          top: `${scanY}%`,
          background: `linear-gradient(90deg, transparent, ${colors.primary}60, transparent)`,
          boxShadow: `0 0 20px ${colors.primary}`,
        }}
      />
      
      {/* Logo with glitch */}
      <div style={{ position: 'relative', opacity: logoOpacity }}>
        {/* Chromatic aberration */}
        {glitchIntensity > 0 && (
          <>
            <Img
              src={logo}
              style={{
                position: 'absolute',
                width: 600,
                transform: `translateX(${-chromaOffset}px)`,
                filter: 'hue-rotate(90deg)',
                opacity: 0.7,
                mixBlendMode: 'screen',
              }}
            />
            <Img
              src={logo}
              style={{
                position: 'absolute',
                width: 600,
                transform: `translateX(${chromaOffset}px)`,
                filter: 'hue-rotate(-90deg)',
                opacity: 0.7,
                mixBlendMode: 'screen',
              }}
            />
          </>
        )}
        
        <Img
          src={logo}
          style={{
            width: 600,
            filter: `drop-shadow(0 0 20px ${colors.primary})`,
          }}
        />
      </div>
      
      {/* Tagline */}
      <div
        style={{
          marginTop: 50,
          textShadow:
            glitchIntensity > 0
              ? `${chromaOffset}px 0 cyan, -${chromaOffset}px 0 red, 0 0 20px ${colors.primary}`
              : `0 0 20px ${colors.primary}`,
          opacity: interpolate(
            frame,
            [fps * 0.5, fps * 0.8, durationInFrames - fps * 0.3, durationInFrames],
            [0, 1, 1, 0],
            { extrapolateRight: 'clamp' }
          ),
        }}
      >
        <ShimmerText fontSize={34}>{tagline.toUpperCase()}</ShimmerText>
      </div>
      
      {/* VHS timestamp */}
      <div
        style={{
          position: 'absolute',
          bottom: 30,
          right: 40,
          fontFamily: 'monospace',
          fontSize: 16,
          color: '#fff',
          opacity: 0.6,
          textShadow: `2px 0 ${colors.primary}`,
        }}
      >
        REC ● {new Date().toLocaleTimeString()}
      </div>
    </div>
  );
};

// ============ LOGO SPIN ============
const LogoSpin: React.FC<{ logo: string; tagline: string }> = ({ logo, tagline }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const { colors } = useTheme();
  
  const spinProgress = interpolate(frame, [0, fps * 2], [0, 1], {
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.ease),
  });
  const rotation = spinProgress * 720;
  const scale = interpolate(spinProgress, [0, 0.3, 0.6, 1], [0, 1.3, 0.9, 1]);
  
  const logoOpacity = interpolate(
    frame,
    [0, fps * 0.3, durationInFrames - fps * 0.3, durationInFrames],
    [0, 1, 1, 0],
    { extrapolateRight: 'clamp' }
  );
  const taglineOpacity = interpolate(
    frame,
    [fps * 1.5, fps * 2, durationInFrames - fps * 0.3, durationInFrames],
    [0, 1, 1, 0],
    { extrapolateRight: 'clamp' }
  );
  
  const trailOpacity = interpolate(spinProgress, [0, 0.5, 1], [0, 0.6, 0]);

  return (
    <>
      <Glow color={colors.primary} />
      
      {/* Rotation trail */}
      <div
        style={{
          position: 'absolute',
          width: 600,
          height: 600,
          border: `2px solid ${colors.primary}`,
          borderRadius: '50%',
          opacity: trailOpacity,
          transform: `scale(${scale * 1.2})`,
          boxShadow: `0 0 40px ${colors.primary}40`,
        }}
      />
      
      <Particles count={30} />
      
      {/* Logo */}
      <div
        style={{
          transform: `scale(${scale}) rotateY(${rotation}deg)`,
          opacity: logoOpacity,
          perspective: 1000,
          filter: `drop-shadow(0 0 40px ${colors.primary})`,
          zIndex: 10,
        }}
      >
        <Img src={logo} style={{ width: 600, height: 'auto' }} />
      </div>
      
      {/* Tagline */}
      <div
        style={{
          opacity: taglineOpacity,
          marginTop: 60,
          zIndex: 10,
        }}
      >
        <ShimmerText fontSize={36}>{tagline.toUpperCase()}</ShimmerText>
      </div>
    </>
  );
};

// ============ LOGO PARTICLES ============
const LogoParticles: React.FC<{ logo: string; tagline: string }> = ({ logo, tagline }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const { colors } = useTheme();
  
  const revealProgress = interpolate(frame, [fps * 0.5, fps * 1.5], [0, 1], {
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.ease),
  });
  const logoOpacity = interpolate(
    frame,
    [fps * 0.8, fps * 1.2, durationInFrames - fps * 0.3, durationInFrames],
    [0, 1, 1, 0],
    { extrapolateRight: 'clamp' }
  );
  const logoScale = interpolate(revealProgress, [0, 0.5, 1], [0.7, 1.1, 1]);
  
  const taglineOpacity = interpolate(
    frame,
    [fps * 1.5, fps * 2, durationInFrames - fps * 0.3, durationInFrames],
    [0, 1, 1, 0],
    { extrapolateRight: 'clamp' }
  );

  return (
    <>
      <Particles count={80} />
      <Particles count={40} color={colors.secondary} speed={0.8} />
      
      <Glow color={colors.primary} size={800 * (0.8 + revealProgress * 0.4)} />
      
      {/* Logo */}
      <div
        style={{
          transform: `scale(${logoScale})`,
          opacity: logoOpacity,
          filter: `drop-shadow(0 0 40px ${colors.primary}) drop-shadow(0 0 80px ${colors.primary}50)`,
          zIndex: 10,
        }}
      >
        <Img src={logo} style={{ width: 600, height: 'auto' }} />
      </div>
      
      {/* Tagline */}
      <div
        style={{
          opacity: taglineOpacity,
          marginTop: 50,
          zIndex: 10,
        }}
      >
        <ShimmerText fontSize={36}>{tagline.toUpperCase()}</ShimmerText>
      </div>
    </>
  );
};

// ============ MAIN COMPONENT ============
const BrandingInner: React.FC<Omit<BrandingProps, 'branding'>> = ({
  logo: customLogo,
  tagline = 'Your tagline here',
  effect = 'reveal',
  format = 'landscape',
}) => {
  const { colors, logo: themeLogo } = useTheme();
  
  const logoSrc = customLogo || themeLogo;
  if (!logoSrc) {
    return (
      <AbsoluteFill
        style={{
          backgroundColor: colors.background,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          color: colors.text,
          fontSize: 24,
        }}
      >
        No logo provided
      </AbsoluteFill>
    );
  }
  
  const finalLogo = logoSrc.startsWith('http') ? logoSrc : staticFile(logoSrc);
  
  const renderEffect = () => {
    switch (effect) {
      case 'reveal':
        return <LogoReveal logo={finalLogo} tagline={tagline} />;
      case 'bounce':
        return <LogoBounce logo={finalLogo} tagline={tagline} />;
      case 'glitch':
        return <LogoGlitch logo={finalLogo} tagline={tagline} />;
      case 'spin':
        return <LogoSpin logo={finalLogo} tagline={tagline} />;
      case 'particles':
        return <LogoParticles logo={finalLogo} tagline={tagline} />;
      case 'cinematic':
        return <LogoReveal logo={finalLogo} tagline={tagline} />;
      default:
        return <LogoReveal logo={finalLogo} tagline={tagline} />;
    }
  };

  return (
    <AbsoluteFill
      style={{
        backgroundColor: colors.background,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        fontFamily: 'Inter, system-ui, sans-serif',
        overflow: 'hidden',
      }}
    >
      {renderEffect()}
      <Vignette />
    </AbsoluteFill>
  );
};

export const Branding: React.FC<BrandingProps> = ({ branding, ...props }) => {
  return (
    <ThemeProvider branding={branding}>
      <BrandingInner {...props} />
    </ThemeProvider>
  );
};
