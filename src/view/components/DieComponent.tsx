import React from "react";
import { Rollable } from "../abstract/Rollable";
import "./DieComponent.css"
import { ReactComponent as Die0 } from '../../images/die0.svg'
import { ReactComponent as Die1 } from '../../images/die1.svg'

interface DieComponentProps {
    index: number;
}

interface DieComponentState {
    value: 0 | 1;
}

export class DieComponent extends React.Component<DieComponentProps, DieComponentState> implements Rollable {
    constructor(props:DieComponentProps) {
        super(props);
        this.state = {value: 0}
    }

    public get value() {
        return this.state.value;
    }

    public roll(): void {
        throw new Error('Method not implemented.');
    }

    private dieImage() {
        const { value } = this.state;
        if (value === 0) {
            return <Die0 />;
        } else {
            return <Die1 />;
        }
    }

    render() {
        return (
            <div className="dieHolder">
                <div id={"die" + this.props.index}>
                    {this.dieImage()}
                </div>
            </div>
        );
    }
}