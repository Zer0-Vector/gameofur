import {Piece, UrModel, Player, Bucket, StateOwner, TurnData} from './model.js';
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

type GameActionImpl = ()=>void;
const CompositeGameTask = (first:GameActionImpl, second:GameActionImpl, ...theRest:GameActionImpl[]): GameActionImpl => () => {
    first();
    second();
    for (let action of theRest) {
        action();
    }
};

interface GameStateImpl {
    id: GameState;
    /**
     * When defined, this state requires no user interaction.
     * This transition action will be invoked immidiately after entering this state (causing another state change).
     * 
     * Conditionals should be implemented here where this method returns the desired GameAction.
     */
    continue?: ()=>GameAction;
}

const EmptyState = (id: GameState): GameStateImpl => {
    return {
        id: id,
    }
}

const ACTIONS: {[index in GameAction]:GameActionImpl} = {
    [GameAction.Initialized]: () => {
        
    },
    [GameAction.StartGame]: () => {
        refreshTurnDisplay();
        VIEW.buttons.passer.disable();
        VIEW.buttons.roller.disable();
    },
    [GameAction.StartTurn]: () => {
        VIEW.buttons.roller.enable();
    },
    [GameAction.ThrowDice]: () => {
        MODEL.turn.rollValue = MODEL.dice.roll();
        console.debug("Rolled dice: ",MODEL.dice.values," = ",MODEL.turn.rollValue);
        VIEW.buttons.roller.disable();
        VIEW.dice.updateValues(MODEL.dice.values);
    },
    [GameAction.EnableLegalMoves]: () => {
        // TODO
    },
    [GameAction.MoveFinished]: () => {},
    [GameAction.AnalyzeMove]: () => {},
    [GameAction.RosetteBonus]: () => {},
    [GameAction.KnockoutOpponent]: () => {},
    [GameAction.PieceScored]: () => {},
    [GameAction.CheckWinCondition]: () => {},
    [GameAction.PassTurn]: () => {
        MODEL.turn = MODEL.nextTurn;
        MODEL.nextTurn = TurnData.create(opponent(MODEL.turn.player));
        refreshTurnDisplay(); // TODO is this redundant? 
    },
    [GameAction.EndGame]: () => {},
    [GameAction.NewGame]: () => {},
    [GameAction.GameSetup]: () => {},
    [GameAction.AllFinished]: () => {},
    [GameAction.PiecesRemain]: () => {},
    [GameAction.MovePiece]: () => {},
    [GameAction.RolledZero]: () => {},
}

const opponent = (p:PlayerEntity): PlayerEntity => ((p ^ 0x3) & 0x3) as PlayerEntity;

const STATES: {[index in GameState]: GameStateImpl} = {
    [GameState.Initial]: EmptyState(GameState.Initial),
    [GameState.SetupGame]: EmptyState(GameState.SetupGame),
    [GameState.PreGame]: EmptyState(GameState.PreGame),
    [GameState.StartTurn]: EmptyState(GameState.StartTurn),
    [GameState.Rolled]: {
        id: GameState.Rolled,
        continue: () => {
            if (MODEL.turn.rollValue === 0) {
                return GameAction.RolledZero;
            }
            return GameAction.EnableLegalMoves;
        }
    },
    [GameState.PreMove]: EmptyState(GameState.PreMove),
    [GameState.Moved]: EmptyState(GameState.Moved),
    [GameState.PostMove]: EmptyState(GameState.PostMove),
    [GameState.CheckScore]: EmptyState(GameState.CheckScore),
    [GameState.EndTurn]: EmptyState(GameState.EndTurn),
    [GameState.GameOver]: EmptyState(GameState.GameOver),
};

const FSM: {[index in GameState]: {[index in GameAction]?: GameState}} = {
    [GameState.Initial]: {
        [GameAction.Initialized]: GameState.PreGame
    },
    [GameState.PreGame]: {
        [GameAction.StartGame]: GameState.SetupGame
    },
    [GameState.SetupGame]: {
        [GameAction.GameSetup]: GameState.StartTurn
    },
    [GameState.StartTurn]: {
        [GameAction.ThrowDice]: GameState.Rolled
    },
    [GameState.Rolled]: {
        [GameAction.EnableLegalMoves]: GameState.PreMove,
        [GameAction.RolledZero]: GameState.EndTurn
    },
    [GameState.PreMove]: {
        [GameAction.MovePiece]: GameState.Moved
    },
    [GameState.Moved]: {
        [GameAction.AnalyzeMove]: GameState.PostMove
    },
    [GameState.PostMove]: {
        [GameAction.RosetteBonus]: GameState.EndTurn,
        [GameAction.KnockoutOpponent]: GameState.EndTurn,
        [GameAction.PieceScored]: GameState.CheckScore,
        [GameAction.MoveFinished]: GameState.EndTurn
    },
    [GameState.CheckScore]: {
        [GameAction.AllFinished]: GameState.GameOver,
        [GameAction.PiecesRemain]: GameState.EndTurn
    },
    [GameState.EndTurn]: {
        [GameAction.PassTurn]: GameState.StartTurn
    },
    [GameState.GameOver]: {
        [GameAction.NewGame]: GameState.SetupGame
    },
};

// TODO create start button

class GameEngine {
    private _model: StateOwner;
    constructor(model: StateOwner) {
        this._model = model;
        console.info("GameEngine initialized. state="+GameState[this._model.state]);
    }
    transition(action: GameAction) {
        let nextAction: GameAction | undefined = undefined;
        do {
            nextAction = this.doTransition(action, STATES[this.state])?.call(this);
            
        } while(nextAction);
    }

    private doTransition(action: GameAction, state: GameStateImpl): (()=>GameAction) | undefined {
        let nextState: GameState | undefined = FSM[state.id][action];
        // validate transition
        if (!nextState) {
            throw "Invalid state transition: "+GameState[state.id]+" via "+GameAction[action];
        }

        console.info("Executing "+GameAction[action]);
        // trigger transition action
        ACTIONS[action]();

        // enter new state
        this.state = nextState;
        
        // return continue action
        return state.continue;
    }

    /**
     * Triggers enter action
     */
    private set state(newState: GameState) {
        console.info(GameState[this._model.state]+" --> "+GameState[newState]);
        this._model.state = newState;
    }
    private get state() {
        return this._model.state;
    }

    get currentState() {
        return this._model.state;
    }
}

namespace UrController {
    let ENGINE: GameEngine;
    class UrHandlersImpl implements UrHandlers {
        roll() {
            ENGINE.transition(GameAction.ThrowDice);
        }
    
        passTurn() {
            console.info("Passing turn: ", MODEL.turn, MODEL.nextTurn);
            ENGINE.transition(GameAction.PassTurn);
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
        ENGINE.transition(GameAction.Initialized);
        console.info("Game initialized");
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