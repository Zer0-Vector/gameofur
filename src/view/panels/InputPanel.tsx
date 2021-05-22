import React from 'react'
import { GameOfUrController } from '../../controller/GameOfUrController';
import { DiceControlsComponent } from '../components/DiceControlsComponent';
import { DiceCupComponent } from '../components/DiceCupComponent';
import { TurnIndicatorComponent } from '../components/TurnIndicatorComponent'
import './InputPanel.css'

interface InputPanelProps {
    controller: GameOfUrController;
}

export class InputPanel extends React.Component<InputPanelProps> {

    render() {
        const { controller } = this.props;
        return (
            <div id="inputPanel">
                <TurnIndicatorComponent registerTurnController={controller.registerTurnController} />
                <div id="dicePanel">
                    <DiceCupComponent />
                    <DiceControlsComponent />
                </div>
            </div>
        );
    }
}