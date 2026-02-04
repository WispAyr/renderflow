// ============================================
// EventReel - Multiple Events Rotating
// ============================================

import React from 'react';
import { AbsoluteFill, Img, interpolate, useCurrentFrame, useVideoConfig, spring, Sequence, staticFile } from 'remotion';
import { useTheme, ThemeProvider, BrandingConfig, AspectRatio, DIMENSIONS } from '../theme';
import { Particles, Glow, Vignette } from '../components/effects';
import { ShimmerText, GradientText } from '../components/text';
import { ThemedContainer, Badge, Card } from '../components/layout';

export interface EventItem {
  id: string;
  title: string;
  subtitle?: string;
  date: string;
  time?: string;
  venue?: string;
  category?: string;
  image?: string;
  price?: string;
}

export interface EventReelProps {
  events: EventItem[];
  title?: string;
  tagline?: string;
  branding?: Partial<BrandingConfig>;
  format?: AspectRatio;
  secondsPerEvent?: number;
}

// Single event card component
const EventCard: React.FC<{
  event: EventItem;
  index: number;
  isActive: boolean;
  enterFrame: number;
  exitFrame: number;
  isPortrait: boolean;
}> = ({ event, index, isActive, enterFrame, exitFrame, isPortrait }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { colors, fonts } = useTheme();
  
  const isEntering = frame >= enterFrame && frame < enterFrame + fps * 0.5;
  const isExiting = frame >= exitFrame - fps * 0.5 && frame < exitFrame;
  
  // Entry animation
  const enterProgress = interpolate(
    frame,
    [enterFrame, enterFrame + fps * 0.5],
    [0, 1],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );
  const enterY = interpolate(enterProgress, [0, 1], [100, 0]);
  const enterScale = interpolate(enterProgress, [0, 1], [0.8, 1]);
  const enterOpacity = interpolate(enterProgress, [0, 1], [0, 1]);
  
  // Exit animation
  const exitProgress = interpolate(
    frame,
    [exitFrame - fps * 0.5, exitFrame],
    [0, 1],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );
  const exitY = interpolate(exitProgress, [0, 1], [0, -100]);
  const exitScale = interpolate(exitProgress, [0, 1], [1, 0.8]);
  const exitOpacity = interpolate(exitProgress, [0, 1], [1, 0]);
  
  const translateY = isEntering ? enterY : isExiting ? exitY : 0;
  const scale = isEntering ? enterScale : isExiting ? exitScale : 1;
  const opacity = isEntering ? enterOpacity : isExiting ? exitOpacity : 1;
  
  if (!isActive && !isEntering && !isExiting) return null;
  
  return (
    <div
      style={{
        position: 'absolute',
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: isPortrait ? 'column' : 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 60,
        padding: isPortrait ? '120px 60px' : '80px 100px',
        transform: `translateY(${translateY}px) scale(${scale})`,
        opacity,
      }}
    >
      {/* Event Image */}
      {event.image && (
        <div
          style={{
            flex: isPortrait ? '0 0 300px' : '0 0 400px',
          }}
        >
          <Img
            src={event.image.startsWith('http') ? event.image : staticFile(event.image)}
            style={{
              width: isPortrait ? 300 : 400,
              height: isPortrait ? 400 : 500,
              objectFit: 'cover',
              borderRadius: 20,
              boxShadow: `0 20px 60px rgba(0,0,0,0.5), 0 0 40px ${colors.primary}30`,
            }}
          />
        </div>
      )}
      
      {/* Event Info */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: isPortrait ? 'center' : 'flex-start',
          textAlign: isPortrait ? 'center' : 'left',
        }}
      >
        {/* Category */}
        {event.category && (
          <Badge size="md" style={{ marginBottom: 20 }}>
            {event.category.toUpperCase()}
          </Badge>
        )}
        
        {/* Title */}
        <ShimmerText fontSize={event.title.length > 25 ? 56 : 72}>
          {event.title.toUpperCase()}
        </ShimmerText>
        
        {/* Subtitle */}
        {event.subtitle && (
          <div
            style={{
              fontFamily: fonts.accent || fonts.heading,
              fontSize: 32,
              fontWeight: 500,
              fontStyle: 'italic',
              color: colors.secondary || colors.primary,
              marginTop: 15,
              textShadow: `0 0 30px ${colors.secondary || colors.primary}60`,
            }}
          >
            {event.subtitle}
          </div>
        )}
        
        {/* Details */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 30,
            marginTop: 40,
            justifyContent: isPortrait ? 'center' : 'flex-start',
          }}
        >
          {/* Date */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              padding: '14px 24px',
              background: `${colors.primary}20`,
              border: `2px solid ${colors.primary}`,
              borderRadius: 12,
            }}
          >
            <span style={{ fontSize: 24 }}>📅</span>
            <span
              style={{
                fontFamily: fonts.heading,
                fontSize: 24,
                fontWeight: 600,
                color: colors.primary,
              }}
            >
              {event.date}
            </span>
          </div>
          
          {/* Time */}
          {event.time && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                fontSize: 22,
                color: colors.textMuted,
              }}
            >
              <span style={{ color: colors.primary }}>🕐</span>
              {event.time}
            </div>
          )}
          
          {/* Venue */}
          {event.venue && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                fontSize: 22,
                color: colors.textMuted,
              }}
            >
              <span style={{ color: colors.primary }}>📍</span>
              {event.venue}
            </div>
          )}
          
          {/* Price */}
          {event.price && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                fontSize: 26,
                fontWeight: 700,
                color: colors.primary,
              }}
            >
              🎟️ {event.price}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const EventReelInner: React.FC<Omit<EventReelProps, 'branding'>> = ({
  events,
  title = 'Coming Soon',
  tagline,
  format = 'landscape',
  secondsPerEvent = 5,
}) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const { colors, fonts, logo } = useTheme();
  
  const isPortrait = format === 'portrait';
  const framesPerEvent = fps * secondsPerEvent;
  
  // Calculate which event is active
  const introFrames = fps * 2;
  const currentEventIndex = Math.floor((frame - introFrames) / framesPerEvent);
  
  // Header animation
  const headerOpacity = interpolate(frame, [0, fps * 0.5], [0, 1], {
    extrapolateRight: 'clamp',
  });
  const headerY = interpolate(frame, [0, fps * 0.5], [-50, 0], {
    extrapolateRight: 'clamp',
  });
  
  // Progress bar
  const overallProgress = interpolate(
    frame,
    [introFrames, durationInFrames - fps],
    [0, 100],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  return (
    <ThemedContainer showParticles>
      {/* Central glow */}
      <Glow color={colors.primary} size={1000} blur={80} />
      
      {/* Header */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          padding: '40px 80px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          transform: `translateY(${headerY}px)`,
          opacity: headerOpacity,
          zIndex: 30,
        }}
      >
        {/* Title */}
        <div>
          <GradientText fontSize={42}>{title.toUpperCase()}</GradientText>
          {tagline && (
            <div
              style={{
                fontFamily: fonts.body,
                fontSize: 18,
                color: colors.textMuted,
                marginTop: 5,
                letterSpacing: '0.1em',
              }}
            >
              {tagline}
            </div>
          )}
        </div>
        
        {/* Logo */}
        {logo && (
          <Img
            src={logo.startsWith('http') ? logo : staticFile(logo)}
            style={{ height: 60, filter: `drop-shadow(0 0 20px ${colors.primary}50)` }}
          />
        )}
      </div>
      
      {/* Event Cards */}
      {events.map((event, index) => {
        const eventStartFrame = introFrames + index * framesPerEvent;
        const eventEndFrame = eventStartFrame + framesPerEvent;
        const isActive = frame >= eventStartFrame && frame < eventEndFrame;
        const isNearby = frame >= eventStartFrame - fps * 0.5 && frame < eventEndFrame + fps * 0.5;
        
        if (!isNearby) return null;
        
        return (
          <EventCard
            key={event.id}
            event={event}
            index={index}
            isActive={isActive}
            enterFrame={eventStartFrame}
            exitFrame={eventEndFrame}
            isPortrait={isPortrait}
          />
        );
      })}
      
      {/* Progress bar */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: 6,
          backgroundColor: `${colors.primary}20`,
        }}
      >
        <div
          style={{
            width: `${overallProgress}%`,
            height: '100%',
            background: `linear-gradient(90deg, ${colors.primary}, ${colors.secondary || colors.primary})`,
            boxShadow: `0 0 20px ${colors.primary}`,
          }}
        />
      </div>
      
      {/* Event counter */}
      <div
        style={{
          position: 'absolute',
          bottom: 30,
          right: 40,
          fontFamily: fonts.mono || fonts.body,
          fontSize: 18,
          color: colors.textMuted,
          opacity: headerOpacity,
        }}
      >
        {Math.min(currentEventIndex + 1, events.length)} / {events.length}
      </div>
    </ThemedContainer>
  );
};

export const EventReel: React.FC<EventReelProps> = ({ branding, ...props }) => {
  return (
    <ThemeProvider branding={branding}>
      <EventReelInner {...props} />
    </ThemeProvider>
  );
};
