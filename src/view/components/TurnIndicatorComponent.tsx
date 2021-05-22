import React from "react";
import { TurnController } from "../abstract/TurnController";
import './TurnIndicator.css'


interface TurnIndicatorProps {
    registerTurnController: (turnCtrl:TurnController)=>void;
}

interface TurnIndicatorState {
    turn?: number;
}

export class TurnIndicatorComponent extends React.Component<TurnIndicatorProps, TurnIndicatorState> implements TurnController {
    constructor(props:TurnIndicatorProps) {
        super(props);
        const { registerTurnController } = this.props;
        this.state = {};
        registerTurnController(this);
    }

    public nextTurn() {
        const { turn } = this.state;
        if (!turn) {
            this.setState({turn: 1});
        } else {
            this.setState({turn: turn + 1});
        }
    }

    public get currentTurn(): number | undefined {
        return this.state.turn;
    }

    render() {
        const { turn } = this.state;
        return (
            <div id="turnIndicator">
                {(turn && <h2>Turn {turn}</h2>) || <h2>Game not started</h2>} 
            </div>
        );
    }
}