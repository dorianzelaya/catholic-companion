/*
 * Home grid tile icons.
 *
 * All six are hand-authored SVGs (provided as artwork, not drawn here) set
 * to one shared spec so they read as a matched set:
 *   - viewBox 0 0 24 24
 *   - stroke="currentColor", fill="none"  -> each icon inherits the tile's
 *     gold color from CSS; no color is hardcoded
 *   - stroke-width 1.6, round caps/joins
 *
 * They are rendered at 28px in the tile via the wrapper's font-size / width.
 */

const svgProps = {
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.6,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  width: '100%',
  height: '100%',
}

export function SaintIcon() {
  return (
    <svg {...svgProps}>
      <ellipse cx="12" cy="4.5" rx="4" ry="1.75" />
      <circle cx="12" cy="10" r="3" />
      <path d="M6.5 20c.5-3.5 2.4-5.5 5.5-5.5s5 2 5.5 5.5" />
      <path d="M8.5 16.5c1 .8 2.2 1.2 3.5 1.2s2.5-.4 3.5-1.2" />
    </svg>
  )
}

export function BibleIcon() {
  return (
    <svg {...svgProps}>
      <path d="M12 6.5c-1.8-1.4-4.1-2.1-7-2.1v13.2c2.9 0 5.2.7 7 2.1" />
      <path d="M12 6.5c1.8-1.4 4.1-2.1 7-2.1v13.2c-2.9 0-5.2.7-7 2.1" />
      <path d="M12 6.5v13.2" />
      <path d="M15.5 8v5" />
      <path d="M13.7 9.8h3.6" />
    </svg>
  )
}

export function SeekIcon() {
  return (
    <svg {...svgProps}>
      <circle cx="10.5" cy="10.5" r="5.5" />
      <path d="M14.5 14.5 20 20" />
    </svg>
  )
}

export function ExaminationIcon() {
  return (
    <svg {...svgProps}>
      <path d="M12 3v18" />
      <path d="M7 8h10" />
    </svg>
  )
}

export function RosaryIcon() {
  return (
    <svg {...svgProps}>
      <circle cx="12" cy="9" r="5.5" />
      <circle cx="12" cy="3.5" r="0.7" />
      <circle cx="15.9" cy="5.1" r="0.7" />
      <circle cx="17.5" cy="9" r="0.7" />
      <circle cx="15.9" cy="12.9" r="0.7" />
      <circle cx="8.1" cy="12.9" r="0.7" />
      <circle cx="6.5" cy="9" r="0.7" />
      <circle cx="8.1" cy="5.1" r="0.7" />
      <path d="M12 14.5v2" />
      <circle cx="12" cy="17.5" r="0.7" />
      <path d="M12 18.2v3.3" />
      <path d="M10.5 19.5h3" />
    </svg>
  )
}

export function PrayingHandsIcon() {
  return (
    <svg {...svgProps}>
      <path d="M10.5 21v-7.5L8.2 9.2a1.4 1.4 0 0 1 .5-1.9 1.4 1.4 0 0 1 1.9.5L12 10" />
      <path d="M13.5 21v-7.5l2.3-4.3a1.4 1.4 0 0 0-.5-1.9 1.4 1.4 0 0 0-1.9.5L12 10" />
      <path d="M12 10V3" />
      <path d="M10.5 5.5 12 3l1.5 2.5" />
      <path d="M10.5 14.5 12 16l1.5-1.5" />
    </svg>
  )
}
