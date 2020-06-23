"use strict";
var UrModel = (function (my) {
    my.board = null;
    my.players = {};
    my.player1 = null;
    my.player2 = null;
    my.dice = null;
    my.turn = null;
    my.history = []; // TODO
    my.initialize = function() {
        my.player1 = new my.Player("Player 1", UrUtils.PLAYER1, "a");
        my.player2 = new my.Player("Player 2", UrUtils.PLAYER2, "b");
        my.players[UrUtils.PLAYER1] = my.player1;
        my.players[UrUtils.PLAYER2] = my.player2;
        my.board = new my.Board();
        my.dice = new my.Dice();
        my.turn = new my.TurnData();
        my.phase = UrUtils.TurnPhase.ROLL;
    }

    my.TurnData = class {
        constructor() {
            this.phase = UrUtils.TurnPhase.ROLL;
            this.rollValue = -1;
            this.player = UrUtils.PLAYER1;
            this.rosette = false;
            this.startSpace = null;
            this.endSpace = null;
        }
    }

    my.TurnTaken = class { // TODO for tracking history
        constructor(player) {
            this.player = player;
            this.roll = -1;
            this.knockoff = false;
            this.rosette = false;
            this.startSpace = null;
            this.endSpace = null;
        }
        validate() {
            console.assert(this.roll >= 0 && this.roll <= 4, "Invalid roll value: ",this.roll);
            // roll is zero iff start & end spaces are both null
            console.assert((this.roll == 0) === ((this.startSpace == null) === (this.endSpace == null)), "Invalid start/end space given roll value: roll=",roll,", start=",startSpace,", end=",endSpace);
            var rosettes = ["a1", "b1", "m4", "a7", "b7"];
            console.assert(rosette === (rosettes.includes(this.endSpace)), "Invalid endSpace given rosette==true: ",endSpace);
            console.assert(knockoff === (!this.startSpace.endsWith('Start')), "Invalid startSpace given knockoff==true: ", startSpace);
            // TODO validate impossible knockoffs near off ramp
            // TODO validate impossible knockoffs near on ramp
        }
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
        constructor(id, owner, location) {
            this.id = id;
            if (!UrUtils.isPlayer(owner)) {
                throw "Invalid player id: "+owner;
            }
            this.owner = owner;
            this.location = location;
        }
    }

    my.Player = class {
        constructor(name, mask, id) {
            this.name = name;
            if (!UrUtils.isPlayer(mask)) {
                throw "Invalid player mask: "+mask;
            }
            this.mask = mask;
            this.id = id;
            this.pieces = this.buildPieces();
            for (var i = 0; i < this.pieces.length; i++) {
                var p = this.pieces[i];
                this.map[p.id] = p;
            }
        }
        buildPieces() {
            let pcs = new Map();
            for (let i = 0; i < 7; i++) {
                var pcid = UrUtils.PIECE_ID_PREFIX+this.id+i;
                pcs.set(pcid, new my.Piece(pcid, this.mask, this.id+"Start"));
            }
            return pcs;
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

    return my;
})(UrModel || {});