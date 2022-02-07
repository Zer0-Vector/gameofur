import React, { useContext } from 'react'
import GameContext from '../model/GameContext'
import './Board.css'
import Space from './Space'

export default function Board({ spaces }) {

  const renderedSpaces = []
  spaces.forEach((val) => {
    if (val.row < 0) return
    renderedSpaces.push(<Space spaceData={val} key={`space${val.id}`} />)
  })

  return (
    <div className='board'>
      {renderedSpaces}
    </div>
  )
}
