import React from "react"
import DieImage from "../constants/DieImage"
import './Die.css'

export type DieValue = 0|1

export type DieProps = {
  pipValue: DieValue
}

export default function Die(props: DieProps) {
  const { pipValue } = props
  return (
    <div className="die-container">
      {DieImage.getImage(pipValue)}
    </div>
  )

}