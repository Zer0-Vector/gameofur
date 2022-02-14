import React from "react"
import './PlayerArea.css'
import NameBox from './NameBox'
import PiecesBox from './PiecesBox'
import DiceBox from "./DiceBox"
import PlayerData from "~/model/PlayerData"
import PieceData from "~/model/PieceData"
import SpaceData from "~/model/SpaceData"

export type PlayerAreaProps = { 
  player: PlayerData, 
  pieces: PieceData[], 
  startData: SpaceData, 
  finishData: SpaceData,
}

export default class PlayerArea extends React.Component<PlayerAreaProps> {
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
