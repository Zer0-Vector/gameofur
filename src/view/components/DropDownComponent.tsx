import React from 'react';
import S from './DropDownComponent.module.css'

interface DropDownComponentProps {
    id: string;
    labelText: string;
}

interface DropDownComponentState {
    disabled: boolean[];
    selected?: number | undefined;
}

export class DropDownComponent extends React.Component<DropDownComponentProps, DropDownComponentState> {
    constructor(props:DropDownComponentProps) {
        super(props);
    }

    private selectionChanged(): void {

    }

    render() {
        return (
            <div className={S.dropDownContainer}>
                <label htmlFor={this.props.id}>{this.props.labelText}</label>
                <select id={this.props.id} onChange={this.selectionChanged}>
                    {this.props.children}
                </select>
            </div>
        );
    }
}