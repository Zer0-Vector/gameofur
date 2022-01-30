import React from "react"
import { useDrop } from "react-dnd"
import './SpaceDropContainer.css'

export default function SpaceDropContainer({children}) {
  const [{isOver}, drop] = useDrop(() => ({
    accept: 'piece',
    collect: (monitor) => ({
      isOver: !!monitor.isOver()
    })
  }))

  const classes = [ 'space-container' ]
  if (isOver) {
    classes.push('piece-hovering')
  }

  return (
    <div ref={drop} className={classes.join(' ')}>
      {children}
    </div>
  )
}