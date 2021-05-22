import { GameAction } from "../../model/game/GameAction";
import { Maybe } from "../../model/utils/types";

export interface EphemeralState {
    nextAction: Maybe<GameAction>;
}