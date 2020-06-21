"use strict";
var UrModel = (function (my) {
    my.board = null;
    my.player1 = null;
    my.player2 = null;
    my.dice = null;
    my.turn = null;
    my.initialize = function() {
        my.board = new my.Board();
        my.player1 = new my.Player("Player1", UrUtils.PLAYER1);
        my.player2 = new my.Player("Player2", UrUtils.PLAYER2);
        my.dice = new my.Dice();
        my.turn = UrUtils.PLAYER1;
    }

    my.Dice = class {
        constructor() {
            this.values = [-1, -1, -1, -1];
            this.total = -1;
        }

        roll() {
            this.total = 0;
            for (var i = 0; i<4; i++) {
                var n = Math.floor(Math.random() * 2);
                this.total += n;
                this.values[i] = n;
            }
            return this.total;
        }

        reset() {
            this.values = [-1, -1, -1, -1];
            this.total = -1;
        }
    }

    my.Space = class {
        constructor(id,type) {
            this.id = id;
            UrUtils.isValidSpace(type);
            this.type = type;
        }
    }

    my.Piece = class {
        constructor(id, owner, position) {
            this.id = id;
            if (!UrUtils.isPlayer(owner)) {
                throw "Invalid player id: "+owner;
            }
            this.owner = owner;
            this.position = position;
        }
    }

    my.Board = class {
        constructor() {
            this.spaces = [];
            this.addMiddleLane();
            this.p1track = this.buildTrack(UrUtils.PLAYER1);
            this.p2track = this.buildTrack(UrUtils.PLAYER2);
        }
        addMiddleLane() {
            for (let i = 0; i < 8; i++) {
                let type = UrUtils.MIDDLE;
                if (i === 3) {
                    type |= UrUtils.ROSETTE;
                }
                this.spaces.push(new my.Space(i, type));
            }
        }
        buildTrack(player) {
            let track = [];
            for (let i = 0; i < 4; i++) {
                let type = player | UrUtils.ONRAMP;
                if (i === 3) {
                    type |= UrUtils.ROSETTE;
                }
                let space = new my.Space(this.spaces.length, type); 
                track.push(space);
                this.spaces.push(space);
            }
            for (let i = 0; i < 8; i++) {
                track.push(this.spaces[i]);
            }
            let penultimate = new my.Space(this.spaces.length, UrUtils.OFFRAMP | player);
            track.push(penultimate);
            this.spaces.push(penultimate);
            let lastOne = new my.Space(this.spaces.length, UrUtils.OFFRAMP | UrUtils.ROSETTE | player);
            track.push(lastOne);
            this.spaces.push(lastOne);
            return track;
        }
    }

    my.Player = class {
        constructor(name, mask) {
            this.name = name;
            if (!UrUtils.isPlayer(mask)) {
                throw "Invalid player mask: "+mask;
            }
            this.mask = mask;
            this.pieces = this.buildPieces();
        }
        buildPieces() {
            let pcs = [];
            for (let i = 0; i < 7; i++) {
                pcs.push(new my.Piece(i << 2 | this.mask, this.mask, -1));
            }
            return pcs;
        }
    }

    return my;
})(UrModel || {});