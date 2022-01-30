import Box from './Box'
import './Column.css'

export default class Column extends Box {
  constructor(props) {
    super(props)
    this.classNames.push('column')
  }
}
