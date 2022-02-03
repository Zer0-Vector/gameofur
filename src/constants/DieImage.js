import React from 'react'
import {ReactComponent as Die0} from '../images/die0.svg'
import {ReactComponent as Die1} from '../images/die1.svg'

export default class DieImage {
  static getImage(pips) {
    switch (pips) {
      case 0:
        return <Die0 className="die0" />
      case 1:
        return <Die1 className="die1" />
    }
  }
}