import React from "react"
import './Column.css'

class Column extends React.Component {
  render() {
    const { children, id} = this.props
    const colClass = 'col' + id
    return (
      <div className={colClass}>
        {children}
      </div>
    )
  }
}

export default Column
