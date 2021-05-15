import { EntityId } from "../game/ids/EntityId";
import { PlayerEntity, SpaceEntity } from "../utils/types";
import { Bucket } from "./Bucket";
import { Space } from "./Space";

export class Board {
    spaces: Space[] = this.buildMiddleLane();
    tracks = {
        [EntityId.PLAYER1]: this.buildTrack(EntityId.PLAYER1),
        [EntityId.PLAYER2]: this.buildTrack(EntityId.PLAYER2)
    };
    constructor() {
    }
    private buildMiddleLane() {
        const TrackIdOffset = 5;
        let rval: Space[] = [];
        for (let i = 0; i < 8; i++) {
            let type = EntityId.MIDDLE;
            if (i === 3) {
                type |= EntityId.ROSETTE;
            }
            rval.push(new Space(i, type, i + TrackIdOffset));
        }
        return rval;
    }
    private buildTrack(player: PlayerEntity) {
        let track: Space[] = [];

        let addToBoth = (s:Space) => {
            track.push(s);
            this.spaces.push(s);
        };

        let makePlayerSpace = (type: SpaceEntity, rosette: boolean = false) => {
            let completeType = type | player;
            if (rosette) {
                completeType |= EntityId.ROSETTE;
            }
            if (type === EntityId.START || type === EntityId.FINISH) {
                addToBoth(new Bucket(this.spaces.length, completeType, track.length));
            } else {
                addToBoth(new Space(this.spaces.length, completeType, track.length));
            }
        }
        
        console.debug("Creating track for player "+player);
        makePlayerSpace(EntityId.START);
        for (let i = 0; i < 4; i++) {
            makePlayerSpace(EntityId.ONRAMP, i===3);
        }
        for (let i = 0; i < 8; i++) {
            track.push(this.spaces[i]);
        }
        makePlayerSpace(EntityId.OFFRAMP);
        makePlayerSpace(EntityId.OFFRAMP, true);
        makePlayerSpace(EntityId.FINISH);

        console.debug("Player "+player+" track created:", track);

        return track;
    }
}