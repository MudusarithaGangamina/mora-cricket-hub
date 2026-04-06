export type PhaseMode = '3-phase' | '4-phase'

export interface Phase {
  label: string
  startOver: number
  endOver: number
  color: string
}

export const PHASES: Record<PhaseMode, Phase[]> = {
  '3-phase': [
    { label: 'Powerplay',    startOver: 1,  endOver: 10, color: '#4fc3f7' },
    { label: 'Middle Overs', startOver: 11, endOver: 40, color: '#66bb6a' },
    { label: 'Death Overs',  startOver: 41, endOver: 50, color: '#ef5350' },
  ],
  '4-phase': [
    { label: 'Powerplay',    startOver: 1,  endOver: 6,  color: '#4fc3f7' },
    { label: 'Early Middle', startOver: 7,  endOver: 15, color: '#66bb6a' },
    { label: 'Late Middle',  startOver: 16, endOver: 40, color: '#ffa726' },
    { label: 'Death Overs',  startOver: 41, endOver: 50, color: '#ef5350' },
  ],
}

// T20 phases â€” used automatically when tournament format is T20
export const T20_PHASES: Phase[] = [
  { label: 'Powerplay',    startOver: 1,  endOver: 6,  color: '#4fc3f7' },
  { label: 'Middle Overs', startOver: 7,  endOver: 15, color: '#66bb6a' },
  { label: 'Death Overs',  startOver: 16, endOver: 20, color: '#ef5350' },
]

export const getPhaseForOver = (over: number, mode: PhaseMode): Phase =>
  PHASES[mode].find(p => over >= p.startOver && over <= p.endOver) ?? PHASES[mode][0]

// Build query string params to pass phase boundaries to FastAPI
export const phaseParams = (mode: PhaseMode): string =>
  PHASES[mode]
    .map((p, i) => `phase${i + 1}_label=${encodeURIComponent(p.label)}&phase${i + 1}_start=${p.startOver}&phase${i + 1}_end=${p.endOver}`)
    .join('&')