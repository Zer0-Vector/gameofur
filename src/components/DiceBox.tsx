import React, { useContext } from "react"
import GameController, { GameControllerImpl } from "../model/GameController"
import GameState, { GameStateData } from "../model/GameState"
import TurnPhase from "../constants/TurnPhase"
import Dice, { DiceValues } from "./Dice"
import './DiceBox.css'

export type DiceBoxProps = {
  ownerId: number
}

export default function DiceBox(props: DiceBoxProps) {
  const { ownerId } = props
  const state = useContext<GameStateData>(GameState)
  const controller = useContext<GameControllerImpl>(GameController)

  if (state.currentPlayerId === ownerId) {
    return (
      <div className={`dice-box player${ownerId} full-of-dice`}>
        <button onClick={controller.rollDice} disabled={state.turnPhase !== TurnPhase.PREROLL}>Roll!</button>
        <Dice rollValues={state.diceFaces.map(v => v % 2) as DiceValues} />
        <div className="dice-value">{state.diceFaces.map(v => v % 2).reduce((p, c) => p + c)}</div>
      </div>
    )
  } else {
    return (<div className={`dice-box player${ownerId}`} />)
  }
}