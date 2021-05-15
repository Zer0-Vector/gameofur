import { EntityId } from "../game/ids/EntityId";
import { SpaceId } from "../game/ids/SpaceId";

class BoardSkeleton {
    readonly track = {
        [EntityId.PLAYER1]: new Array<SpaceId>(16),
        [EntityId.PLAYER2]: new Array<SpaceId>(16),
    }
    constructor() {
        let i = 0;
        for (; i < 5; i++) {
            this.track[EntityId.PLAYER1][i] = SpaceId.get(EntityId.PLAYER1, i);
            this.track[EntityId.PLAYER2][i] = SpaceId.get(EntityId.PLAYER2, i);
        }
        for (; i < 13; i++) {
            this.track[EntityId.PLAYER1][i] = SpaceId.get(EntityId.MIDDLE, i);
            this.track[EntityId.PLAYER2][i] = SpaceId.get(EntityId.MIDDLE, i);
        }
        for (; i < 16; i++) {
            this.track[EntityId.PLAYER1][i] = SpaceId.get(EntityId.PLAYER1, i);
            this.track[EntityId.PLAYER2][i] = SpaceId.get(EntityId.PLAYER2, i);
        }
    }
}
export const BOARD = new BoardSkeleton();