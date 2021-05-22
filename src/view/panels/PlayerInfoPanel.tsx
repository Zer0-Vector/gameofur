import React from "react";
import classnames from 'classnames'
import S from "./PlayerInfoPanel.module.css";

interface PlayerInfoPanelProps {
    id: string;
    player: number;
}

interface PlayerInfoPanelState {
    score: number;
    playerName?: string;
}

export class PlayerInfoPanel extends React.Component<PlayerInfoPanelProps, PlayerInfoPanelState> {

    constructor(props: PlayerInfoPanelProps) {
        super(props);
        this.setState({score: 0});
    }

    private getPlayerClassName(): string {
        return "p" + this.props.player;
    }

    private getPlayerName(): string {
        return this.state.playerName || "Player "+this.props.player;
    }

    private setPlayerName(): void {
        // TODO popup input dialog
        console.warn("setPlayerName not implemented");
    }

    render() {
        return (
            <div id={this.props.id} className={S.playerArea}>
                <h2 className={classnames(this.getPlayerClassName(), S.scoreboard)}>
                    <span className={S.name} title="Double click to set name." onDoubleClick={this.setPlayerName}>{this.getPlayerName()}</span>:&nbsp;
                    <span className={S.score}>{this.state.score}</span>
                </h2>
            </div>
        );
    }
}
