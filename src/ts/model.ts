import {EntityMask, TurnPhase, UrUtils, PlayerMask} from './utils.js';


export class TurnData {
    phase: TurnPhase;
    rollValue: number;
    player: PlayerMask;
    rosette: boolean;
    startSpace?: string;
    endSpace?: string;

    protected constructor(player: PlayerMask) {
        this.phase = TurnPhase.ROLL;
        this.rollValue = -1;
        this.player = player;
        this.rosette = false;
        this.startSpace = undefined;
        this.endSpace = undefined;
    }

    static create(player:PlayerMask = EntityMask.PLAYER1): TurnData {
        return new TurnData(player);
    }
}

export class TurnTaken extends TurnData { // TODO for tracking history
    public knockoff: boolean;
    constructor(player: PlayerMask) {
        super(player);
        this.knockoff = false;
    }
    validate() {
        console.assert(this.rollValue >= 0 && this.rollValue <= 4, "Invalid roll value: ",this.rollValue);
        // roll is zero iff start & end spaces are both null
        console.assert((this.rollValue === 0) === ((this.startSpace == null) === (this.endSpace == null)), "Invalid start/end space given roll value: roll=",this.rollValue,", start=",this.startSpace,", end=",this.endSpace);
        var rosettes = ["a1", "b1", "m4", "a7", "b7"];
        console.assert(this.rosette === rosettes.includes(this.endSpace!), "Invalid endSpace given rosette==true: ",this.endSpace);
        console.assert(this.knockoff !== this.startSpace?.endsWith('Start'), "Invalid startSpace given knockoff==true: ", this.startSpace);
        // TODO validate impossible knockoffs near off ramp
        // TODO validate impossible knockoffs near on ramp
    }
}
type DieValue =  0 | 1;
type DiceValue = 0 | 1 | 2 | 3 | 4;
type DiceList = [DieValue, DieValue, DieValue, DieValue];
export class Dice {
    values: DiceList;
    rolled: boolean = false;

    constructor() {
        this.values = this.diceRoll();
    }

    get total(): DiceValue {
        if (this.values === null) {
            throw "Dice not initialized";
        }
        return (this.values[0] + this.values[1] + this.values[2] + this.values[3]) as DiceValue;
    }

    private dieRoll(): DieValue {
        return Math.floor(Math.random() * 2) as DieValue;
    }

    private diceRoll(): DiceList {
        try {
            return [ this.dieRoll(), this.dieRoll(), this.dieRoll(), this.dieRoll() ];
        } finally {
            this.rolled = true;
        }
    }

    roll() {
        this.values = this.diceRoll();
        return this.total;
    }
}

export class Space {
    id: number;
    type: EntityMask;
    constructor(id: number, type: EntityMask) {
        this.id = id;
        UrUtils.isValidSpace(type);
        this.type = type;
    }
}

export class Piece {
    id: string;
    owner: PlayerMask;
    location: string;
    constructor(id: string, owner: PlayerMask, location: string) {
        this.id = id;
        if (!UrUtils.isPlayer(owner)) {
            throw "Invalid player id: "+owner;
        }
        this.owner = owner;
        this.location = location;
    }
}

export class Player {
    name: string;
    mask: PlayerMask;
    id: string;
    private _pieces: Map<string, Piece>;
    constructor(name: string, mask: PlayerMask, id:string) {
        this.name = name;
        if (!UrUtils.isPlayer(mask)) {
            throw "Invalid player mask: "+mask;
        }
        this.mask = mask;
        this.id = id;
        this._pieces = this.buildPieces();
    }
    get pieces() {
        return this._pieces.values();
    }
    buildPieces() {
        let pcs = new Map<string, Piece>();
        for (let i = 0; i < 7; i++) {
            var pcid = UrUtils.PIECE_ID_PREFIX+this.id+i;
            pcs.set(pcid, new Piece(pcid, this.mask, this.id+"Start"));
        }
        return pcs;
    }
}

export class Board {
    spaces: Space[];
    p1track: Space[];
    p2track: Space[];
    constructor() {
        this.spaces = [];
        this.addMiddleLane();
        this.p1track = this.buildTrack(EntityMask.PLAYER1);
        this.p2track = this.buildTrack(EntityMask.PLAYER2);
    }
    addMiddleLane() {
        for (let i = 0; i < 8; i++) {
            let type = EntityMask.MIDDLE;
            if (i === 3) {
                type |= EntityMask.ROSETTE;
            }
            this.spaces.push(new Space(i, type));
        }
    }
    buildTrack(player: PlayerMask) {
        let track = [];
        for (let i = 0; i < 4; i++) {
            let type = player | EntityMask.ONRAMP;
            if (i === 3) {
                type |= EntityMask.ROSETTE;
            }
            let space = new Space(this.spaces.length, type);
            track.push(space);
            this.spaces.push(space);
        }
        for (let i = 0; i < 8; i++) {
            track.push(this.spaces[i]);
        }
        let penultimate = new Space(this.spaces.length, EntityMask.OFFRAMP | player);
        track.push(penultimate);
        this.spaces.push(penultimate);
        let lastOne = new Space(this.spaces.length, EntityMask.OFFRAMP | EntityMask.ROSETTE | player);
        track.push(lastOne);
        this.spaces.push(lastOne);
        return track;
    }
}

namespace UrModel {
    export const board = new Board();
    export const player1 =  new Player("Player 1", EntityMask.PLAYER1, "a");
    export const player2 = new Player("Player 2", EntityMask.PLAYER2, "b");
    export const players = {
        [EntityMask.PLAYER1]: player1,
        [EntityMask.PLAYER2]: player2
    };
    export const dice = new Dice();
    export let turn = TurnData.create();
    export let history: TurnTaken[] = []; // TODO
}

export let MODEL = UrModel;
