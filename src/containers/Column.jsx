import React from 'react'
import './Column.css'

export default class Column extends React.Component{
  constructor(props) {
    super(props)
  }

  render() {
    return (
      <div className='column'>
        {this.props.children}
      </div>
    )
  }

}
