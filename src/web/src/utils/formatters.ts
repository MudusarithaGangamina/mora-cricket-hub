// Format overs like cricket does: 23.4 means 23 overs 4 balls
export const formatOvers = (overs: number): string => {
  const fullOvers = Math.floor(overs)
  const balls = Math.round((overs - fullOvers) * 10)
  return balls === 0 ? `${fullOvers}` : `${fullOvers}.${balls}`
}

// Format a score for display e.g. "258/10 (49.4 Ov)"
export const formatScore = (runs: number, wickets: number, overs: number): string =>
  `${runs}/${wickets} (${formatOvers(overs)} Ov)`

// Format batting average — show "—" for not-out with no dismissals
export const formatAverage = (average: number | null): string =>
  average === null ? '—' : average.toFixed(2)

// Format a date to readable string
export const formatMatchDate = (dateStr: string): string => {
  const date = new Date(dateStr)
  return date.toLocaleDateString('en-GB', {
    day: 'numeric', month: 'short', year: 'numeric',
  })
}

// Format run rate to 2 decimal places
export const formatRunRate = (runs: number, overs: number): string => {
  if (overs === 0) return '0.00'
  return (runs / overs).toFixed(2)
}

// Format economy rate
export const formatEconomy = (runs: number, overs: number): string =>
  formatRunRate(runs, overs)

// Format high score with optional not-out asterisk
export const formatHighScore = (score: number, isNotOut: boolean): string =>
  isNotOut ? `${score}*` : `${score}`

// Display match result as a short string
export const formatResult = (
  resultType: string | null,
  resultMargin: number | null,
  resultMarginType: string | null
): string => {
  if (!resultType) return '—'
  if (resultType === 'WIN' && resultMargin && resultMarginType)
    return `Won by ${resultMargin} ${resultMarginType === 'RUNS' ? 'runs' : 'wickets'}`
  if (resultType === 'LOSS' && resultMargin && resultMarginType)
    return `Lost by ${resultMargin} ${resultMarginType === 'RUNS' ? 'runs' : 'wickets'}`
  if (resultType === 'TIE_TOSS') return 'Tie (Toss)'
  if (resultType === 'TIE_BOWL_OUT') return 'Tie (Bowl-out)'
  if (resultType === 'NR') return 'No Result'
  if (resultType === 'ABANDONED') return 'Abandoned'
  return resultType
}