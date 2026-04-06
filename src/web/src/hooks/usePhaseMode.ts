import { useState } from 'react'
import type { PhaseMode } from '@/utils/phaseUtils'

export function usePhaseMode(defaultMode: PhaseMode = '3-phase') {
  const [mode, setMode] = useState<PhaseMode>(defaultMode)
  const toggle = () => setMode(m => m === '3-phase' ? '4-phase' : '3-phase')
  return { mode, toggle, setMode }
}