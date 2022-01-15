import React from 'react'

class ComponentUtils {
  static updateChildren = (children, props) => {
    return React.Children.map(children, (child) => {
      return React.isValidElement(child)
          ? React.cloneElement(child, {...child.props, ...props})
          : child
    })
  }
}

export default ComponentUtils
