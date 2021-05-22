import React from "react";
import { ButtonComponent } from "../components/ButtonComponent";
import { CheckBoxComponent } from "../components/CheckBoxComponent";
import "./TitlePanel.css"

export class TitlePanel extends React.Component {
    render() {
        return (
            <div id="titlePanel">
                <div className="headerSection">
                    <h1 className="title">Royal Game of Ur</h1>
                    <div className="columns"> 
                        <div className="column">
                            <div className="inputRow">
                                <ButtonComponent displayText="&New Game" id="newgame" />
                                <ButtonComponent displayText="&Start Game" id="starter" />
                            </div>
                        </div>
                        <div className="column">
                            <div className="optionsLabel">Options: </div>
                            <div className="inputRow">
                                <CheckBoxComponent label="Auto &Roll" id="chxAutoRoll" />
                                <CheckBoxComponent label="Auto &Pass" id="chxAutoPass" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}