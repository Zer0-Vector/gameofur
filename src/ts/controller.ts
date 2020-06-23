import {MODEL, Piece, TurnData} from './model.js';
import * as View from './view.js';
import { EntityMask, TurnPhase, UrHandlers } from './utils.js';

let VIEW = View.VIEW;

type PiecesList = Iterable<Piece>;

function toViewPieces(modelPieces: PiecesList) {
    var result:View.Piece[] = [];
    for (let p of Array.from(modelPieces)) {
        result.push(new View.Piece(p.id, p.owner));
    }
    return result;
}

function nextTurn() {
    console.debug("Current turn: ",MODEL.turn);
    var next = TurnData.create();
    if (MODEL.turn.rosette) {
        next.player = MODEL.turn.player;
    } else {
        switch (MODEL.turn.player) {
            case EntityMask.PLAYER1:
                next.player = EntityMask.PLAYER2;
                break;
            case EntityMask.PLAYER2:
                next.player = EntityMask.PLAYER1;
                break;
            default:
                throw "Invalid player: "+MODEL.turn.player;
        }
    }
    console.debug("Next turn: ", next);
    return next;
}

function refreshTurnDisplay() {
    console.debug("refreshTurnDisplay: ", MODEL.players, MODEL.turn.player, MODEL.players[MODEL.turn.player]);
    var p = MODEL.players[MODEL.turn.player];
    VIEW.updateTurnDisplay(p.mask, p.name);
}

function phaseTransition(next: TurnPhase) { //TODO
    switch(next) {
        case TurnPhase.ROLL: // trigger = pass
            // disable pass turn button
            VIEW.buttons.passTurn.disable()
            // enable roll button
            VIEW.buttons.roll.enable();
            break;
        case TurnPhase.MOVE: // trigger = roll
            // compute valid spaces given roll
            // enable draggable/droppable for applicable pieces/spaces
            // disable roll button
            VIEW.buttons.roll.disable();
            break;
        case TurnPhase.ACTION: // trigger = drop or rolled 0
            // disable all draggable/droppable
            // update model with move information
            // knock off any pieces
            // cache next turn object
            // enable pass turn button
            VIEW.buttons.passTurn.enable();
            break;
    }
    MODEL.turn.phase = next;
}

class UrHandlersImpl implements UrHandlers {
    roll() { // TODO specific type
        MODEL.turn.rollValue = MODEL.dice.roll();
        console.debug("Rolled dice: ",MODEL.dice.values," = ",MODEL.turn.rollValue);
        VIEW.dice.updateValues(MODEL.dice.values);
        // TODO die rotations
    }

    passTurn() {
        // TODO use object for turn
        console.info("Ending turn: ", MODEL.turn);
        MODEL.turn = nextTurn();
        refreshTurnDisplay();
    }

    pieceMoved(event: any, ui: any) { 
        var startPos = $(event.target).attr('id');
        MODEL.turn.startSpace = startPos;
        var id = $(ui.draggable).attr('id');
        console.info(id," moved out: ", startPos);
        console.debug(event);
        console.debug(ui);
    }

    // TODO only activate dnd when it's that player's turn for their pieces
    // TODO only let valid spaces be droppable.
    // TODO enable dnd after roll (unless 0);
    // TODO enable pass turn only after move is completed.
    // TODO enable roll only when player has not already rolled, at the beginning of their turn.
    // TODO track phases of turn more granularly; pick up piece, drop piece, etc.

    pieceDropped(event: any, ui: any) {
        var tid = $(event.target).attr('id');
        MODEL.turn.endSpace = tid;
        var pscid = $(ui.draggable).attr('id');
        console.info(pscid, " dropped in ",tid," from ",MODEL.turn.startSpace);
        console.debug(event);
        console.debug(ui);
    }
}

namespace UrController {
    export function initialize() {
        let p1 = MODEL.players[EntityMask.PLAYER1];
        let p2 = MODEL.players[EntityMask.PLAYER2];

        VIEW.p1Pieces = VIEW.initializePieces(p1.mask, p1.id, toViewPieces(MODEL.player1.pieces));
        VIEW.p2Pieces = VIEW.initializePieces(p2.mask, p2.id, toViewPieces(MODEL.player2.pieces));
        VIEW.initialize(new UrHandlersImpl());
        phaseTransition(MODEL.turn.phase);
        refreshTurnDisplay();
    }    
}

export default UrController;