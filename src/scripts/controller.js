"use strict";
var UrController = (function(my) {
    const MODEL = UrModel;
    const VIEW = UrView;

    my.initialize = function() {
        MODEL.initialize();
        VIEW.initialize(my.handlers);
        VIEW.updateTurnDisplay(MODEL.turn);
    }

    my.startGame = function() {
    }

    my.handlers = (function(h){
        h.roll = function(event) {
            var value = MODEL.dice.roll();
            console.log("Rolled dice: ",MODEL.dice.values," = ",value);
            VIEW.dice.updateValues(MODEL.dice.values);
            // TODO die rotations
        }
    
        h.passTurn = function(event) {
            if (MODEL.turn === UrUtils.PLAYER1) {
                MODEL.turn = UrUtils.PLAYER2;
            } else {
                MODEL.turn = UrUtils.PLAYER1;
            }
            VIEW.updateTurnDisplay(MODEL.turn);
        }
        return h;
    })(my.handlers || {});

    return my;
})(UrController || {});