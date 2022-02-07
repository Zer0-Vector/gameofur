import React from "react"
import './PlayerArea.css'
import NameBox from './NameBox'
import PiecesBox from './PiecesBox'
import DiceBox from "./DiceBox"

export default class PlayerArea extends React.Component {

  render() {
    const { player, pieces, startData, finishData } = this.props
    return (
      <div className={'player-area ' + player.className}>
        <NameBox player={player} />
        <div>
          <PiecesBox pieces={pieces} player={player} spaceData={startData} />
          <PiecesBox pieces={pieces} player={player} spaceData={finishData} />
        </div>
        <DiceBox ownerId={player.number}/>
      </div>
    )
  }
}
