import React from 'react';
import { Rollable } from '../abstract/Rollable';
import './DiceCupComponent.css'
import { DieComponent } from './DieComponent';

export class DiceCupComponent extends React.Component implements Rollable {
    
    roll(): void {
        throw new Error('Method not implemented.');
    }
    
    public get value(): number | undefined {
        return undefined;
    }

    private renderDice(): JSX.Element[] {
        let items: JSX.Element[] = [];
        for (let i = 0; i < 4; i++) {
            items.push(<DieComponent index={i} key={i} />);
        }
        return items;
    }

    render() {
        return (
            <div id="diceCup">
                {this.renderDice()}
            </div>
        );
    }
}