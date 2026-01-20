import React from 'react';

interface StaffAvatarProps {
  name: string;
  color?: string;
  size?: number;
  className?: string;
}

/**
 * Professional SVG staff avatar with unique silhouette based on name
 * Creates premium-looking avatars with gradient backgrounds and elegant design
 */
export const StaffAvatar: React.FC<StaffAvatarProps> = ({
  name,
  color = '#6366f1',
  size = 56,
  className = '',
}) => {
  // Generate consistent variant based on name
  const getVariant = (name: string): number => {
    const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return hash % 4;
  };
  
  const variant = getVariant(name);
  const id = `avatar-${name.replace(/\s/g, '-').toLowerCase()}`;
  
  // Premium gradient colors derived from base color
  const lighterColor = adjustColor(color, 30);
  const darkerColor = adjustColor(color, -20);
  
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 56 56"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role="img"
      aria-label={`Avatar pre ${name}`}
    >
      <defs>
        {/* Premium radial gradient background */}
        <radialGradient id={`${id}-bg`} cx="30%" cy="30%" r="70%">
          <stop offset="0%" stopColor={lighterColor} />
          <stop offset="100%" stopColor={darkerColor} />
        </radialGradient>
        
        {/* Subtle inner glow */}
        <radialGradient id={`${id}-glow`} cx="50%" cy="30%" r="50%">
          <stop offset="0%" stopColor="rgba(255,255,255,0.3)" />
          <stop offset="100%" stopColor="rgba(255,255,255,0)" />
        </radialGradient>
        
        {/* Silhouette gradient */}
        <linearGradient id={`${id}-silhouette`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="rgba(255,255,255,0.95)" />
          <stop offset="100%" stopColor="rgba(255,255,255,0.85)" />
        </linearGradient>
        
        {/* Premium ring */}
        <linearGradient id={`${id}-ring`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="rgba(255,255,255,0.4)" />
          <stop offset="50%" stopColor="rgba(255,255,255,0.1)" />
          <stop offset="100%" stopColor="rgba(255,255,255,0.3)" />
        </linearGradient>
      </defs>
      
      {/* Background circle */}
      <circle cx="28" cy="28" r="27" fill={`url(#${id}-bg)`} />
      
      {/* Inner glow overlay */}
      <circle cx="28" cy="28" r="26" fill={`url(#${id}-glow)`} />
      
      {/* Silhouette based on variant */}
      {renderSilhouette(variant, id)}
      
      {/* Premium border ring */}
      <circle
        cx="28"
        cy="28"
        r="26.5"
        stroke={`url(#${id}-ring)`}
        strokeWidth="1"
        fill="none"
      />
    </svg>
  );
};

// Adjust color brightness
function adjustColor(color: string, percent: number): string {
  const num = parseInt(color.replace('#', ''), 16);
  const amt = Math.round(2.55 * percent);
  const R = Math.min(255, Math.max(0, (num >> 16) + amt));
  const G = Math.min(255, Math.max(0, ((num >> 8) & 0x00ff) + amt));
  const B = Math.min(255, Math.max(0, (num & 0x0000ff) + amt));
  return `#${((1 << 24) + (R << 16) + (G << 8) + B).toString(16).slice(1)}`;
}

// Render different silhouette variants
function renderSilhouette(variant: number, id: string) {
  const fill = `url(#${id}-silhouette)`;
  
  switch (variant) {
    case 0: // Professional female - elegant hairstyle
      return (
        <g>
          {/* Head */}
          <ellipse cx="28" cy="22" rx="10" ry="11" fill={fill} />
          {/* Elegant hair */}
          <path
            d="M18 20c0-8 4.5-12 10-12s10 4 10 12c0 2-1 3-2 4-1-6-3.5-9-8-9s-7 3-8 9c-1-1-2-2-2-4z"
            fill={fill}
          />
          {/* Shoulders/body */}
          <path
            d="M14 56c0-14 6-20 14-20s14 6 14 20"
            fill={fill}
          />
          {/* Collar detail */}
          <path
            d="M24 36c2-1 4-1 8 0l-4 4-4-4z"
            fill="rgba(255,255,255,0.7)"
          />
        </g>
      );
      
    case 1: // Professional male - short hair
      return (
        <g>
          {/* Head */}
          <ellipse cx="28" cy="23" rx="9" ry="10" fill={fill} />
          {/* Short styled hair */}
          <path
            d="M19 21c0-7 4-11 9-11s9 4 9 11c0 1-0.5 2-1 2.5 0-6-3.5-9-8-9s-8 3-8 9c-0.5-0.5-1-1.5-1-2.5z"
            fill={fill}
          />
          {/* Shoulders/body */}
          <path
            d="M12 56c0-14 7-21 16-21s16 7 16 21"
            fill={fill}
          />
          {/* Tie detail */}
          <path
            d="M26 36l2 8 2-8-2-1-2 1z"
            fill="rgba(255,255,255,0.6)"
          />
        </g>
      );
      
    case 2: // Professional female - ponytail
      return (
        <g>
          {/* Head */}
          <ellipse cx="28" cy="22" rx="9" ry="10" fill={fill} />
          {/* Ponytail hairstyle */}
          <path
            d="M19 19c0-7 4-11 9-11s9 4 9 11c0 2-1 3-2 4-0.5-6-3-9-7-9s-7 3-7.5 9c-1-1-1.5-2-1.5-4z"
            fill={fill}
          />
          {/* Ponytail */}
          <ellipse cx="38" cy="18" rx="4" ry="6" fill={fill} />
          <path d="M35 16c1-3 4-4 5-3" stroke={fill} strokeWidth="3" fill="none" />
          {/* Shoulders/body */}
          <path
            d="M14 56c0-14 6-20 14-20s14 6 14 20"
            fill={fill}
          />
        </g>
      );
      
    case 3: // Professional male - styled hair
    default:
      return (
        <g>
          {/* Head */}
          <ellipse cx="28" cy="23" rx="9.5" ry="10.5" fill={fill} />
          {/* Modern styled hair */}
          <path
            d="M18.5 21c0-8 4.5-12 9.5-12s9.5 4 9.5 12c0 1.5-0.5 2.5-1.5 3.5-0.5-7-4-10-8-10s-7.5 3-8 10c-1-1-1.5-2-1.5-3.5z"
            fill={fill}
          />
          {/* Shoulders/body */}
          <path
            d="M13 56c0-13 6.5-20 15-20s15 7 15 20"
            fill={fill}
          />
          {/* Collar detail */}
          <path
            d="M22 36l6 2 6-2-3 4h-6l-3-4z"
            fill="rgba(255,255,255,0.7)"
          />
        </g>
      );
  }
}

export default StaffAvatar;
