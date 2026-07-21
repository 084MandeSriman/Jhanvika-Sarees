import React, { useId } from 'react'

// A generated "saree swatch" illustration: a draped fold, a zari border,
// and scattered paisley motifs, all colored from the product's palette.
// This is Jhanvika's signature visual — every saree gets a unique,
// hand-styled illustration instead of a stock photo.
export default function SareeArt({ palette, className = '', animate = false }) {
  const uid = useId().replace(/:/g, '')
  const { primary = '#6B1E3C', secondary = '#4A1329', accent = '#E4C97A' } = palette || {}

  return (
    <svg
      viewBox="0 0 400 500"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role="img"
      aria-label="Saree illustration"
    >
      <defs>
        <linearGradient id={`bg-${uid}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={primary} />
          <stop offset="100%" stopColor={secondary} />
        </linearGradient>
        <linearGradient id={`fold-${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={secondary} stopOpacity="0.55" />
          <stop offset="100%" stopColor={secondary} stopOpacity="0" />
        </linearGradient>
        <pattern id={`dots-${uid}`} width="26" height="26" patternUnits="userSpaceOnUse">
          <circle cx="13" cy="13" r="1.4" fill={accent} opacity="0.5" />
        </pattern>
      </defs>

      <rect width="400" height="500" fill={`url(#bg-${uid})`} />
      <rect width="400" height="500" fill={`url(#dots-${uid})`} />

      {/* drape folds */}
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <rect key={i} x={i * 62} y="0" width="34" height="500" fill={`url(#fold-${uid})`} />
      ))}

      {/* zari border, left + right */}
      <rect x="0" y="0" width="14" height="500" fill={accent} opacity="0.9" />
      <rect x="386" y="0" width="14" height="500" fill={accent} opacity="0.9" />
      <rect x="18" y="0" width="4" height="500" fill={accent} opacity="0.5" />
      <rect x="378" y="0" width="4" height="500" fill={accent} opacity="0.5" />

      {/* bottom pallu border */}
      <rect x="0" y="430" width="400" height="70" fill={secondary} opacity="0.9" />
      <rect x="0" y="430" width="400" height="6" fill={accent} />
      <rect x="0" y="494" width="400" height="6" fill={accent} />

      {/* paisley motifs scattered on body */}
      {[
        [70, 90], [220, 130], [140, 240], [300, 200], [60, 340], [250, 340], [330, 90], [110, 400],
      ].map(([cx, cy], idx) => (
        <g key={idx} transform={`translate(${cx} ${cy}) ${animate ? '' : ''}`} opacity="0.85">
          <path
            d="M0 -18 C 12 -18, 18 -8, 14 2 C 10 12, -4 14, -10 6 C -16 -2, -12 -18, 0 -18 Z"
            fill="none"
            stroke={accent}
            strokeWidth="1.6"
          />
          <circle cx="0" cy="-6" r="2" fill={accent} />
        </g>
      ))}

      {/* pallu motifs, denser row */}
      {[40, 100, 160, 220, 280, 340].map((x, idx) => (
        <g key={`p-${idx}`} transform={`translate(${x} 465)`}>
          <path
            d="M0 -12 C 8 -12, 12 -5, 9 2 C 6 9, -3 10, -7 4 C -11 -1, -8 -12, 0 -12 Z"
            fill={accent}
            opacity="0.9"
          />
        </g>
      ))}

      {/* subtle vignette */}
      <rect width="400" height="500" fill="black" opacity="0.05" />
    </svg>
  )
}
