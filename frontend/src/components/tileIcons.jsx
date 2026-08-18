/*
 * Icons for the home grid tiles.
 *
 * Three of the six are custom SVGs (SaintIcon, PrayingHandsIcon,
 * RosaryIcon) because Lucide has no good equivalent. The other three come
 * straight from lucide-react. All are drawn / configured to the SAME
 * visual spec so they read as one set:
 *
 *   - 24x24 viewBox
 *   - stroke, no fill
 *   - stroke="currentColor" so each icon inherits the tile's gold color
 *     from CSS (no color is hardcoded here)
 *   - strokeWidth 1.6, round caps/joins, matching Lucide's line weight
 *
 * The custom icons deliberately stay simple line-work. Praying hands in
 * particular is a hard shape in a few strokes; this is a clean, readable
 * gesture rather than an anatomically literal drawing.
 */

import { BookOpen, Search, Cross } from 'lucide-react'

const STROKE = 1.6

// Common props so custom icons match Lucide's defaults exactly.
const base = {
  width: 24,
  height: 24,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: STROKE,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
}

// Haloed saint: a head-and-shoulders figure with a halo arc above.
export function SaintIcon() {
  return (
    <svg {...base}>
      {/* halo */}
      <ellipse cx="12" cy="5.5" rx="4.5" ry="1.6" />
      {/* head */}
      <circle cx="12" cy="9.5" r="3" />
      {/* shoulders */}
      <path d="M5.5 20c0-3.6 2.9-6 6.5-6s6.5 2.4 6.5 6" />
    </svg>
  )
}

// Praying hands: two mirrored strokes meeting at the fingertips, with a
// short cuff at the base. Kept minimal and symmetric so it reads clearly.
export function PrayingHandsIcon() {
  return (
    <svg {...base}>
      {/* left hand */}
      <path d="M12 3.5c-1.4 1.6-3.4 4.2-4.4 6.4-.8 1.8-1 3.6-1 5.1 0 1.2.3 2.3.9 3.2l4.5-2.1" />
      {/* right hand (mirror) */}
      <path d="M12 3.5c1.4 1.6 3.4 4.2 4.4 6.4.8 1.8 1 3.6 1 5.1 0 1.2-.3 2.3-.9 3.2L12 16.1" />
      {/* center seam */}
      <path d="M12 3.5v12.6" />
      {/* cuffs */}
      <path d="M7.5 18.9l2.4 1.6M16.5 18.9l-2.4 1.6" />
    </svg>
  )
}

// Rosary: a loop of beads (dots around an ellipse) with a short pendant
// and a cross at the bottom.
export function RosaryIcon() {
  return (
    <svg {...base}>
      {/* the loop */}
      <ellipse cx="12" cy="9.5" rx="6" ry="5.5" />
      {/* a few beads suggested as dots on the loop */}
      <circle cx="12" cy="4" r="0.5" />
      <circle cx="17.4" cy="8" r="0.5" />
      <circle cx="15.6" cy="13.5" r="0.5" />
      <circle cx="8.4" cy="13.5" r="0.5" />
      <circle cx="6.6" cy="8" r="0.5" />
      {/* pendant chain down to the cross */}
      <path d="M12 15v3" />
      {/* cross */}
      <path d="M12 18v3.5M10.4 19.6h3.2" />
    </svg>
  )
}

// Lucide icons for the three that have clean equivalents. Sized and
// weighted to match the custom set.
export function BibleIcon() {
  return <BookOpen size={24} strokeWidth={STROKE} />
}

export function SeekIcon() {
  return <Search size={24} strokeWidth={STROKE} />
}

export function ExaminationIcon() {
  return <Cross size={24} strokeWidth={STROKE} />
}
