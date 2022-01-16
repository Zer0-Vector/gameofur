import React from "react"
import './Box.css'

class Box extends React.Component {

  constructor(props) {
    super(props)
    this.classNames = ['box', this.props.className]
  }

  render() {
    const classes = this.classNames
        .filter(item => item !== undefined)
        .join(' ')
    return (
      <div className={classes} style={this.props.style}>
        {this.props.children}
      </div>
    )
  }
}

export default Box
