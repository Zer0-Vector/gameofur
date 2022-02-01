import React from "react"
import './PlayerArea.css'
import NameBox from './NameBox'
import PiecesBox from './PiecesBox'

export default class PlayerArea extends React.Component {

  render() {
    const { player, pieces } = this.props
    return (
      <div className={'player-area ' + player.className}>
        <NameBox player={player} />
        <PiecesBox pieces={pieces} player={player} />
      </div>
    )
  }
}
