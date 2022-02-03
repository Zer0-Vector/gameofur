import { useCallback } from "react"

export default function Controller(context, setContext) {
  const selectPiece = useCallback((pieceId) => {
    console.log("updating context: selectPiece: ", pieceId)
    setContext({
      ...context,
      pieces: context.pieces.map(p => 
        p.id===pieceId 
        ? {...p, selected: true }
        : {...p, selected: false }),
      selectedPiece: pieceId
    })
  }, [context, setContext])

  const movePiece = useCallback((spaceId) => {
    const pieceId = context.selectedPiece
    console.log("Moving ", pieceId, " to ", spaceId)
    var occupant = null
    const pieces = context.pieces.map(p => {
      if (p.id === pieceId) {
        occupant = { ...p, selected: false, location: spaceId } // deselect on drop
        return occupant
      } else {
        return p;
      }
    })
    if (occupant !== null) {
      setContext({
        ...context,
        pieces: pieces,
        spaces: context.spaces.map(s => (
          s.id === spaceId
          ? { ...s, occupant: occupant }
          : s
        )),
        selectedPiece: null
      })
    } else {
      console.error("Could not find piece to move: pieceId=", pieceId, ", spaceId=", spaceId)
    }
  }, [context, setContext])

  return {
    selectPiece: selectPiece,
    movePiece: movePiece,
  }
}