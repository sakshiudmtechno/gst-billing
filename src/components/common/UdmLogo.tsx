import React from 'react';

interface UdmLogoProps {
  className?: string;
  height?: number | string;
  variant?: 'full' | 'icon' | 'white';
}

export const UdmLogo: React.FC<UdmLogoProps> = ({
  className = 'h-10',
  height,
  variant = 'full'
}) => {
  if (variant === 'icon') {
    return (
      <svg
        viewBox="0 0 130 140"
        className={className}
        style={height ? { height } : undefined}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="udmGradIcon1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#818cf8" />
            <stop offset="100%" stopColor="#4f46e5" />
          </linearGradient>
          <linearGradient id="udmGradIcon2" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#c7d2fe" />
            <stop offset="60%" stopColor="#818cf8" />
            <stop offset="100%" stopColor="#4338ca" />
          </linearGradient>
          <linearGradient id="udmSoftIcon" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#e0e7ff" />
            <stop offset="100%" stopColor="#a5b4fc" />
          </linearGradient>
        </defs>
        <g transform="translate(5, 5)">
          <path
            d="M 12 5 L 36 5 L 36 82 C 36 102 50 114 68 114 C 76 114 83 111 89 106 C 81 113 70 117 58 117 C 32 117 12 97 12 72 Z"
            fill="#141a36"
          />
          <path
            d="M 36 68 C 36 88 48 106 68 112 C 52 108 38 94 36 78 Z"
            fill="url(#udmSoftIcon)"
            opacity="0.9"
          />
          <path
            d="M 90 5 L 114 5 L 114 74 C 114 100 94 122 66 122 C 42 122 25 106 20 86 C 26 100 42 112 62 112 C 84 112 94 96 94 74 L 94 5 Z"
            fill="url(#udmGradIcon1)"
          />
          <path
            d="M 68 114 C 88 110 114 92 114 55 L 94 55 C 94 78 80 96 60 102 C 63 107 65 111 68 114 Z"
            fill="url(#udmGradIcon2)"
          />
        </g>
      </svg>
    );
  }

  const textColor = variant === 'white' ? '#ffffff' : '#141a36';

  return (
    <svg
      viewBox="0 0 380 145"
      className={className}
      style={height ? { height } : undefined}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="udmGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#818cf8" />
          <stop offset="100%" stopColor="#4f46e5" />
        </linearGradient>
        <linearGradient id="udmGrad2" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#c7d2fe" />
          <stop offset="60%" stopColor="#818cf8" />
          <stop offset="100%" stopColor="#4338ca" />
        </linearGradient>
        <linearGradient id="udmSoft" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#e0e7ff" />
          <stop offset="100%" stopColor="#a5b4fc" />
        </linearGradient>
      </defs>

      {/* Monogram U */}
      <g transform="translate(10, 10)">
        <path
          d="M 12 5 L 36 5 L 36 82 C 36 102 50 114 68 114 C 76 114 83 111 89 106 C 81 113 70 117 58 117 C 32 117 12 97 12 72 Z"
          fill={variant === 'white' ? '#93c5fd' : '#141a36'}
        />
        <path
          d="M 36 68 C 36 88 48 106 68 112 C 52 108 38 94 36 78 Z"
          fill="url(#udmSoft)"
          opacity="0.9"
        />
        <path
          d="M 90 5 L 114 5 L 114 74 C 114 100 94 122 66 122 C 42 122 25 106 20 86 C 26 100 42 112 62 112 C 84 112 94 96 94 74 L 94 5 Z"
          fill="url(#udmGrad1)"
        />
        <path
          d="M 68 114 C 88 110 114 92 114 55 L 94 55 C 94 78 80 96 60 102 C 63 107 65 111 68 114 Z"
          fill="url(#udmGrad2)"
        />
      </g>

      {/* UDM Text */}
      <text
        x="146"
        y="82"
        fill={textColor}
        fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
        fontSize="66"
        fontWeight="900"
        letterSpacing="1"
      >
        UDM
      </text>

      {/* TECHNO SOLUTIONS Subtitle */}
      <text
        x="148"
        y="114"
        fill={variant === 'white' ? '#cbd5e1' : '#141a36'}
        fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
        fontSize="15"
        fontWeight="800"
        letterSpacing="3.5"
      >
        TECHNO SOLUTIONS
      </text>
    </svg>
  );
};
