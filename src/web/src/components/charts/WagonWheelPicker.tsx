import { DirectionZone } from '@/types/enums'

interface Props {
  selected: DirectionZone | null
  onChange: (zone: DirectionZone | null) => void
  isLHB?: boolean
  disabled?: boolean
}

const CX = 160
const CY = 160
const INNER_R   = 35   // stumps area
const CIRCLE_30 = 95   // 30-yard circle
const OUTER_R   = 148  // boundary

// Zone definitions for RHB
// startDeg and endDeg are clockwise from top (12 o'clock = 0°)
// Straight is at top (0°), fine leg is bottom-right, third man bottom-left
const RHB_ZONES: {
  zone: DirectionZone
  label: string
  shortLabel: string
  startDeg: number
  endDeg: number
  inColor: string   // inside 30-yard circle
  outColor: string  // outside 30-yard circle
}[] = [
  {
    zone: DirectionZone.FINE_LEG,
    label: 'Fine Leg', shortLabel: 'FL',
    startDeg: 148, endDeg: 192,
    inColor: '#1e3a5f', outColor: '#172b46',
  },
  {
    zone: DirectionZone.SQUARE_LEG,
    label: 'Square Leg', shortLabel: 'SqL',
    startDeg: 105, endDeg: 148,
    inColor: '#1d4ed8', outColor: '#1e3a8a',
  },
  {
    zone: DirectionZone.MIDWICKET,
    label: 'Midwicket', shortLabel: 'MW',
    startDeg: 58, endDeg: 105,
    inColor: '#2563eb', outColor: '#1d4ed8',
  },
  {
    zone: DirectionZone.MID_ON,
    label: 'Mid On', shortLabel: 'MOn',
    startDeg: 18, endDeg: 58,
    inColor: '#3b82f6', outColor: '#2563eb',
  },
  {
    zone: DirectionZone.STRAIGHT,
    label: 'Straight', shortLabel: 'Str',
    startDeg: 342, endDeg: 18,
    inColor: '#60a5fa', outColor: '#3b82f6',
  },
  {
    zone: DirectionZone.MID_OFF,
    label: 'Mid Off', shortLabel: 'MOff',
    startDeg: 302, endDeg: 342,
    inColor: '#3b82f6', outColor: '#2563eb',
  },
  {
    zone: DirectionZone.COVER,
    label: 'Cover', shortLabel: 'Cov',
    startDeg: 255, endDeg: 302,
    inColor: '#2563eb', outColor: '#1d4ed8',
  },
  {
    zone: DirectionZone.POINT,
    label: 'Point', shortLabel: 'Pt',
    startDeg: 212, endDeg: 255,
    inColor: '#1d4ed8', outColor: '#1e3a8a',
  },
  {
    zone: DirectionZone.THIRD_MAN,
    label: 'Third Man', shortLabel: 'TM',
    startDeg: 192, endDeg: 212,
    inColor: '#1e3a5f', outColor: '#172b46',
  },
]

function polarToXY(
  cx: number, cy: number, r: number, angleDeg: number
): { x: number; y: number } {
  const rad = ((angleDeg - 90) * Math.PI) / 180
  return {
    x: cx + r * Math.cos(rad),
    y: cy + r * Math.sin(rad),
  }
}

// Build an arc path between two radii across an angle range
function buildArcPath(
  cx: number, cy: number,
  r1: number, r2: number,
  startDeg: number, endDeg: number
): string {
  // Normalise wrap-around (e.g. 342→18 becomes 342→378)
  const endAdj = endDeg <= startDeg ? endDeg + 360 : endDeg
  const large  = endAdj - startDeg > 180 ? 1 : 0

  const p1 = polarToXY(cx, cy, r2, startDeg)
  const p2 = polarToXY(cx, cy, r2, endAdj)
  const p3 = polarToXY(cx, cy, r1, endAdj)
  const p4 = polarToXY(cx, cy, r1, startDeg)

  return [
    `M ${p1.x} ${p1.y}`,
    `A ${r2} ${r2} 0 ${large} 1 ${p2.x} ${p2.y}`,
    `L ${p3.x} ${p3.y}`,
    `A ${r1} ${r1} 0 ${large} 0 ${p4.x} ${p4.y}`,
    'Z',
  ].join(' ')
}

function midAngle(startDeg: number, endDeg: number): number {
  const endAdj = endDeg <= startDeg ? endDeg + 360 : endDeg
  return startDeg + (endAdj - startDeg) / 2
}

// Mirror RHB zone → LHB zone (swap off and leg side)
function mirrorZone(zone: DirectionZone): DirectionZone {
  const mirror: Partial<Record<DirectionZone, DirectionZone>> = {
    [DirectionZone.FINE_LEG]:   DirectionZone.THIRD_MAN,
    [DirectionZone.THIRD_MAN]:  DirectionZone.FINE_LEG,
    [DirectionZone.SQUARE_LEG]: DirectionZone.POINT,
    [DirectionZone.POINT]:      DirectionZone.SQUARE_LEG,
    [DirectionZone.MIDWICKET]:  DirectionZone.COVER,
    [DirectionZone.COVER]:      DirectionZone.MIDWICKET,
    [DirectionZone.MID_ON]:     DirectionZone.MID_OFF,
    [DirectionZone.MID_OFF]:    DirectionZone.MID_ON,
    [DirectionZone.STRAIGHT]:   DirectionZone.STRAIGHT,
    [DirectionZone.OTHER]:      DirectionZone.OTHER,
  }
  return mirror[zone] ?? zone
}

export function WagonWheelPicker({
  selected, onChange, isLHB = false, disabled = false
}: Props) {
  const SIZE = CX * 2  // 320

  const handleClick = (rhbZone: DirectionZone) => {
    if (disabled) return
    // For LHB, the visual zone maps to the mirrored actual zone
    const actualZone = isLHB ? mirrorZone(rhbZone) : rhbZone
    onChange(selected === actualZone ? null : actualZone)
  }

  // Map selected zone back to which visual segment to highlight
  const visualSelected = isLHB && selected ? mirrorZone(selected) : selected

  return (
    <div className="flex flex-col items-center gap-3">
      <p className="text-xs text-slate-500">
        {isLHB ? '← LHB — leg side right' : 'RHB — leg side left →'}
        {disabled ? ' · Read only' : ' · Click to select'}
      </p>

      <svg
        viewBox={`0 0 ${SIZE} ${SIZE}`}
        className="w-64 h-64"
        style={{ cursor: disabled ? 'default' : 'pointer' }}
      >
        {/* ── Outer boundary oval (slightly elliptical) ── */}
        <ellipse
          cx={CX} cy={CY}
          rx={OUTER_R + 6} ry={OUTER_R + 4}
          fill="none" stroke="#334155" strokeWidth="1.5"
        />

        {/* ── Zone segments — outer (beyond 30 yards) ── */}
        {RHB_ZONES.map(z => {
          const isSelected = visualSelected === z.zone
          return (
            <path
              key={`out-${z.zone}`}
              d={buildArcPath(CX, CY, CIRCLE_30, OUTER_R, z.startDeg, z.endDeg)}
              fill={isSelected ? '#1d4ed8' : z.outColor}
              opacity={isSelected ? 0.95 : 0.28}
              stroke="#0f172a"
              strokeWidth="1"
              onClick={() => handleClick(z.zone)}
              className="transition-opacity hover:opacity-60"
            />
          )
        })}

        {/* ── Zone segments — inner (inside 30 yards) ── */}
        {RHB_ZONES.map(z => {
          const isSelected = visualSelected === z.zone
          return (
            <path
              key={`in-${z.zone}`}
              d={buildArcPath(CX, CY, INNER_R, CIRCLE_30, z.startDeg, z.endDeg)}
              fill={isSelected ? '#2563eb' : z.inColor}
              opacity={isSelected ? 0.95 : 0.38}
              stroke="#0f172a"
              strokeWidth="0.8"
              onClick={() => handleClick(z.zone)}
              className="transition-opacity hover:opacity-60"
            />
          )
        })}

        {/* ── 30-yard circle ── */}
        <circle
          cx={CX} cy={CY} r={CIRCLE_30}
          fill="none"
          stroke="#94a3b8"
          strokeWidth="1.2"
          strokeDasharray="6 4"
          opacity={0.6}
          pointerEvents="none"
        />

        {/* ── Labels — outer zones ── */}
        {RHB_ZONES.map(z => {
          const mid = midAngle(z.startDeg, z.endDeg)
          const pos = polarToXY(CX, CY, (CIRCLE_30 + OUTER_R) / 2, mid)
          const isSelected = visualSelected === z.zone
          return (
            <text
              key={`lbl-out-${z.zone}`}
              x={pos.x} y={pos.y}
              textAnchor="middle" dominantBaseline="middle"
              fill={isSelected ? '#fff' : '#94a3b8'}
              fontSize={isSelected ? 9 : 8}
              fontWeight={isSelected ? 'bold' : 'normal'}
              pointerEvents="none"
            >
              {z.label}
            </text>
          )
        })}

        {/* ── Labels — inner zones (short labels) ── */}
        {RHB_ZONES.map(z => {
          const mid = midAngle(z.startDeg, z.endDeg)
          const pos = polarToXY(CX, CY, (INNER_R + CIRCLE_30) / 2, mid)
          const isSelected = visualSelected === z.zone
          return (
            <text
              key={`lbl-in-${z.zone}`}
              x={pos.x} y={pos.y}
              textAnchor="middle" dominantBaseline="middle"
              fill={isSelected ? '#dbeafe' : '#64748b'}
              fontSize={7}
              fontWeight={isSelected ? 'bold' : 'normal'}
              pointerEvents="none"
            >
              {z.shortLabel}
            </text>
          )
        })}

        {/* ── 30-yard label ── */}
        <text
          x={CX + CIRCLE_30 + 4} y={CY - 4}
          fill="#64748b" fontSize={7} pointerEvents="none"
        >
          30 yds
        </text>

        {/* ── Pitch rectangle ── */}
        <rect
          x={CX - 7} y={CY - 28}
          width={14} height={56}
          fill="#78716c" rx={2}
          opacity={0.5}
          pointerEvents="none"
        />

        {/* ── Crease lines ── */}
        <line
          x1={CX - 10} y1={CY - 16}
          x2={CX + 10} y2={CY - 16}
          stroke="#d4d0ca" strokeWidth="1" opacity={0.6}
        />
        <line
          x1={CX - 10} y1={CY + 16}
          x2={CX + 10} y2={CY + 16}
          stroke="#d4d0ca" strokeWidth="1" opacity={0.6}
        />

        {/* ── Stumps (3 lines) ── */}
        {[-3, 0, 3].map(offset => (
          <line
            key={offset}
            x1={CX + offset} y1={CY - 12}
            x2={CX + offset} y2={CY + 12}
            stroke="#f59e0b" strokeWidth="1.5" opacity={0.8}
          />
        ))}

        {/* ── Stumps bails ── */}
        <line
          x1={CX - 4} y1={CY - 12}
          x2={CX + 4} y2={CY - 12}
          stroke="#f59e0b" strokeWidth="1.5" opacity={0.8}
        />
        <line
          x1={CX - 4} y1={CY + 12}
          x2={CX + 4} y2={CY + 12}
          stroke="#f59e0b" strokeWidth="1.5" opacity={0.8}
        />

        {/* ── Inner circle fill (stumps area) ── */}
        <circle
          cx={CX} cy={CY} r={INNER_R}
          fill="#1e293b" stroke="#334155" strokeWidth="1"
          pointerEvents="none"
        />

        {/* ── Bowler direction indicator ── */}
        <text
          x={CX} y={12}
          textAnchor="middle" fill="#475569" fontSize={8}
          pointerEvents="none"
        >
          ▲ Bowler end
        </text>

        {/* ── LHB/RHB indicator ── */}
        <text
          x={CX} y={SIZE - 8}
          textAnchor="middle" fill="#475569" fontSize={7}
          pointerEvents="none"
        >
          {isLHB ? 'LHB — off side ↓ right' : 'RHB — off side ↓ left'}
        </text>
      </svg>

      {/* Selected zone display */}
      {selected && !disabled && (
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-blue-400">
            ✓ {selected.replace(/_/g, ' ')}
          </span>
          <button
            type="button"
            onClick={() => onChange(null)}
            className="text-xs text-slate-500 hover:text-slate-300 transition-colors"
          >
            ✕ clear
          </button>
        </div>
      )}
    </div>
  )
}