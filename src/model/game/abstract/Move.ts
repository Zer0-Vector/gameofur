import { Piece } from "../../objects/Piece";
import { Space } from "../../objects/Space";

export interface Move {
    piece: Piece;
    space: Space;
    id: string; // for scope
}