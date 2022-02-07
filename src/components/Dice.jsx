import React from "react"
import Die from "./Die"
import './Dice.css'

export default function Dice({ rollValues, rollTotal }) {

  const dice = rollValues.map((val, index) => <Die pipValue={val} key={index} />)

  return (
    <>
      <div className="dice-container">
        {dice}
      </div>
      <div className="dice-value">{rollTotal}</div>
    </>
  )

}