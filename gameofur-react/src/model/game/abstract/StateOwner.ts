import { GameState } from "../GameState";
import { AStateOwner } from "./AStateOwner";

export interface StateOwner extends AStateOwner<GameState> {
    state: GameState;
}