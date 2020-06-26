import {Piece, UrModel, Player, Bucket, StateOwner, TurnData, Move} from './model.js';
import * as View from './view.js';
import { EntityId, GameState, UrHandlers, PlayerEntity, UrUtils, GameAction } from './utils.js';

let VIEW = View.VIEW;
let MODEL: UrModel;

function toViewPieces(modelPieces: Piece[]) {
    var result:View.Piece[] = [];
    for (let p of modelPieces) {
        result.push(new View.Piece(p.id, p.owner));
    }
    return result;
}

function refreshTurnDisplay() {
    console.debug("refreshTurnDisplay: ", MODEL.players, MODEL.turn.player, MODEL.players[MODEL.turn.player]);
    var p = MODEL.players[MODEL.turn.player];
    VIEW.updateTurnDisplay(p.mask, p.name);
}

class GameActionImpl {
    private _doit: ()=>void;
    private logMessage: ()=>void;
    constructor(message: string | (()=>string), action:()=>void) {
        this._doit = action;
        if (typeof message === "string") {
            this.logMessage = ()=>{console.info(message);};
        } else {
            this.logMessage = ()=>{console.info(message());};
        }
    }
    public doit() {
        this._doit();
        this.logMessage();
    }
}

type FuncOrVal<T> = T | (()=>T);

class GameStateImpl {
    id: GameState;
    /**
     * When defined, this state requires no user interaction.
     * This transition action will be invoked immidiately after entering this state (causing another state change).
     * 
     * Conditionals should be implemented here where this method returns the desired GameAction.
     */
    action?: ()=>GameAction;
    constructor(id:GameState, action?:()=>GameAction) {
        this.id = id;
        this.action = action;
    }
    
}

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
    transition: OuterTransitionMethod;
    edges: GameAction[];
}
interface ATempState extends AGameState {
    action: GameAction;
}
//#region States

type ConditionalAction = (()=>GameAction);
type DerivedOrConstantAction = ConditionalAction|GameAction;
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
                    transition = buildTransitionMethod(this, transition);
                    edges = edges;
                })();
                break;
            case GameStateType.TEMP:
                console.assert(edges.length === 1);

                rval[id] = new (class implements ATempState {
                    id = id;
                    type = type;
                    transition = buildTransitionMethod(this, transition);
                    action = edges[0];
                    edges = edges;
                })();
                break;
            case GameStateType.FORK:
                console.assert(edges.length > 0 && condition !== undefined);

                rval[id] = new (class implements ATempState {
                    id = id;
                    type = type;
                    transition = buildTransitionMethod(this, transition);
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
    buildSimpleState(GameState.PreMove, GameAction.MovePiece, GameState.Moved);
    buildSimpleState(GameState.Moved, GameAction.AnalyzeMove, GameState.PostMove, true);
    buildForkState(GameState.PostMove, 
        ()=> {
            if (MODEL.turn.rosette) return GameAction.RosetteBonus;
            if (MODEL.turn.knockout) return GameAction.KnockoutOpponent;
            if (MODEL.turn.scored) return GameAction.PieceScored;
            return GameAction.MoveFinished;
        },
        {
            [GameAction.RosetteBonus]: GameState.EndTurn,
            [GameAction.KnockoutOpponent]: GameState.EndTurn,
            [GameAction.MoveFinished]: GameState.EndTurn,
            [GameAction.PieceScored]: GameState.CheckScore,
        });
    buildForkState(GameState.CheckScore,
        () => {
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
    run(): void;
}
let ACTIONS: ActionRepository = (() => {
        let rval: any = {};

        // FIXME
        let notImplemented = (a:GameAction) => (() => {console.warn(GameAction[a]+" not implemented!")});

        let actionMaker = (id:GameAction, run:()=>void): void => {
            rval[id] = new (class implements AGameAction {
                id: GameAction = id;
                run: ()=>void = () => {
                    run();
                    console.info(GameAction[this.id]+" completed.");
                };
            })();
            console.debug("Created action: "+GameAction[id]);
        }
        actionMaker(GameAction.Initialize, ()=>{
            VIEW.buttons.starter.enable();
        })
        actionMaker(GameAction.StartGame, ()=>{
            refreshTurnDisplay();
        });
        actionMaker(GameAction.SetupGame, ()=>{
            VIEW.buttons.starter.disable();
        });
        actionMaker(GameAction.StartingTurn, ()=>{
            VIEW.buttons.roller.enable();
            VIEW.buttons.passer.disable();
            console.info(MODEL.currentPlayer.name+"'s turn. Turn "+MODEL.turn.number);
        });
        actionMaker(GameAction.ThrowDice, ()=>{
            
            MODEL.turn.rollValue = MODEL.dice.roll();
            // ALWAYS ROLL 0
            // MODEL.turn.rollValue = 0;
            // MODEL.dice.values = [0,0,0,0];
            console.debug("Rolled dice: ",MODEL.dice.values," = ",MODEL.turn.rollValue);
            VIEW.buttons.roller.disable();
            VIEW.dice.updateValues(MODEL.dice.values);

            console.info(MODEL.currentPlayer.name+" rolled "+MODEL.turn.rollValue);
        });
        actionMaker(GameAction.EnableLegalMoves, () => {
            // TODO extract this to class MoveComputer
            let legal: Move[] = []
            for (let p of MODEL.currentPlayer.pieces) {
                let index = p.location.trackId + MODEL.turn.rollValue;
                if (index >= MODEL.currentTrack.length) {
                    continue; // rolled too high to finish
                }
                let candidate = MODEL.currentTrack[index];
                if (candidate.occupant !== undefined) {
                    if (candidate.occupant.owner === MODEL.turn.player) {
                        continue; // can't move atop a piece you own
                    } else if (candidate.isRosette()) { // NOTE: for the standard board, we could just check that specific index.
                        continue; // can't knockout opponent on rosette
                    }
                }
                // passed the test. This move is legal.
                console.debug("Found legal move: "+p.id+": "+p.location.name+" to "+candidate.name);
                legal.push({
                    piece: p,
                    space: candidate
                });

            }
            notImplemented(GameAction.EnableLegalMoves)();
        });
        actionMaker(GameAction.MoveFinished, notImplemented(GameAction.MoveFinished));
        actionMaker(GameAction.AnalyzeMove, notImplemented(GameAction.AnalyzeMove));
        actionMaker(GameAction.RosetteBonus, notImplemented(GameAction.RosetteBonus));
        actionMaker(GameAction.PieceScored, notImplemented(GameAction.PieceScored));
        actionMaker(GameAction.PassTurn, ()=>{
            MODEL.turn = MODEL.nextTurn;
            MODEL.nextTurn = TurnData.create(opponent(MODEL.turn.player));
            refreshTurnDisplay();
        });
        actionMaker(GameAction.EndGame, notImplemented(GameAction.EndGame));
        actionMaker(GameAction.NewGame, notImplemented(GameAction.NewGame));
        actionMaker(GameAction.AllFinished, notImplemented(GameAction.AllFinished));
        actionMaker(GameAction.MovePiece, notImplemented(GameAction.MovePiece));
        actionMaker(GameAction.TurnEnding, () => {
            VIEW.buttons.passer.enable();
        });
        return rval as ActionRepository;
    })();
//#endregion

const opponent = (p:PlayerEntity): PlayerEntity => ((p ^ 0x3) & 0x3) as PlayerEntity;

class GameEngine {
    private _model: StateOwner;
    constructor(model: StateOwner) {
        this._model = model;
        console.info("GameEngine initialized. state="+GameState[this._model.state]);
    }

    // TODO move transition logic to state class
    // TODO hold current state in GameEngine (delegae property to MODEL)
    // TODO define State/Action repository
    // TODO implement states/actions in separate classes

    do(action: GameAction): void {
        let nextAction: GameAction | undefined = action;
        let i = 1;
        for (; nextAction !== undefined; i++) {
            let srcStateId = this.currentState;
            let dstState = this.doTransition(nextAction);
            
            console.assert(srcStateId !== dstState.id, "GameState did not change after transition action: src="+GameState[srcStateId]+", action="+GameAction[nextAction]);
            
            switch(dstState.type) {
                case GameStateType.TEMP:
                case GameStateType.FORK:
                    nextAction = (dstState as ATempState).action
                    console.assert(nextAction !== undefined, "Got undefined action from a "+dstState.type+" state:",dstState);
                    break;
                default:
                    nextAction = undefined;
            }
        }
        console.debug("Finished transition loop after "+i+" iterations");
        console.assert(this.currentStateImpl.type === GameStateType.USER);
        console.info("Waiting on "+GameAction[this.currentStateImpl.edges[0]]);
    }

    private doTransition(action: GameAction): AGameState {
        console.debug(GameState[this.currentState]+".doTransition: "+GameAction[action]);
        let nextState = this.currentStateImpl.transition(action);
        console.assert(nextState !== undefined, "Transition from "+GameState[this.currentState]+" via "+GameAction[action]+" did not return a state.");

        // trigger transition action
        ACTIONS[action].run();

        // enter new state
        console.info(GameState[this._model.state]+" --> "+GameState[nextState.id]);
        this._model.state = nextState.id;

        return this.currentStateImpl;
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
}

namespace UrController {
    let ENGINE: GameEngine;
    class UrHandlersImpl implements UrHandlers {
        roll() {
            ENGINE.do(GameAction.ThrowDice);
        }
    
        passTurn() {
            ENGINE.do(GameAction.PassTurn);
        }

        startGame() {
            ENGINE.do(GameAction.StartGame);
        }
    
        pieceDropped(event: any, ui: any) {
            var tid = $(event.target).attr('id');
            MODEL.turn.endSpace = tid;
            var pscid = $(ui.draggable).attr('id');
            console.info(pscid, " dropped in ",tid," from ",MODEL.turn.startSpace);
            console.debug(event);
            console.debug(ui);
        }
    }

    type PlayerInfo = {mask:PlayerEntity,id:string,name:string};
    export function initialize() {
        let p1Info = {
            mask: EntityId.PLAYER1 as PlayerEntity,
            id: "a",
            name: "Player 1"
        }
        let p2Info = {
            mask: EntityId.PLAYER2 as PlayerEntity,
            id: "b",
            name: "Player 2"
        }
        let createPlayer = (info:PlayerInfo) => { return new Player(info.name, info.mask, info.id, buildPieces(info)); };

        let p1 = createPlayer(p1Info);
        let p2 = createPlayer(p2Info);
        
        MODEL = UrModel.create(p1, p2);

        setupBoard();
        setupView(p1, p2);

        ENGINE = new GameEngine(MODEL);
        ENGINE.do(GameAction.Initialize);
    }
    
    export function startGame() {
        console.info("Starting game.");
        refreshTurnDisplay();
    }

    function setupView(p1:Player, p2: Player) {
        VIEW.p1Pieces = VIEW.initializePieces(p1.mask, p1.id, toViewPieces(MODEL.players[p1.mask].pieces));
        VIEW.p2Pieces = VIEW.initializePieces(p2.mask, p2.id, toViewPieces(MODEL.players[p2.mask].pieces));
        VIEW.initialize(new UrHandlersImpl());
        console.debug("View initialized.");
    }

    function setupBoard() {
        let loadPieces = (p:PlayerEntity) => {
            let bucket = <Bucket>MODEL.board.tracks[p][0];
            MODEL.players[p].pieces.forEach(pc => {
                bucket.occupants.push(pc);
                pc.location = bucket;
            });
        };
        (<PlayerEntity[]>[EntityId.PLAYER1, EntityId.PLAYER2]).forEach(p => {
            loadPieces(p);
        });
        console.debug("Board setup completed: ", MODEL.board);
    }

    function buildPieces(info: PlayerInfo): Piece[] {
        let pcs: Piece[] = [];
        for (let i = 0; i < 7; i++) {
            var pcid = UrUtils.PIECE_ID_PREFIX+info.id+i;
            pcs.push(new Piece(pcid, info.mask));
        }
        return pcs;
    }
}

export default UrController;