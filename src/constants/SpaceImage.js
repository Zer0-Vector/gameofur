import React from "react"
import {ReactComponent as Rosette} from '../images/rosette.svg'
import {ReactComponent as FourFiveDots} from '../images/fourfivedots.svg'
import {ReactComponent as BigFiveDots} from '../images/bigfivedots.svg'
import {ReactComponent as SmallFiveDots} from '../images/smallfivedots.svg'
import {ReactComponent as TwelveDots} from '../images/twelvedots.svg'
import {ReactComponent as Eyes0} from '../images/eyes0.svg'
import {ReactComponent as Eyes1} from '../images/eyes1.svg'

export default class SpaceImage {
  static getImage(name, dim) {
    switch (name) {
      case 'rosette':
        return <Rosette className={name} width={dim} height={dim} />
      case 'fourfivedots':
        return <FourFiveDots className={name} width={dim} height={dim} />
      case 'bigfivedots':
        return <BigFiveDots className={name} width={dim} height={dim} />
      case 'smallfivedots':
        return <SmallFiveDots className={name} width={dim} height={dim} />
      case 'twelvedots':
        return <TwelveDots className={name} width={dim} height={dim} />
      case 'eyes0':
        return <Eyes0 className={name} width={dim} height={dim} />
      case 'eyes1':
        return <Eyes1 className={name} width={dim} height={dim} />
    }
  }
}
