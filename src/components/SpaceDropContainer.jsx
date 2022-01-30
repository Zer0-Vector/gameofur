import React from "react"
import './SpaceDropContainer.css'

export default function SpaceDropContainer({children}) {

  const classes = [ 'space-container' ]

  return (
    <div className={classes.join(' ')}>
      {children}
    </div>
  )
}