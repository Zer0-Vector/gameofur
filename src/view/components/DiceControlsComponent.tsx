import React from "react";
import { ButtonComponent } from "./ButtonComponent";
import './DiceControls.css'

export class DiceControlsComponent extends React.Component {
    render() {
        return (
            <div id="diceControls">
                <ButtonComponent id="roll" displayText="&Roll" />
                <ButtonComponent id="pass" displayText="&Pass Turn" />
            </div>
        );
    }
}