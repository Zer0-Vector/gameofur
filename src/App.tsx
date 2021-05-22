import React from 'react';
import './App.css';
import { GameOfUrController } from './controller/GameOfUrController';
import { InputPanel } from './view/panels/InputPanel';
import { TitlePanel } from './view/panels/TitlePanel';


export class App extends React.Component {
  private controller: GameOfUrController;

  constructor(props:{}) {
    super(props);
    this.controller = new GameOfUrController();
  }

  render() {
    return (
      <div className="PageContainer">
        <div className="AppContainer">
          <TitlePanel />
          <InputPanel controller={this.controller} />
        </div>
      </div>
    );
  }
}

export default App;
