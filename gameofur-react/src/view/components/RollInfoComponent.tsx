import React from 'react';
import S from './RollInfo.module.css'

interface RollInfoComponentState {
    rollValue: number;
}

export class RollInfoComponent extends React.Component<{}, RollInfoComponentState> {
    constructor(props: {}) {
        super(props);
    }

    render() {
        return (
            <div id="rollInfo"></div>
        );
    }
}