import React from 'react';
import S from './GamePanel.module.css'
import { PlayerInfoPanel } from './PlayerInfoPanel';

export class GamePanel extends React.Component {
    render() {
        return ( 
            <div id={S.gamePanel}>
                <PlayerInfoPanel id="p1Area" player={1} />
{/* TODO BOARD AREA */}
{/* TODO P2 AREA */}
            </div>
        )
    }
}