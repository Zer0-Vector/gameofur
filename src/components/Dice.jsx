import React from "react"
import Die from "./Die"
import './Dice.css'

export default function Dice({ rollValues }) {

  const dice = rollValues.map((val, index) => <Die pipValue={val} key={index} />)

  return (
    <>
      <div className="dice-container">
        {dice}
      </div>
    </>
  )

}