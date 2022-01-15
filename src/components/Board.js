import React from 'react'
import './Board.css'
import Space from './Space'
import SpaceImage from '../constants/SpaceImage'
import Column from './Column'

class Board extends React.Component {

  render() {
    return (
      <div className='board'>
        <Column id={0} ownerId={0}>
          <Space image={SpaceImage.rosette} edge='top left' />
          <Space image={SpaceImage.eyes1} edge='left' />
          <Space image={SpaceImage.bigfivedots} edge='left' />
          <Space image={SpaceImage.eyes0} edge='left' />
          <Space gap={true} edge='right top' />
          <Space gap={true} edge='right bottom' />
          <Space image={SpaceImage.rosette} edge='left' />
          <Space image={SpaceImage.smallfivedots} edge='bottom left' />
        </Column>
        <Column id={1}>
          <Space image={SpaceImage.twelvedots} edge='top' />
          <Space image={SpaceImage.bigfivedots} />
          <Space image={SpaceImage.fourfivedots} />
          <Space image={SpaceImage.rosette} />
          <Space image={SpaceImage.bigfivedots} />
          <Space image={SpaceImage.fourfivedots} />
          <Space image={SpaceImage.eyes0} />
          <Space image={SpaceImage.bigfivedots} edge='bottom' />
        </Column>
        <Column id={2} ownerId={1}>
          <Space image={SpaceImage.rosette} edge='top right' />
          <Space image={SpaceImage.eyes1} edge='right' />
          <Space image={SpaceImage.bigfivedots} edge='right' />
          <Space image={SpaceImage.eyes0} edge='right' />
          <Space gap={true} edge='top left' />
          <Space gap={true} edge='bottom left' />
          <Space image={SpaceImage.rosette} edge='right' />
          <Space image={SpaceImage.smallfivedots} edge='bottom right' />
        </Column>
      </div>
    )
  }
}

export default Board
