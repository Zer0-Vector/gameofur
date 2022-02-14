import React from 'react'
import SpaceData from '~/model/SpaceData'
import './Board.css'
import Space from './Space'

export type BoardProps = {
  spaces: Map<number, SpaceData>
}

export default function Board(props: BoardProps) {
  const { spaces } = props
  const renderedSpaces: JSX.Element[] = []
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
