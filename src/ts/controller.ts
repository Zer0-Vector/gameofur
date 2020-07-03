import {Piece, UrModel, Player, Bucket, StateOwner, TurnData, Move, Space} from './model.js';
import UrView from './view.js';
import { EntityId, GameState, UrHandlers, PlayerEntity, UrUtils, GameAction, DiceValue, Maybe, Identifier } from './utils.js';

let VIEW = UrView;
let MODEL: UrModel;

type Repository<K extends number,V> = {[index in K]:V}
type ActionRepository = Repository<GameAction, AGameAction>;
type StateRepository = Repository<GameState, AGameState>;

enum GameStateType {
    USER, // in this state, we wait for a user interaction
    TEMP, // a "temporary" state which triggers its own transition (to chain actions together)
    FORK // Same as TEMP, but checks a condition to determine the next action.
}

type OuterTransitionMethod = ((action: GameAction)=>AGameState)
interface AGameState {
    id: GameState;
    type: GameStateType;
    peekNext: OuterTransitionMethod; // TODO convert this to enter state conditionals
    edges: GameAction[];
}
interface ATempState extends AGameState {
    action: GameAction;
}
//#region States

type ConditionalAction = (()=>GameAction);
type InnerTransitionMethod = ((action:GameAction)=>GameState|undefined);
 
let STATES: StateRepository = (()=>{
    let rval: any = {};
    let buildTransitionMethod = (thiz:any, transition:InnerTransitionMethod):OuterTransitionMethod => ((action:GameAction) => {
        let t = transition(action);
        if (t === undefined) throw "Cannot transition from "+GameState[thiz.id]+" through "+GameAction[action];
        else return rval[t];
    });
    let buildState = (id:GameState, type:GameStateType, transition:InnerTransitionMethod, edges:GameAction[], condition?:ConditionalAction):void => {
        switch (type) {
            case GameStateType.USER:
                if (condition !== undefined) {
                    console.warn("Building a USER state, but a condition was still given:", condition);
                }
                rval[id] = new (class implements AGameState {
                    id = id;
                    type = type;
                    peekNext = buildTransitionMethod(this, transition);
                    edges = edges;
                })();
                break;
            case GameStateType.TEMP:
                console.assert(edges.length === 1);

                rval[id] = new (class implements ATempState {
                    id = id;
                    type = type;
                    peekNext = buildTransitionMethod(this, transition);
                    action = edges[0];
                    edges = edges;
                })();
                break;
            case GameStateType.FORK:
                console.assert(edges.length > 0 && condition !== undefined);

                rval[id] = new (class implements ATempState {
                    id = id;
                    type = type;
                    peekNext = buildTransitionMethod(this, transition);
                    get action() {
                        return (condition as ConditionalAction)();
                    }
                    edges = edges;
                })();
                break;
        }
        console.debug("Created GameState "+GameState[id]);
    };
    let buildSimpleState = (id:GameState, op:GameAction, next: GameState, instant:boolean = false) => {
        let transition = (a:GameAction) => {
            if (a === op) return next;
            else return undefined;
        }
        if (instant) {
            buildState(id, GameStateType.TEMP, transition, [op]);
        } else {
            buildState(id, GameStateType.USER, transition, [op]);
        }
    };
    let buildForkState = (id:GameState, condition:ConditionalAction, choices:{[op in GameAction]?:GameState}) => {
        buildState(id, GameStateType.FORK, (a:GameAction) => choices[a], Object.keys(choices).map(e => parseInt(e)), condition);
    };

    buildSimpleState(GameState.Initial, GameAction.Initialize, GameState.PreGame);
    buildSimpleState(GameState.PreGame, GameAction.StartGame, GameState.PlayersReady);
    buildSimpleState(GameState.PlayersReady, GameAction.SetupGame, GameState.TurnStart, true);
    buildSimpleState(GameState.TurnStart, GameAction.StartingTurn, GameState.PreRoll, true); // TODO can this state be cut?
    buildSimpleState(GameState.PreRoll, GameAction.ThrowDice, GameState.Rolled);
    buildForkState(GameState.Rolled, 
        ()=>{ return (MODEL.turn.rollValue === 0) ? GameAction.TurnEnding : GameAction.EnableLegalMoves },
        {
            [GameAction.TurnEnding]: GameState.EndTurn,
            [GameAction.EnableLegalMoves]: GameState.PreMove
        });
    buildForkState(GameState.PreMove, 
        ()=>{ 
            if (MODEL.turn.noLegalMoves) {
                console.debug("No legal moves");
                // TODO this should have it's own transition for updating the view.
                return GameAction.TurnEnding;
            } else {
                return GameAction.MovesAvailable;
            }
        },
        {
            [GameAction.TurnEnding]: GameState.EndTurn,
            [GameAction.MovesAvailable]: GameState.ReadyToMove,
        });
    buildSimpleState(GameState.ReadyToMove, GameAction.MovePiece, GameState.PieceDropped);
    buildSimpleState(GameState.PieceDropped, GameAction.FreezeBoard, GameState.Moved, true);
    buildForkState(GameState.Moved, 
        ()=> {
            if (MODEL.turn.rosette) return GameAction.RosetteBonus;
            if (MODEL.turn.knockout) return GameAction.KnockoutOpponent;
            if (MODEL.turn.scored) return GameAction.PieceScored;
            return GameAction.MoveFinished;
        },
        {
            [GameAction.RosetteBonus]: GameState.PostMove,
            [GameAction.KnockoutOpponent]: GameState.PostMove,
            [GameAction.MoveFinished]: GameState.PostMove,
            [GameAction.PieceScored]: GameState.CheckScore,
        });
    buildSimpleState(GameState.PostMove, GameAction.TurnEnding, GameState.EndTurn, true);
    buildForkState(GameState.CheckScore,
        () => {
            console.info("Score: "+MODEL.score[EntityId.PLAYER1]+" - "+MODEL.score[EntityId.PLAYER2]);
            let playerPieces = MODEL.currentPlayer.pieces;
            for (let p of playerPieces) {
                if ((p.location.type & EntityId.FINISH) === 0) {
                    return GameAction.TurnEnding; // found piece not finished
                }
            }
            return GameAction.AllFinished;
        },
        {
            [GameAction.TurnEnding]: GameState.EndTurn,
            [GameAction.AllFinished]: GameState.GameOver,
        });
    buildSimpleState(GameState.EndTurn, GameAction.PassTurn, GameState.TurnStart);
    buildSimpleState(GameState.GameOver, GameAction.ShowWinner, GameState.PostGame, true);
    buildSimpleState(GameState.PostGame, GameAction.NewGame, GameState.PlayersReady);

    return rval as StateRepository;
})();



//#endregion

//#region Actions
interface AGameAction {
    id: GameAction;
    run(): Promise<void>;
}

let ACTIONS: ActionRepository = (() => {
        let rval: any = {};

        // FIXME
        let notImplemented = (a:GameAction) => (async () => {console.warn(GameAction[a]+" not implemented!")});

        let actionMaker = (id:GameAction, run:()=>Promise<void>): void => {
            rval[id] = new (class implements AGameAction {
                id: GameAction = id;
                run: (()=>Promise<void>) = () => {
                    return run().then(() => {
                        console.debug(GameAction[this.id] + " completed.");
                    })
                };
            })();
            console.debug("Created action: " + GameAction[id]);
        }
        actionMaker(GameAction.Initialize, async ()=>{
            VIEW.buttons.starter.enable();
        })
        actionMaker(GameAction.StartGame, async ()=>{
            VIEW.updateTurnDisplay(MODEL.currentPlayer.mask, MODEL.currentPlayer.name);
        });
        actionMaker(GameAction.SetupGame, async ()=>{
            VIEW.buttons.starter.disable();
        });
        actionMaker(GameAction.StartingTurn, async ()=>{
            VIEW.buttons.roller.enable();
            VIEW.buttons.passer.disable();
            console.info(MODEL.currentPlayer.name+"'s turn. Turn "+MODEL.turn.number);
        });
        actionMaker(GameAction.ThrowDice, async ()=>{
            let infoClear = VIEW.rollInfo.rolling();
            let roll = MODEL.dice.roll();
            MODEL.turn.rollValue = roll;
            console.debug("Rolled dice: ",MODEL.dice.values," = ",roll);
            VIEW.buttons.roller.disable();
            await infoClear
                .then(() => VIEW.dice.update(MODEL.dice.values))
                .then(() => { 
                    console.info(MODEL.currentPlayer.name+" rolled "+roll);
                    return VIEW.rollInfo.update(roll);
                });
        });
        actionMaker(GameAction.EnableLegalMoves, async () => {
            // TODO extract this to class MoveComputer
            let legal = new MoveComputer(MODEL.turn.player, MODEL.currentPlayer.pieces, MODEL.currentTrack).compute(MODEL.turn.rollValue as DiceValue);
            if (legal.size === 0) {
                MODEL.turn.noLegalMoves = true;
            } else {
                for (let psc of MODEL.currentPlayer.pieces) {
                    let move = legal.get(psc.id);
                    if (move === undefined) {
                        VIEW.applyNoMovesStyles(psc.id);
                    } else {
                        VIEW.dndControl(move.piece.id, move.space.id, true, move.id);
                        VIEW.applyLegalMoveBehavior(move.piece.id, move.space.id);
                    }
                }
            }
        });
        actionMaker(GameAction.MovePiece, async () => {
            console.debug("Updating model with new location");
            VIEW.removeLegalMoveBehavior();
            VIEW.removeNoMovesStyles();
            let piece:Piece = MODEL.turn.piece as Piece;
            let start:Space = MODEL.turn.startSpace as Space;
            let end:Space = MODEL.turn.endSpace as Space;
            let limbo:Piece|undefined = undefined;

            piece.location = end;
            
            if (end instanceof Bucket) {
                let endBucket: Bucket = end as Bucket;
                endBucket.occupants.add(piece);
                MODEL.turn.scored = true;
            } else {
                if (end.occupant !== undefined) {
                    // remove current occupant
                    console.assert(end.occupant.owner !== MODEL.turn.player);
                    limbo = end.occupant;
                    MODEL.turn.knockout = true;
                }
                end.occupant = piece;
            }
            MODEL.turn.rosette = end.isRosette();

            if (start instanceof Bucket) {
                let startBucket:Bucket = start as Bucket;
                startBucket.occupants.delete(piece);
            } else {
                start.occupant = undefined;
            }

            if (limbo !== undefined) {
                MODEL.turn.knockedPiece = limbo;
                MODEL.opponentStartBucket.occupants.add(limbo);
                limbo.location = MODEL.opponentStartBucket;
            }
        });
        actionMaker(GameAction.FreezeBoard, async ()=> {
            VIEW.disableDnD();
        });
        actionMaker(GameAction.RosetteBonus, async () => {
            console.debug("Updated next player due to rosette space");
            MODEL.nextTurn.player = MODEL.turn.player;
        });
        actionMaker(GameAction.KnockoutOpponent, async () => {
            console.debug("Returning opponent piece to start.");
            if (MODEL.turn.knockedPiece === undefined) {
                throw "No knocked piece in the model to move.";
            }
            console.assert(MODEL.turn.knockedPiece.owner === UrUtils.getOpponent(MODEL.turn.player));
            
            await VIEW.movePiece(MODEL.turn.knockedPiece.id, MODEL.opponentStartBucket.id, false);
        })
        actionMaker(GameAction.PieceScored, async ()=>{
            console.info(MODEL.currentPlayer.name + " scored!");
            MODEL.score[MODEL.turn.player]++;
        });

        actionMaker(GameAction.PassTurn, async ()=>{
            MODEL.turn = MODEL.nextTurn;
            MODEL.nextTurn = TurnData.create(UrUtils.getOpponent(MODEL.turn.player));
            VIEW.updateTurnDisplay(MODEL.currentPlayer.mask, MODEL.currentPlayer.name);
        });
        actionMaker(GameAction.MoveFinished, async () => {
            console.debug("Just a normal move: NOP");
        });
        actionMaker(GameAction.MovesAvailable, async () => {
            console.debug("We're ready to move something...");
        });
        actionMaker(GameAction.TurnEnding, async () => {
            VIEW.buttons.passer.enable();
        });
        actionMaker(GameAction.NewGame, notImplemented(GameAction.NewGame));
        actionMaker(GameAction.AllFinished, async () => {
            console.info("** GAME OVER **");
        });
        actionMaker(GameAction.ShowWinner, async () => {
            console.info("** "+MODEL.currentPlayer.name.toUpperCase()+" WINS! **");
        });
        return rval as ActionRepository;
    })();
//#endregion

class MoveComputer {
    private readonly pieces: Piece[];
    private readonly track: Space[];
    private readonly player: PlayerEntity;
    constructor(whosTurn: PlayerEntity, pieces:Piece[], track:Space[]) {
        this.pieces = pieces;
        this.track = track;
        this.player = whosTurn;
    }

    compute(roll:DiceValue): Map<Identifier, Move> {
        if (roll === 0) {
            return new Map();
        }

        let legal: Map<Identifier, Move> = new Map();
        for (let p of this.pieces) {
            let index = p.location.distanceFromStart + roll;
            if (index >= this.track.length) {
                continue; // rolled too high to finish
            }
            let candidate = this.track[index];
            if (candidate instanceof Bucket) {
                console.assert(index === 15);
            } else if (candidate.occupant !== undefined) {
                if (candidate.occupant.owner === this.player) {
                    continue; // can't move atop a piece you own
                } else if (candidate.isRosette()) { // NOTE: for the standard board, we could just check that specific index.
                    continue; // can't knockout opponent on rosette
                }
            }
            // passed the test. This move is legal.
            console.debug("Found legal move: "+p.id+": "+p.location.name+" to "+candidate.name);
            legal.set(p.id, {
                piece: p,
                space: candidate,
                id: p.id+"_"+candidate.distanceFromStart,
            });
        }
        return legal;
    }
}

class GameEngine {
    private _model: StateOwner;
    constructor(model: StateOwner) {
        this._model = model;
        console.debug("GameEngine initialized. state="+GameState[this._model.state]);
    }

    private get currentState(): GameState {
        return this._model.state;
    }
    private set currentState(id: GameState) {
        this._model.state = id;
    }

    private get currentStateImpl(): AGameState {
        return STATES[this.currentState];
    }

    private peekNext(action: GameAction): Maybe<AGameState> {
        return this.currentStateImpl.peekNext(action);
        // return this._model.edges[this.currentState].transitions[action];
    }

    async do(currentAction: GameAction): Promise<void> {
        let loop = async (init:{count:number, next:GameAction}, fn:(action:GameAction)=>Promise<GameAction|undefined>): Promise<number> => {
            const next = await fn(init.next);
            if (next === undefined) {
                return init.count;
            } else {
                // TODO should this await?
                return loop({count:init.count+1, next:next}, fn);
            }
        };

        await loop({count:1, next:currentAction}, async (action:GameAction):Promise<GameAction|undefined> => {
            const dstState = await this.doTransition((action as GameAction));
            switch (dstState.type) {
                case GameStateType.TEMP:
                case GameStateType.FORK:
                    let nextAction = (dstState as ATempState).action;
                    if (nextAction === undefined) {
                        return Promise.reject("Got undefined action from a " + dstState.type + " state: " + dstState);
                    }
                    return nextAction;
                default:
                    return undefined;
            }
        }).then((i:number):void => {
            console.debug("Finished transition loop after "+i+" iterations");
            console.assert(this.currentStateImpl.type === GameStateType.USER);
            console.debug("Waiting on "+GameAction[this.currentStateImpl.edges[0]]);
        });
    }

    private async doTransition(action: GameAction): Promise<AGameState> {
        console.debug(GameState[this.currentState]+".doTransition: "+GameAction[action]);
        let nextState = this.peekNext(action);
        if (nextState === undefined) {
            return Promise.reject("Transition from "+GameState[this.currentState]+" via "+GameAction[action]+" did not return a state.");
        }

        await ACTIONS[action].run();

        console.debug(GameState[this._model.state]+" --> "+GameState[nextState.id]);
        this.currentState = nextState.id;

        // the previous assignment updates this getter's value.
        return this.currentStateImpl;
    }
}

namespace UrController {
    let ENGINE: GameEngine;
    class UrHandlersImpl implements UrHandlers {
        newGame(): void {
            console.warn("newGame() NOT IMPLEMENTED");
        }
        roll() {
            ENGINE.do(GameAction.ThrowDice);
        }
    
        passTurn() {
            ENGINE.do(GameAction.PassTurn);
        }

        startGame() {
            ENGINE.do(GameAction.StartGame);
        }

        pieceMoved(pieceId:Identifier, spaceId:Identifier) {
            let index = parseInt(spaceId.toString().substring(2));
            console.assert(index >= 0);
            console.assert(index <= 15);
            MODEL.turn.endSpace = MODEL.currentTrack[index];
            console.debug("Set end space: ("+index+")", MODEL.turn.endSpace);
            for (let modelPiece of MODEL.currentPlayer.pieces) {
                if (pieceId.equals(modelPiece.id)) {
                    MODEL.turn.piece = modelPiece;
                    console.debug("Set piece moved: ", modelPiece);
                    
                    MODEL.turn.startSpace = modelPiece.location;
                    console.debug("Set start space: ", MODEL.turn.startSpace);
                    break;
                }
            }
            ENGINE.do(GameAction.MovePiece);
        }
    }

    function startBucket(player: PlayerEntity) {
        return MODEL.board.tracks[player][0].id;
    }
    
    export async function initialize() {
        let p1Info = {
            mask: EntityId.PLAYER1 as PlayerEntity,
            id: UrUtils.toIdentifierPart(EntityId.PLAYER1),
            name: "Player 1"
        }
        let p2Info = {
            mask: EntityId.PLAYER2 as PlayerEntity,
            id: UrUtils.toIdentifierPart(EntityId.PLAYER2),
            name: "Player 2"
        }

        let p1 = new Player("Player 1", EntityId.PLAYER1);
        let p2 = new Player("Player 2", EntityId.PLAYER2);
        
        MODEL = UrModel.create(p1, p2);

        setupBoard();

        VIEW.p1Pieces = VIEW.initializePieces(p1.mask, MODEL.players[p1.mask].pieces.map(p => p.id), startBucket(p1.mask));
        VIEW.p2Pieces = VIEW.initializePieces(p2.mask, MODEL.players[p2.mask].pieces.map(p => p.id), startBucket(p2.mask));
        await Promise.all([VIEW.p1Pieces.render(), VIEW.p2Pieces.render()]);
        VIEW.initialize(new UrHandlersImpl());
        console.debug("View initialized.");

        ENGINE = new GameEngine(MODEL);
        ENGINE.do(GameAction.Initialize);
    }

    function setupBoard() {
        let loadPieces = (p:PlayerEntity) => {
            let startBucket = MODEL.board.tracks[p][0] as Bucket;
            MODEL.players[p].pieces.forEach(pc => {
                startBucket.occupants.add(pc);
                pc.location = startBucket;
            });
        };
        ([EntityId.PLAYER1, EntityId.PLAYER2]).forEach(p => {
            loadPieces(p as PlayerEntity);
        });
        console.debug("Board setup completed: ", MODEL.board);
    }
}

export default UrController;