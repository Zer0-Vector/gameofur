import React from "react"
import './PiecesBox.css'

class PiecesBox extends React.Component {
  
  render() {
    const pieces = []
    for (var i = 0; i < 7; i++) {
      pieces.push(<div key={i} className="piece img-piece5" id={"piece"+i} />)
    }
    return (
      <div className="pieces-box">
        {pieces}
      </div>
    )
  }
}

export default PiecesBox