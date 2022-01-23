import React from "react";
import './Space.css'

function Space({ image, columnClass, gap, edgeClass, occupant }) {
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

  if (gap) {
    styles.push('gap')
  }
  
  return (
    <div className={styles.join(' ')}>
      {occupant}
    </div>
  )
}

export default Space
