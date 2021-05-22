import { Identifier } from "./Identifier";

export interface UrHandlers {
    newGame(): void;
    roll(): void;
    passTurn(): void;
    startGame(): void;
    pieceMoved(piece:Identifier, space:Identifier): void;
    checkboxChanged(name:string, checked:boolean): void;
}
