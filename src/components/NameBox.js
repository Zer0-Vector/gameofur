import React from "react"
import './NameBox.css'

export default class NameBox extends React.Component {

  render() {
    const { player } = this.props
    return (
      <div className='name-box'>
        <div className='avatar-container'>
          <img
            src={"https://robohash.org/" + player.avatarId() + ".png?bgset=bg2&set=set1"}
            className="avatar"
            alt={player.name + " Avatar"}
            title={player.name + " Avatar"}
          />
        </div>
        <h2>{player.name}</h2>
      </div>
    )
  }
}
