import React from "react";
import './Space.css'

class Space extends React.Component {
  constructor(props) {
    super(props)
    const { image, columnClass, gap, edge } = this.props
    this.styles = [ 'space' ]

    if (edge) {
      edge
        .split(' ')
        .map(suffix => 'pos-'+suffix)
        .forEach(className => {
          this.styles.push(className)
        });
    }
    
    if (columnClass) {
      this.styles.push(columnClass)
    }

    if (image) {
      this.styles.push(image.className())
    }

    if (gap) {
      this.styles.push('gap')
    }
  }
  
  render() {
    return (
      <div className={this.styles.join(' ')} />
    )
  }
}

export default Space
