import React, { useContext, useState } from "react"
import TurnPhase from "../constants/TurnPhase"
import { GameController, GameState } from "../model/GameContext"
import Dice from "./Dice"
import './DiceBox.css'

export default function DiceBox({ ownerId }) {
  const state = useContext(GameState)
  const controller = useContext(GameController)

  if (state.currentPlayerId === ownerId) {
    return (
      <div className={`dice-box player${ownerId} full-of-dice`}>
        <button onClick={controller.rollDice} disabled={state.turnPhase !== TurnPhase.PREROLL}>Roll!</button>
        <Dice rollValues={state.diceFaces.map(v => v % 2)} />
        <div className="dice-value">{state.diceFaces.map(v => v % 2).reduce((p, c) => p + c)}</div>
      </div>
    )
  } else {
    return (<div className={`dice-box player${ownerId}`} />)
  }
}