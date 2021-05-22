import classNames from 'classnames';
import React from 'react';
import { Board } from '../../model/objects/Board';
import { BoardSpaceComponent, BucketType } from './BoardSpaceComponent';
import './GameBoard.css'

export class GameBoardComponent extends React.Component {
    render() {
        return (
            <div id="board">
                {/* <!-- p1 start/finish --> */}
                <BoardSpaceComponent id="sA0" 
                    className="space bucket startingArea p1 r5 c1" />
                <BoardSpaceComponent id="sA15"
                    className="space bucket finishArea p1 r6 c1" />

                {/* <!-- p2 start/finish -->     */}
                <BoardSpaceComponent id="sB0"
                    className="space bucket startingArea p2 r5 c3" />
                <BoardSpaceComponent id="sB15"
                    className="space bucket finishArea p2 r6 c3" />
                
                {/* <!-- p1 on-ramp --> */}
                <BoardSpaceComponent id="sA4"
                    className="space onboard onramp p1 r1 c1 rosette" />
                <BoardSpaceComponent id="sA3"
                    className="space onboard onramp p1 r2 c1 eyes" />
                <BoardSpaceComponent id="sA2"
                    className="space onboard onramp p1 r3 c1 bigfivedots" />
                <BoardSpaceComponent id="sA1"
                    className="space onboard onramp p1 r4 c1 eyes" />
                
                
                
                {/* <!-- p1 off-ramp --> */}
                <BoardSpaceComponent id="sA14"
                    className="space onboard offramp p1 r7 c1 rosette" />
                <BoardSpaceComponent id="sA13"
                    className="space onboard offramp p1 r8 c1 smallfivedots" />
                
                {/* <!-- middle lane --> */}
                <BoardSpaceComponent id="sM5"
                    className="space onboard middle r1 c2 twelvedots" />
                <BoardSpaceComponent id="sM6"
                    className="space onboard middle r2 c2 bigfivedots" />
                <BoardSpaceComponent id="sM7"
                    className="space onboard middle r3 c2 fourfivedots" />
                <BoardSpaceComponent id="sM8"
                    className="space onboard middle r4 c2 rosette" />
                <BoardSpaceComponent id="sM9"
                    className="space onboard middle r5 c2 bigfivedots" />
                <BoardSpaceComponent id="sM10"
                    className="space onboard middle r6 c2 fourfivedots" />
                <BoardSpaceComponent id="sM11"
                    className="space onboard middle r7 c2 eyes" />
                <BoardSpaceComponent id="sM12"
                    className="space onboard middle r8 c2 bigfivedots" />
                
                {/* <!-- p2 on-ramp --> */}
                <BoardSpaceComponent id="sB4"
                    className="space onboard onramp p2 r1 c3 rosette" />
                <BoardSpaceComponent id="sB3"
                    className="space onboard onramp p2 r2 c3 eyes" />
                <BoardSpaceComponent id="sB2"
                    className="space onboard onramp p2 r3 c3 bigfivedots" />
                <BoardSpaceComponent id="sB1"
                    className="space onboard onramp p2 r4 c3 eyes" />

                {/* <!-- p1 off-ramp --> */}
                <BoardSpaceComponent id="sB14"
                    className="space onboard offramp p2 r7 c3 rosette" />
                <BoardSpaceComponent id="sB13"
                    className="space onboard offramp p2 r8 c3 smallfivedots" />
            </div>
        );
    }
}