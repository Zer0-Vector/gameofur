"use strict";
var UrView = (function(my, $) {
    my.p1Pieces = null;
    my.p2Pieces = null;
    my.dice = null;
    my.board = null;

    my.initialize = function(handlers) {
        my.p1Pieces = new my.Pieces(UrUtils.PLAYER1, '#p1Start', '#p1Finish');
        my.p2Pieces = new my.Pieces(UrUtils.PLAYER2, '#p2Start', '#p2Finish');
        my.dice = new my.Dice();
        loadPieces(my.p1Pieces);
        loadPieces(my.p2Pieces);
        $('#diceArea input[type="button"]#roller').click(e => handlers.roll(e));
        $('#diceArea input[type="button"]#passer').click(e => handlers.passTurn(e));
    }

    my.updateTurnDisplay = function(p) {
        var message = "Player "+p+"'s Turn";
        var c = (p === UrUtils.PLAYER1) ? "p1" : "p2";
        $('#turnIndiator').attr("class", c).html(message);
        my.dice.clear();
        $('#diceTarget > p').html("Roll the dice");
    }

    my.Die = class {
        static svgPath0 = 'images/die0.svg';
        static svgPath1 = 'images/die1.svg';
        static nextId = 0;
        constructor(currentView) {
            this.id = "die"+(my.Die.nextId++);
            $(my.Dice.cupId).append($("<div id=\""+this.id+"\" class=\"dieHolder\">").append("<div>"));
            this.currentView = -1
        }
        setView(view) {
            if (view < 0 || view > 1) {
                throw "Invalid die view number: "+view;
            }
            this.currentView = view;
            let thiz = this;
            let orientation = Math.floor(Math.random() * 3) * 120;
            let targetElement = '#'+this.id+' > div';
            $(targetElement).load(this.getSvg(), function() {
                console.log("Loaded view",thiz.currentView,"into",targetElement);
            });
        }
        clear() {
            $('#'+this.id+' > div').empty();
        }
        getSvg() {
            switch (this.currentView) {
                case 0:
                    return my.Die.svgPath0;
                case 1:
                    return my.Die.svgPath1;
            }
        }
    }

    my.Dice = class {
        static cupId = '#diceCup';
        constructor() {
            this.dice = [
                new my.Die(1),
                new my.Die(1),
                new my.Die(0),
                new my.Die(1)
            ];
        }
        updateValues(values) {
            var total = 0;
            $('#diceTarget > p').html("Rolling...");
            this.clear();
            
            var dice = this.dice;
            setTimeout(function() {
                for (var i = 0; i < dice.length; i++) {
                    var v = values[i];
                    total += v;
                    dice[i].setView(v);
                }
                $('#diceTarget > p').html("You rolled: <em class=\"rollValue\">"+total+"</em>")
            }, 250);
        }
        clear() {
            for (var i = 0; i < this.dice.length; i++) {
                this.dice[i].clear();
            }
        }
    }

    my.Piece = class {
        static svgPath = 'images/piece.svg';
        constructor(owner) {
        }
    }
    my.Pieces = class {
        constructor(owner,startPileId,endPileId) {
            if (!UrUtils.isPlayer(owner)) {
                throw "Invalid player id: "+owner;
            }
            this.owner = owner;
            this.pieces = new Array(7).fill(new my.Piece(owner), 0, 6);
            this.startPileId = startPileId;
            this.endPileId = endPileId;
        }
    }

    function loadPieces(pieces) {
        console.log("Loading player ",pieces.owner," pieces to ", pieces.startPileId);
        for (let i = 0; i < pieces.pieces.length; i++) {
            let id = "p"+pieces.owner+"p"+i;
            $(pieces.startPileId).append($("<div id=\""+id+"\" class=\"pieceHolder\">").load(my.Piece.svgPath, function() {
                console.log("Piece loaded into #"+id);
            }));
            $('.startingArea > div').draggable({
                revert: "invalid",
                revertDuration: 250
            });
            $('.space, .startingArea, .finishArea').droppable({
                drop: function(event,ui) {
                    var id = $(ui.draggable).attr('id');
                    var target = $(this).attr('id')
                    console.log(id, " dropped in ", target);
                }
            });
        }
    }

    return my;
})(UrView || {}, jQuery);