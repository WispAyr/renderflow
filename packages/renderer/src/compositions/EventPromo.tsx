// ============================================
// EventPromo - Single Event Spotlight
// ============================================

import React from 'react';
import { AbsoluteFill, Img, interpolate, useCurrentFrame, useVideoConfig, spring, Sequence, staticFile } from 'remotion';
import { useTheme, ThemeProvider, BrandingConfig, AspectRatio, DIMENSIONS } from '../theme';
import { Particles, Glow, Vignette, LensFlare } from '../components/effects';
import { ShimmerText, AnimatedTitle } from '../components/text';
import { ThemedContainer, Badge, FooterBar } from '../components/layout';

export interface EventPromoProps {
  // Content
  title: string;
  subtitle?: string;
  date: string;
  time?: string;
  venue?: string;
  price?: string;
  category?: string;
  description?: string;
  
  // Media
  image?: string;
  backgroundImage?: string;
  
  // CTA
  ctaText?: string;
  website?: string;
  phone?: string;
  
  // Branding (applied via wrapper)
  branding?: Partial<BrandingConfig>;
  
  // Format
  format?: AspectRatio;
}

// Inner component with theme access
const EventPromoInner: React.FC<Omit<EventPromoProps, 'branding'>> = ({
  title,
  subtitle,
  date,
  time = '7:30pm',
  venue,
  price,
  category,
  description,
  image,
  backgroundImage,
  ctaText = 'Book Now',
  website,
  phone,
  format = 'landscape',
}) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const { colors, fonts, logo } = useTheme();
  
  const dims = DIMENSIONS[format];
  const isPortrait = format === 'portrait';
  const isSquare = format === 'square';
  
  // === ANIMATION PHASES ===
  // Phase 1: Opening (0-2s) - Background reveal, glow builds
  // Phase 2: Title (2-5s) - Category, title, subtitle animate in
  // Phase 3: Details (5-7s) - Date, time, venue, price
  // Phase 4: CTA (7-10s) - Book now with contact
  
  // Background intensity animation
  const bgIntensity = interpolate(
    frame,
    [0, fps * 1, fps * 8, durationInFrames],
    [0.3, 1, 1, 0.5],
    { extrapolateRight: 'clamp' }
  );
  
  // Overall content fade out at end
  const contentFade = interpolate(
    frame,
    [durationInFrames - fps * 0.5, durationInFrames],
    [1, 0],
    { extrapolateLeft: 'clamp' }
  );
  
  // Lens flare timing
  const flareIntensity = interpolate(
    frame,
    [fps * 0.4, fps * 0.8, fps * 1.5, fps * 2],
    [0, 1.2, 0.3, 0],
    { extrapolateRight: 'clamp' }
  );
  const flareX = interpolate(
    frame,
    [fps * 0.4, fps * 1.5],
    [30, 70],
    { extrapolateRight: 'clamp' }
  );

  return (
    <ThemedContainer showParticles>
      {/* Background image if provided */}
      {backgroundImage && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            opacity: bgIntensity * 0.4,
          }}
        >
          <Img
            src={backgroundImage.startsWith('http') ? backgroundImage : staticFile(backgroundImage)}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              filter: 'blur(20px) saturate(1.2)',
            }}
          />
        </div>
      )}
      
      {/* Central glow */}
      <Glow color={colors.primary} size={1200} blur={80} />
      {colors.secondary && (
        <Glow color={colors.secondary} size={800} blur={60} x="30%" y="70%" />
      )}
      
      {/* Lens flare effect */}
      {flareIntensity > 0 && (
        <LensFlare x={flareX} y={45} intensity={flareIntensity} color={colors.primary} />
      )}
      
      {/* Main content area */}
      <AbsoluteFill
        style={{
          display: 'flex',
          flexDirection: isPortrait ? 'column' : 'row',
          justifyContent: 'center',
          alignItems: 'center',
          padding: isPortrait ? '80px 60px' : '60px 100px',
          opacity: contentFade,
          gap: 60,
        }}
      >
        {/* Event image (if provided) */}
        {image && !isPortrait && (
          <Sequence from={fps * 1.5} durationInFrames={fps * 8}>
            {(() => {
              const localFrame = frame - fps * 1.5;
              const imgScale = spring({
                frame: localFrame,
                fps,
                config: { damping: 15, stiffness: 80 },
              });
              const imgOpacity = interpolate(localFrame, [0, fps * 0.5], [0, 1], {
                extrapolateRight: 'clamp',
              });
              
              return (
                <div
                  style={{
                    flex: '0 0 400px',
                    transform: `scale(${imgScale})`,
                    opacity: imgOpacity,
                  }}
                >
                  <Img
                    src={image.startsWith('http') ? image : staticFile(image)}
                    style={{
                      width: 400,
                      height: 500,
                      objectFit: 'cover',
                      borderRadius: 20,
                      boxShadow: `0 20px 60px rgba(0,0,0,0.5), 0 0 40px ${colors.primary}30`,
                    }}
                  />
                </div>
              );
            })()}
          </Sequence>
        )}
        
        {/* Text content */}
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: isPortrait || isSquare ? 'center' : 'flex-start',
            textAlign: isPortrait || isSquare ? 'center' : 'left',
            maxWidth: isPortrait ? '100%' : 800,
          }}
        >
          {/* Category badge */}
          {category && (
            <Sequence from={fps * 2} durationInFrames={fps * 8}>
              {(() => {
                const localFrame = frame - fps * 2;
                const badgeScale = spring({
                  frame: localFrame,
                  fps,
                  config: { damping: 18, stiffness: 100 },
                });
                const badgeOpacity = interpolate(localFrame, [0, fps * 0.3], [0, 1], {
                  extrapolateRight: 'clamp',
                });
                
                return (
                  <div
                    style={{
                      transform: `scale(${interpolate(badgeScale, [0, 1], [0.5, 1])})`,
                      opacity: badgeOpacity,
                      marginBottom: 25,
                    }}
                  >
                    <Badge size="lg">{category.toUpperCase()}</Badge>
                  </div>
                );
              })()}
            </Sequence>
          )}
          
          {/* Title */}
          <Sequence from={fps * 2.3} durationInFrames={fps * 7.5}>
            <AnimatedTitle title={title} subtitle={subtitle} />
          </Sequence>
          
          {/* Details row */}
          <Sequence from={fps * 5} durationInFrames={fps * 5}>
            {(() => {
              const localFrame = frame - fps * 5;
              const detailsY = interpolate(localFrame, [0, fps * 0.4], [40, 0], {
                extrapolateRight: 'clamp',
              });
              const detailsOpacity = interpolate(localFrame, [0, fps * 0.4], [0, 1], {
                extrapolateRight: 'clamp',
              });
              
              return (
                <div
                  style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: isPortrait ? 20 : 40,
                    marginTop: 40,
                    transform: `translateY(${detailsY}px)`,
                    opacity: detailsOpacity,
                    justifyContent: isPortrait || isSquare ? 'center' : 'flex-start',
                  }}
                >
                  {/* Date */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      padding: '16px 28px',
                      background: `${colors.primary}20`,
                      border: `2px solid ${colors.primary}`,
                      borderRadius: 12,
                      boxShadow: `0 0 30px ${colors.primary}30`,
                    }}
                  >
                    <span style={{ fontSize: 28 }}>📅</span>
                    <span
                      style={{
                        fontFamily: fonts.accent || fonts.heading,
                        fontSize: 28,
                        fontWeight: 600,
                        color: colors.primary,
                      }}
                    >
                      {date}
                    </span>
                  </div>
                  
                  {/* Time */}
                  {time && (
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 12,
                        fontSize: 26,
                        color: colors.textMuted,
                      }}
                    >
                      <span style={{ color: colors.primary }}>🕐</span>
                      {time}
                    </div>
                  )}
                  
                  {/* Venue */}
                  {venue && (
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 12,
                        fontSize: 26,
                        color: colors.textMuted,
                      }}
                    >
                      <span style={{ color: colors.primary }}>📍</span>
                      {venue}
                    </div>
                  )}
                  
                  {/* Price */}
                  {price && (
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 12,
                        fontSize: 30,
                        fontWeight: 700,
                        color: colors.primary,
                        textShadow: `0 0 20px ${colors.primary}80`,
                      }}
                    >
                      🎟️ {price}
                    </div>
                  )}
                </div>
              );
            })()}
          </Sequence>
        </div>
      </AbsoluteFill>
      
      {/* CTA Footer */}
      <Sequence from={fps * 7} durationInFrames={fps * 3}>
        <FooterBar
          left={
            logo ? (
              <div>
                <ShimmerText fontSize={32}>{''}</ShimmerText>
              </div>
            ) : null
          }
          center={
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
              <div
                style={{
                  fontFamily: fonts.accent || fonts.heading,
                  fontSize: 18,
                  fontWeight: 600,
                  letterSpacing: '0.5em',
                  color: colors.primary,
                }}
              >
                {ctaText.toUpperCase()}
              </div>
              {website && (
                <div
                  style={{
                    fontSize: 32,
                    fontWeight: 700,
                    color: colors.text,
                  }}
                >
                  {website}
                </div>
              )}
            </div>
          }
          right={
            phone ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
                <div
                  style={{
                    fontFamily: fonts.accent,
                    fontSize: 14,
                    letterSpacing: '0.3em',
                    color: colors.textMuted,
                  }}
                >
                  CALL
                </div>
                <div
                  style={{
                    fontSize: 28,
                    fontWeight: 600,
                    color: colors.text,
                    letterSpacing: '0.1em',
                  }}
                >
                  {phone}
                </div>
              </div>
            ) : null
          }
        />
      </Sequence>
      
      {/* Top accent line */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 4,
          background: `linear-gradient(90deg, transparent, ${colors.primary}, transparent)`,
          boxShadow: `0 0 30px ${colors.primary}80`,
          opacity: interpolate(frame, [fps * 1, fps * 2], [0, 0.8], {
            extrapolateRight: 'clamp',
          }),
          zIndex: 60,
        }}
      />
    </ThemedContainer>
  );
};

// Exported component with theme wrapper
export const EventPromo: React.FC<EventPromoProps> = ({ branding, ...props }) => {
  return (
    <ThemeProvider branding={branding}>
      <EventPromoInner {...props} />
    </ThemeProvider>
  );
};
