import React, { useContext } from 'react'
import './Board.css'
import Space from './Space'
import Column from '../containers/Column'
import Box from '../containers/Box'
import GameContext from '../model/GameContext'

function Board() {
  const gameContext = useContext(GameContext)

  const spaces = new Array(3)
  for (var i = 0; i < 3; i++) {
    const index = i;
    spaces[i] = (()=>
      gameContext.spaces
          .filter(item => item.column === index && item.row >= 0)
          .sort((a, b)=> a.row - b.row)
          .map(item => <Space {...item} key={item.coords()} />)
    )()
  }
  spaces[0].splice(4, 0, 
    <Space gap={true} edgeClass='right top' key='gap0' />,
    <Space gap={true} edgeClass='right bottom' key='gap1' />
  )
  spaces[2].splice(4, 0,
    <Space gap={true} edgeClass='top left' key='gap2' />,
    <Space gap={true} edgeClass='bottom left' key='gap3' />
  )

  const wrapWithColumn = (space, index) => <Column key={`col${index}`}>{space}</Column>

  return (
    <Box className='board'>
      {spaces.map(wrapWithColumn)}
    </Box>
  )
}

export default Board
