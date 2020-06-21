"use strict";
var UrView = (function(view, $) {
    view.initialize = function() {
        let p1Pieces = new view.Pieces(UrUtils.PLAYER1, '#p1Start', '#p1Finish');
        let p2Pieces = new view.Pieces(UrUtils.PLAYER2, '#p2Start', '#p2Finish');
        let dice = new view.Dice();
        loadPieces(p1Pieces);
        loadPieces(p2Pieces);
        loadDice(dice)
    }

    view.Die = class {
        static svgPath0 = 'images/die0.svg';
        static svgPath1 = 'images/die1.svg';
        constructor(currentView) {
            this.setView(currentView);
        }
        setView(view) {
            if (view < 0 || view > 1) {
                throw "Invalid die view number: "+view;
            }
            this.currentView = view;
        }
        getView() {
            return this.currentView;
        }
        getSvg() {
            switch (this.currentView) {
                case 0:
                    return view.Die.svgPath0;
                case 1:
                    return view.Die.svgPath1;
            }
        }
    }

    view.Dice = class {
        static cupId = '#diceCup';
        constructor() {
            this.dice = [
                new view.Die(1),
                new view.Die(1),
                new view.Die(0),
                new view.Die(1)
            ];
        }
    }

    view.Piece = class {
        static svgPath = 'images/piece.svg';
        constructor(owner) {
        }
    }
    view.Pieces = class {
        constructor(owner,startPileId,endPileId) {
            if (!UrUtils.isPlayer(owner)) {
                throw "Invalid player id: "+owner;
            }
            this.owner = owner;
            this.pieces = new Array(7).fill(new view.Piece(owner), 0, 6);
            this.startPileId = startPileId;
            this.endPileId = endPileId;
        }
    }

    function loadPieces(pieces) {
        console.log("Loading player ",pieces.owner," pieces to ", pieces.startPileId);
        for (let i = 0; i < pieces.pieces.length; i++) {
            let id = "p"+pieces.owner+"p"+i;
            $(pieces.startPileId).append($("<div id=\""+id+"\" class=\"pieceHolder\">").load(view.Piece.svgPath, function() {
                console.log("Piece loaded into #"+id);
            }));
            $('.startingArea > div').draggable({
                revert: "invalid",
                revertDuration: 250
            });
            // TODO: query SVG for spaces, overlay divs atop spaces as drop targets.
            $('.space, .startingArea, .finishArea').droppable({
                drop: function(event,ui) {
                    var id = $(ui.draggable).attr('id');
                    var target = $(this).attr('id')
                    console.log(id, " dropped in ", target);
                }
            });
        }
    }
    
    function loadDice(dice) {
        console.log("Loading dice to ",view.Dice.cupId);
        for (var i = 0; i < dice.dice.length; i++) {
            let id = "d"+i;
            let d = dice.dice[i];
            let svg = d.getSvg();
            let v = d.getView();
            console.log("Loading die into ",id,": (",svg,", ",v,") ",d);
            $(view.Dice.cupId).append($("<div id=\""+id+"\" class=\"dieHolder\">").load(d.getSvg(), function() {
                console.log("Die loaded into #"+id);
            }));
            
        }
    }

    return view;
})(UrView || {}, jQuery);