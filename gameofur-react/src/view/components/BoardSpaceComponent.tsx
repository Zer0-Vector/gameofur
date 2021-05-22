import classnames from 'classnames';
import React from 'react';
import S from './BoardSpaceComponent.module.css'

export enum BucketType {
    START,
    FINISH,
    SPACE
}

interface BoardSpaceComponentProps {
    id: string;
}

interface BoardSpaceComponentState {
    // TODO occupied
}

type BoardSpaceComponentVarProps = BoardSpaceComponentProps & React.HTMLAttributes<{}>

export class BoardSpaceComponent extends React.Component<BoardSpaceComponentVarProps, BoardSpaceComponentState> {

    private classes: string[] = [];

    constructor(props:BoardSpaceComponentProps) {
        super(props);
    }

    render() {
        const { id, ...rest } = this.props;
        return (
            <div id={id} { ...rest }></div>
        );
    }
}