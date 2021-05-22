import React from 'react';
import LabelHtmlUtil from '../utils/LabelHtmlUtil';
import S from './CheckBoxComponent.module.css'

interface CheckBoxComponentProps {
    label: string;
    id: string;
    enabled?: boolean;
}

interface CheckBoxComponentState {
    selected: boolean;
}

export class CheckBoxComponent extends React.Component<CheckBoxComponentProps, CheckBoxComponentState> {

    private displayLabelText;

    constructor(props: CheckBoxComponentProps) {
        super(props);
        this.displayLabelText = LabelHtmlUtil.applyUnderline(props.label);
        this.state = {selected: false};

        this.valueChanged = this.valueChanged.bind(this);
    }

    private valueChanged(): void {
        this.setState({
            selected: !this.state.selected
        });
    }

    private getLabelClasses(): string {
        if (this.state.selected) {
            return S.selected;
        } else {
            return "";
        }
    }

    render() {
        return (
            <div className={S.container}>
                {/* FIXME add change state handler */}
                <input type="checkbox" id={this.props.id} onChange={this.valueChanged} checked={this.state.selected} />
                <label htmlFor={this.props.id} className={this.getLabelClasses()}>{this.displayLabelText}</label>
            </div>
        );
    }
}