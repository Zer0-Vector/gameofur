import React from 'react';
import LabelHtmlUtil from '../utils/LabelHtmlUtil'

type ButtonComponentProps = {
    displayText: string;
    disabled?: boolean;
    id: string;
} & typeof ButtonComponent.defaultProps;

export class ButtonComponent extends React.Component<ButtonComponentProps> {

    private _labelHtml;

    constructor(props:ButtonComponentProps) {
        super(props);
        // TODO assign ALT+extracted letter with jQuery
        this._labelHtml = LabelHtmlUtil.applyUnderline(this.props.displayText);
    }

    static defaultProps = {
        disabled: false
    }

    render() {
        return (
            <button type="button" id={this.props.id} disabled={this.props.disabled}>
                {this._labelHtml}
            </button>
        );
    }
}