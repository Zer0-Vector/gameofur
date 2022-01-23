import React from "react"
import './PiecesBox.css'
import Box from "../containers/Box"
import Piece from "./Piece"


function PiecesBox({ pieces }) {
    return (
      <Box className="pieces-box">
        {pieces.map((pieceData) => <Piece pieceData={pieceData} key={pieceData.className} />)}
      </Box>
    )
}

export default PiecesBox
