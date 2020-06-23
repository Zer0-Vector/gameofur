"use strict";
var UrView = (function(my, $) {
    my.p1Pieces = null;
    my.p2Pieces = null;
    my.dice = null;
    my.board = null;

    my.initialize = function(handlers) {
        my.dice = new my.Dice();

        console.debug("Configuring roll/passTurn buttons.");
        $('#diceArea input[type="button"]#roller').click(e => handlers.roll(e));
        $('#diceArea input[type="button"]#passer').click(e => handlers.passTurn(e));

        console.info("Configuring keyboard shortcuts:\n\tEnter/R = roll dice\n\tSpace/P = pass turn");
        $(document).keypress(e => {
            switch (e.which) {
                case 13: // Enter,NumpadEnter
                case 82: // KeyR
                    handlers.roll(e);
                    break;
                case 32: // Space
                case 80: // KeyP
                    handlers.passTurn(e);
                    break;
            }
        });
        
        // spaces and piecces are disabled first
        console.debug("Configuring drag/drop for pieces.");
        $('.startingArea > div').draggable({
            disabled: true, 
            revert: "invalid",
            revertDuration: 250
        });
        
        console.debug("Configuring drag/drop for spaces.");
        $('.space, .startingArea, .finishArea').droppable({
            disabled: true,
            drop: (e,u) => handlers.pieceDropped(e,u)
        });
        
    }

    my.initializePieces = function(player, list) {
        console.debug("initializePieces",player, list);
        return new my.Pieces(player.mask, '#'+player.id+'Start', '#'+player.id+'Finish', list);
    }

    my.updateTurnDisplay = function(p,name) {
        var message = name+"'s Turn";
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
            $(targetElement).load(this.getSvg(), function(resonse,status,xhr) {
                if (status == "error") {
                    console.error("Error loading",this.getSvg(),"into #"+targetElement);
                }
                console.debug("Loaded view",thiz.currentView,"into",targetElement);
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
        constructor(id,owner) {
            this.id = id;
            this.owner = owner;
        }
        render(selector) {
            $(selector).append($("<div id=\""+this.id+"\" class=\"pieceHolder\">").load(my.Piece.svgPath, function(response, status, xhr) {
                if (status == "error") {
                    console.error("Error loading",my.Piece.svgPath,"into #"+this.id);
                }
                console.debug("Loaded piece into #"+this.id);
            }));
        }
    }
    my.Pieces = class {
        constructor(owner,startPileId,endPileId,pieces) {
            if (!UrUtils.isPlayer(owner)) {
                throw "Invalid player id: "+owner;
            }
            this.owner = owner;
            this.pieces = pieces;
            this.startPileId = startPileId;
            this.endPileId = endPileId;
            this.render();
        }
        render() {
            console.debug("Loading player ",this.owner," pieces to ", this.startPileId);
            for (var i = 0; i < this.pieces.length; i++) {
                this.pieces[i].render(this.startPileId);
            }
        }
    }

    return my;
})(UrView || {}, jQuery);