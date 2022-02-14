import React from "react"
import Die, { DieValue } from "./Die"
import './Dice.css'


export type DiceValues = [DieValue, DieValue, DieValue, DieValue]

export type DiceProps = { 
  rollValues: DiceValues
 }

export default function Dice(props: DiceProps) {
  const { rollValues } = props
  const dice = rollValues.map((val: DieValue, index: number) => <Die pipValue={val} key={index} />)

  return (
    <>
      <div className="dice-container">
        {dice}
      </div>
    </>
  )

}