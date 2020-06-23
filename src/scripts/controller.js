"use strict";
var UrController = (function(my) {
    const MODEL = UrModel;
    const VIEW = UrView;

    // for debugging
    my.MODEL = MODEL;
    my.VIEW = VIEW;

    function toViewPieces(modelPieces) {
        var result = [];
        for (let [id, p] of modelPieces) {
            result.push(new VIEW.Piece(p.id, p.owner));
        }
        return result;
    }

    my.initialize = function() {
        MODEL.initialize();
        VIEW.p1Pieces = VIEW.initializePieces(MODEL.player1, toViewPieces(MODEL.player1.pieces));
        VIEW.p2Pieces = VIEW.initializePieces(MODEL.player2, toViewPieces(MODEL.player2.pieces));
        VIEW.initialize(my.handlers);
        refreshTurnDisplay();
    }
    function refreshTurnDisplay() {
        console.debug("refreshTurnDisplay: ", MODEL.players, MODEL.turn.player, MODEL.players[MODEL.turn.player]);
        var p = MODEL.players[MODEL.turn.player];
        VIEW.updateTurnDisplay(p.mask, p.name);
    }

    my.startGame = function() {
    }

    my.phaseTransition = function() {
        switch(MODEL.turn.phase) {
            case UrUtils.TurnPhase.ROLL:
                break;
            case UrUtils.TurnPhase.MOVE:
                break;
            case UrUtils.TurnPhase.ACTION:
                break;
        }
    }

    my.nextTurn = function() {
        console.debug("Current turn: ",MODEL.turn);
        var next = new MODEL.TurnData();
        // TODO validate current phase?
        if (MODEL.turn.rosette) {
            next.player = MODEL.turn.player;
        } else {
            switch (MODEL.turn.player) {
                case UrUtils.PLAYER1:
                    next.player = UrUtils.PLAYER2;
                    break;
                case UrUtils.PLAYER2:
                    next.player = UrUtils.PLAYER1;
                    break;
                default:
                    throw "Invalid player: "+MODEL.turn.player;
            }
        }
        console.debug("Next turn: ", next);
        return next;
    }

    my.handlers = (function(h){
        h.roll = function(event) {
            MODEL.turn.rollValue = MODEL.dice.roll();
            console.debug("Rolled dice: ",MODEL.dice.values," = ",MODEL.turn.rollValue);
            VIEW.dice.updateValues(MODEL.dice.values);
            // TODO die rotations
        };
    
        h.passTurn = function(event) {
            // TODO use object for turn
            console.info("Ending turn: ", MODEL.turn);
            MODEL.turn = my.nextTurn();
            refreshTurnDisplay();
        };

        h.pieceMoved = function(event, ui) {
            var startPos = $(event.target).attr('id');
            MODEL.turn.startSpace = startPos;
            var id = $(ui.draggable).attr('id');
            console.info(id," moved out: ", startPos);
            console.debug(event);
            console.debug(ui);
        };

        // TODO only activate dnd when it's that player's turn for their pieces
        // TODO only let valid spaces be droppable.
        // TODO enable dnd after roll (unless 0);
        // TODO enable pass turn only after move is completed.
        // TODO enable roll only when player has not already rolled, at the beginning of their turn.
        // TODO track phases of turn more granularly; pick up piece, drop piece, etc.

        h.pieceDropped  = function(event, ui) {
            var tid = $(event.target).attr('id');
            MODEL.turn.endSpace = tid;
            var pscid = $(ui.draggable).attr('id');
            console.info(pscid, " dropped in ",tid," from ",MODEL.turn.startSpace);
            console.debug(event);
            console.debug(ui);
        };
        return h;
    })(my.handlers || {});

    return my;
})(UrController || {});