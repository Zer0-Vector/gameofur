import React from "react"
import Space from "./Space"

export default class Gap extends Space {

  constructor(props) {
    super(props)
    this.styles = [ ...this.styles, 'gap' ]
  }

}