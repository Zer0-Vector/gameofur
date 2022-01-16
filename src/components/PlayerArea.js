import React from "react"
import './PlayerArea.css'
import NameBox from './NameBox'
import PiecesBox from './PiecesBox'

class PlayerArea extends React.Component {

  render() {
    const { player } = this.props
    return (
      <div className={'player-area ' + player.className()}>
        <NameBox player={player} />
        <PiecesBox />
      </div>
    )
  }
}

export default PlayerArea
