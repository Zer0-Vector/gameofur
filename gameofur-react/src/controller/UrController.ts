import { AGameAction } from "../model/game/abstract/AGameAction";
import { Identifier } from "../model/game/abstract/Identifier";
import { UrHandlers } from "../model/game/abstract/UrHandlers";
import { GameAction } from "../model/game/GameAction";
import { GameState } from "../model/game/GameState";
import { EntityId } from "../model/game/ids/EntityId";
import { TurnData } from "../model/game/TurnData";
import { UrModel } from "../model/game/UrModel";
import { Bucket } from "../model/objects/Bucket";
import { Piece } from "../model/objects/Piece";
import { Player } from "../model/objects/Player";
import { Space } from "../model/objects/Space";
import { Repository, ActionRepository, DiceValue, TransitionRepository, PlayerEntity } from "../model/utils/types";
import { UrUtils } from "../model/utils/UrUtils";
import { UrView } from "../view/UrView";
import { EphemeralState } from "./abstract/EphemeralState";
import { GameEngine } from "./GameEngine";
import { MoveComputer } from "./MoveComputer";
import { OptionsStorage } from "./OptionsStorage";
import { ConditionallyNonTerminalState } from "./states/ConditionallyNonTerminalState";
import { JunctionState } from "./states/JunctionState";
import { NonTerminalState } from "./states/NonTerminalState";

let VIEW = UrView;
let MODEL: UrModel;

const OPTIONS = new OptionsStorage();

export const EPHEMERAL_STATES:Repository<GameState, EphemeralState> = {
    [GameState.PlayersReady]: new NonTerminalState(GameAction.SetupGame),
    [GameState.TurnStart]: new NonTerminalState(GameAction.StartingTurn),
    [GameState.PreRoll]: new ConditionallyNonTerminalState(GameAction.ThrowDice, ()=>OPTIONS.get().autoroll),
    [GameState.Rolled]: new NonTerminalState(GameAction.EnableLegalMoves),
    [GameState.PreMove]: new JunctionState((): GameAction => {
        if (MODEL.turn.noLegalMoves) {
            console.info("No legal moves");
            // TODO this should have it's own transition for updating the view.
            return GameAction.TurnEnding;
        } else {
            return GameAction.MovesAvailable;
        }
    }),
    [GameState.PieceDropped]: new NonTerminalState(GameAction.FreezeBoard),
    [GameState.Moved]: new JunctionState((): GameAction => {
        if (MODEL.turn.rosette) return GameAction.RosetteBonus;
        if (MODEL.turn.knockout) return GameAction.KnockoutOpponent;
        if (MODEL.turn.scored) return GameAction.PieceScored;
        return GameAction.MoveFinished;
    }),
    [GameState.PostMove]: new NonTerminalState(GameAction.TurnEnding),
    [GameState.CheckScore]: new JunctionState((): GameAction => {
        console.info("Score: "+MODEL.score[EntityId.PLAYER1]+" - "+MODEL.score[EntityId.PLAYER2]);
        let playerPieces = MODEL.currentPlayer.pieces;
        for (let p of playerPieces) {
            if ((p.location.type & EntityId.FINISH) === 0) {
                return GameAction.TurnEnding; // found piece not finished
            }
        }
        return GameAction.AllFinished;
    }),
    [GameState.EndTurn]: new ConditionallyNonTerminalState(GameAction.PassTurn, () => OPTIONS.get().autopass),
    [GameState.GameOver]: new NonTerminalState(GameAction.ShowWinner),
}

//#endregion

//#region Actions
export let ACTIONS: ActionRepository = (() => {
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
            VIEW.removeNoMovesStyles();
            for (let p of MODEL.currentOpponent.pieces) {
                VIEW.applyNoMovesStyles(p.id);
            }
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
            }

            for (let psc of MODEL.currentPlayer.pieces) {
                let move = legal.get(psc.id);
                if (move === undefined) {
                    VIEW.applyNoMovesStyles(psc.id);
                } else {
                    VIEW.dndControl(move.piece.id, move.space.id, true, move.id);
                    VIEW.applyLegalMoveBehavior(move.piece.id, move.space.id);
                }
            }
        });
        actionMaker(GameAction.MovePiece, async () => {
            console.debug("Updating model with new location");
            VIEW.removeLegalMoveBehavior();
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
            if (MODEL.turn.knockedPiece === undefined) {
                throw "No knocked piece in the model to move.";
            }
            console.assert(MODEL.turn.knockedPiece.owner === UrUtils.getOpponent(MODEL.turn.player));
            console.info(MODEL.currentPlayer.name+" knocked out an opponent's piece on "+MODEL.turn.endSpace);
            
            await VIEW.movePiece(MODEL.turn.knockedPiece.id, MODEL.opponentStartBucket.id, 300, false);
        })
        actionMaker(GameAction.PieceScored, async ()=>{
            console.info(MODEL.currentPlayer.name + " scored!");
            MODEL.score[MODEL.turn.player]++;
            VIEW.updateScores(MODEL.score);
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
        actionMaker(GameAction.TurnEnding, () => {
            // TODO is there a better way to do this?
            return new Promise<void>((resolve, reject) => {
                VIEW.buttons.passer.enable();
                if (OPTIONS.get().autopass && MODEL.turn.noLegalMoves) { // TODO this should be in after PostMove so the PassTurn button can also be used. Use Promis.any to ensure only one promise triggers the state transition.
                    setTimeout(() => {
                        resolve();
                    }, 1000);
                } else {
                    resolve();
                }
            });
        });
        actionMaker(GameAction.NewGame, notImplemented(GameAction.NewGame));
        actionMaker(GameAction.AllFinished, async () => {
            console.info("** GAME OVER **");
        });
        actionMaker(GameAction.ShowWinner, async () => {
            console.info("** "+MODEL.currentPlayer.name.toUpperCase()+" WINS! **");
            VIEW.removeNoMovesStyles();
            VIEW.showWinnder(MODEL.currentPlayer.mask, MODEL.currentPlayer.name);
            VIEW.startWinnerAnimation(MODEL.currentPlayer.mask);
        });
        return rval as ActionRepository;
    })();
//#endregion

//#region Edges/Transitions
export const TRANSITIONS: TransitionRepository = {
    [GameState.Initial]: {
        [GameAction.Initialize]: GameState.PreGame,
    },
    [GameState.PreGame]: {
        [GameAction.StartGame]: GameState.PlayersReady,
    },
    [GameState.PlayersReady]: {
        [GameAction.SetupGame]: GameState.TurnStart,
    },
    [GameState.TurnStart]: {
        [GameAction.StartingTurn]: GameState.PreRoll,
    },
    [GameState.PreRoll]: {
        [GameAction.ThrowDice]: GameState.Rolled,
    },
    [GameState.Rolled]: {
        [GameAction.EnableLegalMoves]: GameState.PreMove,
    },
    [GameState.PreMove]: {
        [GameAction.TurnEnding]: GameState.EndTurn,
        [GameAction.MovesAvailable]: GameState.ReadyToMove,
    },
    [GameState.ReadyToMove]: {
        [GameAction.MovePiece]: GameState.PieceDropped,
    },
    [GameState.PieceDropped]: {
        [GameAction.FreezeBoard]: GameState.Moved,
    },
    [GameState.Moved]: {
        [GameAction.RosetteBonus]: GameState.PostMove,
        [GameAction.KnockoutOpponent]: GameState.PostMove,
        [GameAction.MoveFinished]: GameState.PostMove,
        [GameAction.PieceScored]: GameState.CheckScore,
    },
    [GameState.PostMove]: {
        [GameAction.TurnEnding]: GameState.EndTurn,
    },
    [GameState.EndTurn]: {
        [GameAction.PassTurn]: GameState.TurnStart,
    },
    [GameState.CheckScore]: {
        [GameAction.TurnEnding]: GameState.EndTurn,
        [GameAction.AllFinished]: GameState.GameOver,
    },
    [GameState.GameOver]: {
        [GameAction.ShowWinner]: GameState.PostGame,
    },
    [GameState.PostGame]: {
        // TODO missing a step: setup board again.
        [GameAction.NewGame]: GameState.PlayersReady,
    },
};

namespace UrController {
    let ENGINE: GameEngine;
    class UrHandlersImpl implements UrHandlers {
        checkboxChanged(name: string, checked: boolean): void {
            switch(name) {
                case "autopass":
                    OPTIONS.get().autopass = checked;
                    OPTIONS.save();
                    console.debug("AutoPass "+(OPTIONS.get().autopass ? "enabled" : "disabled"));
                    break;
                case "autoroll":
                    OPTIONS.get().autoroll = checked;
                    OPTIONS.save();
                    console.debug("AutoRoll "+(OPTIONS.get().autoroll ? "enabled" : "disabled"));
                    break;
                default:
                    console.warn("Unknown checkbox: "+name);
            }
        }
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

        OPTIONS.load();
        if (OPTIONS.get().autopass) {
            VIEW.checkboxes.autopass.click();
        }
        if (OPTIONS.get().autoroll) {
            VIEW.checkboxes.autoroll.click();
        }
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