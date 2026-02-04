// ============================================
// ProductBoard - Menu/Product Display
// ============================================

import React from 'react';
import { AbsoluteFill, Img, interpolate, useCurrentFrame, useVideoConfig, spring, staticFile } from 'remotion';
import { useTheme, ThemeProvider, BrandingConfig, AspectRatio, DIMENSIONS } from '../theme';
import { Particles, Glow, Vignette } from '../components/effects';
import { ShimmerText, GradientText, CounterText } from '../components/text';
import { ThemedContainer, Badge, Card, LogoDisplay } from '../components/layout';

export interface ProductItem {
  id: string;
  name: string;
  description?: string;
  price: string;
  image?: string;
  category?: string;
  featured?: boolean;
  calories?: number;
  tags?: string[];
}

export interface ProductBoardProps {
  products: ProductItem[];
  title?: string;
  subtitle?: string;
  showPrices?: boolean;
  showCalories?: boolean;
  columns?: number;
  branding?: Partial<BrandingConfig>;
  format?: AspectRatio;
}

// Single product card
const ProductCard: React.FC<{
  product: ProductItem;
  index: number;
  showPrices: boolean;
  showCalories: boolean;
  isPortrait: boolean;
}> = ({ product, index, showPrices, showCalories, isPortrait }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { colors, fonts, isDark } = useTheme();
  
  const delay = index * 0.1;
  
  // Staggered entrance
  const enterProgress = spring({
    frame: frame - fps * (0.5 + delay),
    fps,
    config: { damping: 18, stiffness: 100 },
  });
  
  const scale = interpolate(enterProgress, [0, 1], [0.8, 1]);
  const opacity = interpolate(enterProgress, [0, 0.5], [0, 1], { extrapolateRight: 'clamp' });
  const y = interpolate(enterProgress, [0, 1], [50, 0]);
  
  return (
    <div
      style={{
        transform: `translateY(${y}px) scale(${scale})`,
        opacity,
        backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)',
        border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`,
        borderRadius: 16,
        overflow: 'hidden',
        boxShadow: product.featured
          ? `0 0 30px ${colors.primary}30, 0 10px 40px rgba(0,0,0,0.3)`
          : '0 10px 30px rgba(0,0,0,0.2)',
        position: 'relative',
      }}
    >
      {/* Featured badge */}
      {product.featured && (
        <div
          style={{
            position: 'absolute',
            top: 15,
            right: 15,
            backgroundColor: colors.primary,
            color: 'white',
            padding: '6px 14px',
            borderRadius: 20,
            fontSize: 12,
            fontWeight: 700,
            letterSpacing: '0.1em',
            zIndex: 10,
          }}
        >
          FEATURED
        </div>
      )}
      
      {/* Product Image */}
      {product.image && (
        <div
          style={{
            height: isPortrait ? 150 : 180,
            overflow: 'hidden',
            position: 'relative',
          }}
        >
          <Img
            src={product.image.startsWith('http') ? product.image : staticFile(product.image)}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
          />
          {/* Gradient overlay */}
          <div
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: 60,
              background: `linear-gradient(to top, ${colors.background}, transparent)`,
            }}
          />
        </div>
      )}
      
      {/* Content */}
      <div style={{ padding: '20px 24px' }}>
        {/* Category */}
        {product.category && (
          <div
            style={{
              fontSize: 11,
              fontWeight: 600,
              color: colors.primary,
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              marginBottom: 8,
            }}
          >
            {product.category}
          </div>
        )}
        
        {/* Name */}
        <div
          style={{
            fontFamily: fonts.heading,
            fontSize: 22,
            fontWeight: 700,
            color: colors.text,
            marginBottom: 8,
            lineHeight: 1.2,
          }}
        >
          {product.name}
        </div>
        
        {/* Description */}
        {product.description && (
          <div
            style={{
              fontSize: 14,
              color: colors.textMuted,
              marginBottom: 15,
              lineHeight: 1.4,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {product.description}
          </div>
        )}
        
        {/* Tags */}
        {product.tags && product.tags.length > 0 && (
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 15 }}>
            {product.tags.slice(0, 3).map((tag, i) => (
              <span
                key={i}
                style={{
                  fontSize: 10,
                  padding: '4px 10px',
                  backgroundColor: `${colors.primary}20`,
                  color: colors.primary,
                  borderRadius: 12,
                  fontWeight: 600,
                }}
              >
                {tag}
              </span>
            ))}
          </div>
        )}
        
        {/* Price and Calories row */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: 'auto',
          }}
        >
          {showPrices && (
            <div
              style={{
                fontFamily: fonts.heading,
                fontSize: 28,
                fontWeight: 800,
                color: colors.primary,
                textShadow: `0 0 20px ${colors.primary}40`,
              }}
            >
              {product.price}
            </div>
          )}
          
          {showCalories && product.calories && (
            <div
              style={{
                fontSize: 13,
                color: colors.textMuted,
                fontFamily: fonts.mono || fonts.body,
              }}
            >
              {product.calories} cal
            </div>
          )}
        </div>
      </div>
      
      {/* Accent line for featured */}
      {product.featured && (
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: 3,
            background: `linear-gradient(90deg, ${colors.primary}, ${colors.secondary || colors.primary})`,
          }}
        />
      )}
    </div>
  );
};

const ProductBoardInner: React.FC<Omit<ProductBoardProps, 'branding'>> = ({
  products,
  title = 'Menu',
  subtitle,
  showPrices = true,
  showCalories = false,
  columns,
  format = 'landscape',
}) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const { colors, fonts, logo, isDark } = useTheme();
  
  const isPortrait = format === 'portrait';
  const isSquare = format === 'square';
  
  // Auto-determine columns if not specified
  const gridColumns = columns || (isPortrait ? 2 : products.length <= 4 ? products.length : 4);
  
  // Header animation
  const headerOpacity = interpolate(frame, [0, fps * 0.5], [0, 1], {
    extrapolateRight: 'clamp',
  });
  const headerY = interpolate(frame, [0, fps * 0.5], [-40, 0], {
    extrapolateRight: 'clamp',
  });
  
  // Overall fade out
  const fadeOut = interpolate(
    frame,
    [durationInFrames - fps * 0.5, durationInFrames],
    [1, 0],
    { extrapolateLeft: 'clamp' }
  );

  return (
    <ThemedContainer>
      {/* Subtle gradient background */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: `
            radial-gradient(ellipse at top, ${colors.primary}08 0%, transparent 50%),
            radial-gradient(ellipse at bottom right, ${colors.secondary || colors.primary}05 0%, transparent 40%)
          `,
        }}
      />
      
      {/* Header */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          padding: isPortrait ? '40px 40px' : '50px 80px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          transform: `translateY(${headerY}px)`,
          opacity: headerOpacity * fadeOut,
          zIndex: 20,
          background: `linear-gradient(to bottom, ${colors.background} 0%, ${colors.background}80 70%, transparent 100%)`,
        }}
      >
        <div>
          <GradientText fontSize={isPortrait ? 36 : 48}>{title.toUpperCase()}</GradientText>
          {subtitle && (
            <div
              style={{
                fontFamily: fonts.body,
                fontSize: isPortrait ? 16 : 20,
                color: colors.textMuted,
                marginTop: 8,
                letterSpacing: '0.05em',
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
              filter: `drop-shadow(0 0 15px ${colors.primary}40)`,
            }}
          />
        )}
      </div>
      
      {/* Product Grid */}
      <div
        style={{
          position: 'absolute',
          top: isPortrait ? 140 : 160,
          bottom: 40,
          left: isPortrait ? 30 : 60,
          right: isPortrait ? 30 : 60,
          display: 'grid',
          gridTemplateColumns: `repeat(${gridColumns}, 1fr)`,
          gap: isPortrait ? 20 : 30,
          alignContent: 'start',
          opacity: fadeOut,
          overflowY: 'hidden',
        }}
      >
        {products.map((product, index) => (
          <ProductCard
            key={product.id}
            product={product}
            index={index}
            showPrices={showPrices}
            showCalories={showCalories}
            isPortrait={isPortrait}
          />
        ))}
      </div>
      
      {/* Decorative bottom gradient */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: 100,
          background: `linear-gradient(to top, ${colors.background}, transparent)`,
          pointerEvents: 'none',
          zIndex: 10,
        }}
      />
    </ThemedContainer>
  );
};

export const ProductBoard: React.FC<ProductBoardProps> = ({ branding, ...props }) => {
  return (
    <ThemeProvider branding={branding}>
      <ProductBoardInner {...props} />
    </ThemeProvider>
  );
};
