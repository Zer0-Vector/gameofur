enum TurnPhase {
  BEGIN,
  PREROLL,
  ROLLING,
  ROLLED_ZERO,
  PRESELECT,
  SELECTED,
  MOVING,
  MOVED, // triggers knockout animations
  END // any necessary cleanup, then change currentPlayer and move to PREROLL
}

export default TurnPhase