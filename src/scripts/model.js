"use strict";
var UrModel = (function (model) {
    model.initialize = function() {
        
    }
    model.Die = class {
        constructor() {
            this.currentValue = -1;
        }
        roll() {
            // 0 or 1
            this.currentValue = Math.floor(Math.random() * 2)
            return this.currentValue;
        }
        reset() {
            this.currentValue = -1;
        }
    }

    model.Space = class {
        constructor(id,type) {
            this.id = id;
            UrUtils.isValid(type);
            this.type = type;
        }
    }

    model.Piece = class {
        constructor(id, owner, position) {
            this.id = id;
            if (!UrUtils.isPlayer(owner)) {
                throw "Invalid player id: "+owner;
            }
            this.owner = owner;
            this.position = position;
        }
    }

    model.Board = class {
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
                this.spaces.push(new model.Space(i, type));
            }
        }
        buildTrack(player) {
            let track = [];
            for (let i = 0; i < 4; i++) {
                let type = player | UrUtils.ONRAMP;
                if (i === 3) {
                    type |= UrUtils.ROSETTE;
                }
                let space = new model.Space(this.spaces.length, type); 
                track.push(space);
                this.spaces.push(space);
            }
            for (let i = 0; i < 8; i++) {
                track.push(this.spaces[i]);
            }
            let penultimate = new model.Space(this.spaces.length, UrUtils.OFFRAMP | player);
            track.push(penultimate);
            this.spaces.push(penultimate);
            let lastOne = new model.Space(this.spaces.length, UrUtils.OFFRAMP | UrUtils.ROSETTE | player);
            track.push(lastOne);
            this.spaces.push(lastOne);
            return track;
        }
    }

    model.Player = class {
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
                pcs.push(new model.Piece(i << 2 | this.mask, this.mask, -1));
            }
            return pcs;
        }
    }

    model.Game = class {
        constructor() {
            console.log("Initializing game...");
            this.board = new model.Board();
            this.p1 = new model.Player("Player1", UrUtils.PLAYER1);
            this.p2 = new model.Player("Player2", UrUtils.PLAYER2);
            this.dice = [new model.Die(), new model.Die(), new model.Die(), new model.Die()];
            console.log("Game initialized: ", this);
        }
        // turn sequence: roll, move, resolve events
    }

    return model;
})(UrModel || {});