import React from "react";
import './Space.css'

export default class Space extends React.Component {

  constructor(props) {
    super(props)
    const { image, columnClass, edgeClass } = this.props
    const styles = [ 'space' ]
  
    if (edgeClass) {
      edgeClass
        .split(' ')
        .map(suffix => 'pos-'+suffix)
        .forEach(className => {
          styles.push(className)
        });
    }
    
    if (columnClass) {
      styles.push(columnClass)
    }
  
    if (image) {
      styles.push(image.className())
    }

    this.styles = styles
  }

  render() {
    return (
      <div className={this.styles.join(' ')}>
        {this.props.occupant}
      </div>
    )
  }
}
