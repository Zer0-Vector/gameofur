import React from "react"
import DieImage from "../constants/DieImage"
import './Die.css'

export default function Die({ pipValue }) {

  return (
    <div className="die-container">
      {DieImage.getImage(pipValue)}
    </div>
  )

}