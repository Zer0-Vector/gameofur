const TurnPhase = {
  PREROLL: 'PREROLL',
  ROLLING: 'ROLLING',
  ROLLED_ZERO: 'ROLLED_ZERO',
  PRESELECT: 'PRESELECT',
  SELECTED: 'SELECTED',
  MOVING: 'MOVING',
  MOVED: 'MOVED', // triggers knockout animations
  END: 'END', // any necessary cleanup, then change currentPlayer and move to PREROLL
}

export default TurnPhase