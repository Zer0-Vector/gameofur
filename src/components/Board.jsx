import React from 'react'
import './Board.css'
import Space from './Space'

export default function Board() {
  return (
    <div className='board'>
      <Space image='rosette' locationClass='r0 c0' />
      <Space image='eyes1' locationClass='r1 c0' />
      <Space image='bigfivedots' locationClass='r2 c0' />
      <Space image='eyes0' locationClass='r3 c0' />
      <div className='cutout-left' />
      <Space image='rosette' locationClass='r6 c0' />
      <Space image='smallfivedots' locationClass='r7 c0' />

      <Space image='twelvedots' locationClass='r0 c1' />
      <Space image='bigfivedots' locationClass='r1 c1' />
      <Space image='fourfivedots' locationClass='r2 c1' />
      <Space image='rosette' locationClass='r3 c1' />
      <Space image='bigfivedots' locationClass='r4 c1' />
      <Space image='fourfivedots' locationClass='r5 c1' />
      <Space image='eyes0' locationClass='r6 c1' />
      <Space image='bigfivedots' locationClass='r7 c1' />

      <Space image='rosette' locationClass='r0 c2' />
      <Space image='eyes1' locationClass='r1 c2' />
      <Space image='bigfivedots' locationClass='r2 c2' />
      <Space image='eyes0' locationClass='r3 c2' />
      <div className='cutout-right' />
      <Space image='rosette' locationClass='r6 c2' />
      <Space image='smallfivedots' locationClass='r7 c2' />
    </div>
  )
}
