import Box from './Box'
import './Column.css'

class Column extends Box {
  constructor(props) {
    super(props)
    this.classNames.push('column')
  }
}

export default Column
