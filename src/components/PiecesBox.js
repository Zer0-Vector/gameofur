import React from "react"
import './PiecesBox.css'
import {ReactComponent as ReactPiece} from '../images/piece5.svg'

class PiecesBox extends React.Component {
  
  render() {
    const { pieces } = this.props
    return (
      <div className="pieces-box">
        {pieces.map((pieceData) => (
            <div 
                key={pieceData.className()}
                className={['piece', pieceData.className(), pieceData.player.className()].join(' ')}
            >
              <ReactPiece />
            </div>
          )
        )}
      </div>
    )
  }
}

export default PiecesBox
