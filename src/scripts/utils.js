"use strict";
var UrUtils = (function(utils) {
    utils.PLAYER1 = 0x01;
    utils.PLAYER2 = 0x02;
    utils.ROSETTE = 0x04;
    utils.ONRAMP  = 0x08;
    utils.OFFRAMP = 0x10;
    utils.MIDDLE  = 0x20;
    utils.isValidSpace = function(t) {
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
    utils.isPlayer = function(t) {
        return t === this.PLAYER1 || t === this.PLAYER2;
    }
    
    return utils;
})(UrUtils || {});