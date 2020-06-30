import {EntityId, GameState, UrUtils, PlayerEntity, SpaceEntity, PLAYER_MASK, SPACE_MASK, DiceList, DiceValue, DieValue, Identifiable, PieceId, SpaceId} from './utils.js';

export class TurnData {
    private static COUNTER = 1;
    rollValue: DiceValue | null = null;
    player: PlayerEntity;
    rosette: boolean = false;
    knockout: boolean = false;
    scored: boolean = false;
    piece?: Piece = undefined;
    startSpace?: Space = undefined;
    endSpace?: Space = undefined;
    number: number = TurnData.COUNTER++;
    knockedPiece?: Piece = undefined;
    noLegalMoves: boolean = false;

    protected constructor(player: PlayerEntity) {
        this.player = player;
    }

    static create(player:PlayerEntity = EntityId.PLAYER1): TurnData {
        return new TurnData(player);
    }
}

// class TurnTaken extends TurnData { // TODO for tracking history
//     public knockoff: boolean;
//     constructor(player: PlayerEntity) {
//         super(player);
//         this.knockoff = false;
//     }
//     validate() {
//         console.assert(this.rollValue >= 0 && this.rollValue <= 4, "Invalid roll value: ",this.rollValue);
//         // roll is zero iff start & end spaces are both null
//         console.assert((this.rollValue === 0) === ((this.startSpace == null) === (this.endSpace == null)), "Invalid start/end space given roll value: roll=",this.rollValue,", start=",this.startSpace,", end=",this.endSpace);
//         var rosettes = ["a1", "b1", "m4", "a7", "b7"];
//         console.assert(this.rosette === rosettes.includes(this.endSpace!), "Invalid endSpace given rosette==true: ",this.endSpace);
//         console.assert(this.knockoff !== this.startSpace?.endsWith('Start'), "Invalid startSpace given knockoff==true: ", this.startSpace);
//         // TODO validate impossible knockoffs near off ramp
//         // TODO validate impossible knockoffs near on ramp
//     }
// }

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

export class Space implements Identifiable<SpaceId> {
    id: SpaceId; // index into Board.spaces
    type: EntityId;
    distanceFromStart: number; // index into player track, Board.tracks[this.type & PLAYER_MASK]
    private _occupant?: Piece = undefined;
    constructor(n: number, type: EntityId, distanceFromStart: number) {
        this.id = new SpaceId(type & (PLAYER_MASK + EntityId.MIDDLE), distanceFromStart);
        UrUtils.isValidSpace(type);
        this.type = type;
        this.distanceFromStart = distanceFromStart;
        console.debug("Created space: "+this.name);
    }
    get occupant() {
        return this._occupant;
    }
    set occupant(piece: Piece | undefined) {
        this._occupant = piece;
    }
    get name(): string {
        const player: PlayerEntity = this.type & PLAYER_MASK;
        const space: SpaceEntity = this.type & SPACE_MASK;
        const rosette: EntityId = this.type & EntityId.ROSETTE;
        let name = "";
        if (player > 0) {
            name += EntityId[player] + "-" + this.distanceFromStart + "-" + EntityId[space];
        } else if (UrUtils.hasEntityType(space, EntityId.MIDDLE)) {
            name += EntityId[space] + "-" + this.distanceFromStart;
        } else throw "This space is messed up...";
        
        if (rosette > 0) {
            name += "*"
        }

        return name;
    }
    isRosette() {
        return UrUtils.hasEntityType(this.type, EntityId.ROSETTE);
    }
}

export class Bucket extends Space {
    occupants: Set<Piece> = new Set<Piece>();
    constructor(id: number, type: EntityId, trackId: number) {
        super(id, (() => {
            let m = type & (EntityId.START + EntityId.FINISH)
            if (m === EntityId.START || m === EntityId.FINISH) {
                return type;
            }
            throw "Invalid space type for bucket: "+type+"("+m+"), id="+id+", trackId="+trackId;
        })(), trackId);
    }
    get occupant() {
        throw "Bucket has multiple occupants. Use occupants instead.";
    }
    set occupant(p: Piece | undefined) {
        throw "Bucket has multiple occupants. Use occupants instead."
    }
}

export class Piece implements Identifiable<PieceId> {
    id: PieceId;
    owner: PlayerEntity;
    private _locationId: string; // TODO remove reference to space; use space repository to hold spaces; make as few links between objects as possible
    private _location?: Space; // optional to handle initialization chicken/egg problem
    constructor(owner: PlayerEntity, n:number) {
        if (!UrUtils.isPlayer(owner)) {
            throw "Invalid player id: "+owner;
        }
        this.owner = owner;
        this.id = new PieceId(owner, n);
        this._locationId = UrUtils.getSpaceId(owner | EntityId.START, 0);
    }
    get location() {
        if (this._location === undefined) {
            throw "Something went wrong. location===undefined";
        }
        return this._location;
    }
    set location(location: Space) {
        this._location = location;
    }
}

export interface Move {
    piece: Piece;
    space: Space;
    id: string; // for scope
}

export class Player {
    name: string;
    mask: PlayerEntity;
    private _pieces: Piece[]; // TODO make pieces addressable by id
    constructor(name: string, mask: PlayerEntity) {
        this.name = name;
        if (!UrUtils.isPlayer(mask)) {
            throw "Invalid player mask: "+mask;
        }
        this.mask = mask;
        this._pieces = this.buildPieces();
    }

    private buildPieces(): Piece[] {
        let pcs: Piece[] = [];
        for (let i = 0; i < 7; i++) {
            pcs.push(new Piece(this.mask, i));
        }
        return pcs;
    }
    get pieces(): Piece[] {
        return this._pieces;
    }
}

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

export interface StateOwner {
    state: GameState;
}

export class UrModel implements StateOwner {
    public readonly board: Board;
    public readonly players: { [EntityId.PLAYER1]: Player, [EntityId.PLAYER2]: Player }; 
    public readonly dice: Dice = new Dice();
    public turn = TurnData.create();
    public nextTurn = TurnData.create(EntityId.PLAYER2);
    public state: GameState = GameState.Initial;
    public score: {[EntityId.PLAYER1]: number, [EntityId.PLAYER2]: number};
    
    // public readonly history: TurnTaken[] = []; // TODO
    
    private constructor(player1: Player, player2: Player) {
        this.players = {
            [EntityId.PLAYER1]: player1,
            [EntityId.PLAYER2]: player2
        };
        this.board = new Board();
        this.score = {[EntityId.PLAYER1]: 0, [EntityId.PLAYER2]: 0};
    }

    get currentPlayer() {
        return this.players[this.turn.player];
    }

    get currentTrack() {
        return this.board.tracks[this.turn.player];
    }

    get opponentStartBucket() {
        return this.board.tracks[UrUtils.getOpponent(this.turn.player)][0] as Bucket;
    }

    static create(player1: Player, player2: Player) {
        return new UrModel(player1, player2);
    }
}
