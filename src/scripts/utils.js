"use strict";
var UrUtils = (function(my) {
    my.PLAYER1 = 0x01;
    my.PLAYER2 = 0x02;
    my.ROSETTE = 0x04;
    my.ONRAMP  = 0x08;
    my.OFFRAMP = 0x10;
    my.MIDDLE  = 0x20;
    my.SPACE_ID_PREFIX = "s-";
    my.PIECE_ID_PREFIX = "pc-";
    my.isValidSpace = function(t) {
        const PLAYER_MASK = 0x03;
        const LOCATION_MASK = 0x38;
        var player = t & PLAYER_MASK;
        var location = t & LOCATION_MASK;
        if (player > 2) {
            throw "Space cannot belong in both players' zones.";
        }
        switch(location) {
            case this.ONRAMP:
            case this.OFFRAMP:
            case this.MIDDLE:
                break; // valid
            default:
                throw "Space can only be one of ONRAMP, OFFRAMP or MIDDLE";
        }
    };
    my.isPlayer = function(t) {
        return t === this.PLAYER1 || t === this.PLAYER2;
    }
    
    my.TurnPhase = {
        ROLL: 'roll',  // initial state, roll --[roll dice]--> move
        MOVE: 'move',  // move --[move piece]--> knockout
        ACTION: 'action', // action --[perform action]--> roll
    }
    return my;
})(UrUtils || {});