export interface LivePitchState {
  // Mora batting
  strikerId:         string
  nonStrikerId:      string
  // Opponent batting  
  oppStrikerName:    string
  oppStrikerStyle:   string
  oppNonStrikerName: string
  // Bowler
  moraBowlerId:      string
  oppBowlerName:     string
  oppBowlerStyle:    string
}

export const EMPTY_LIVE_PITCH: LivePitchState = {
  strikerId:         '',
  nonStrikerId:      '',
  oppStrikerName:    '',
  oppStrikerStyle:   '',
  oppNonStrikerName: '',
  moraBowlerId:      '',
  oppBowlerName:     '',
  oppBowlerStyle:    '',
}