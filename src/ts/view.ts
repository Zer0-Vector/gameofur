import { PlayerEntity, UrUtils, EntityId, UrHandlers } from "./utils.js";

type DieView = 0 | 1;

class Die {
    static nextId = 0;

    static readonly svgMap = {
        [0 as DieView]: 'images/die0.svg',
        [1 as DieView]: 'images/die1.svg'
    }

    readonly id: string;

    constructor() {
        this.id = "die"+(Die.nextId++);
        $(Dice.cupId).append($("<div id=\""+this.id+"\" class=\"dieHolder\">").append("<div>"));
    }

    setView(view: DieView | null): void {
        let orientation = Math.floor(Math.random() * 3) * 120; // TODO
        let targetElement = '#'+this.id+' > div';
        if (view !== null) {
            let svg = Die.svgMap[view];
            $(targetElement).load(svg, (resonse, status, xhr) => {
                if (status == "error") {
                    console.error("Error loading",svg,"into #"+targetElement);
                }
                console.debug("Loaded view",view,"into",targetElement);
            });
        } else {
            $(targetElement).empty();
        }
    }
    clear() {
        $('#'+this.id+' > div').empty();
    }
}

class Dice {
    static readonly cupId = '#diceCup';
    readonly dice: [Die, Die, Die, Die];
    constructor() {
        this.dice = [
            new Die(),
            new Die(),
            new Die(),
            new Die()
        ];
    }
    updateValues(values: [DieView,DieView,DieView,DieView]) {
        // TODO die rotations
        var total = 0;
        $('#inputArea > p').html("Rolling...");
        this.clear();
        
        let dice = this.dice;
        setTimeout(() => {
            values.forEach((val, i) => {
                total += val;
                dice[i].setView(val);
            });
            $('#inputArea > p').html("You rolled: <em class=\"rollValue\">"+total+"</em>")
        }, 250);
    }
    clear() {
        this.dice.forEach(d => {
            d.clear();
        });
    }
}

export class Piece {
    static readonly svgPath = 'images/piece.svg';
    readonly id: string;
    readonly owner: PlayerEntity;

    constructor(id: string, owner: PlayerEntity) {
        this.id = id;
        this.owner = owner;
    }
    render(selector: string) {
        $(selector).append($("<div id=\""+this.id+"\" class=\"pieceHolder\">").load(Piece.svgPath, (response, status, xhr) => {
            if (status == "error") {
                console.error("Error loading",Piece.svgPath,"into #"+this.id);
            }
            console.debug("Loaded piece into #"+this.id);
        }));
    }
}
class Pieces {
    readonly owner: PlayerEntity;
    readonly pieces: Piece[];
    readonly startPileId: string;
    readonly endPileId: string;

    constructor(owner: PlayerEntity, startPileId: string, endPileId: string, pieces: Piece[]) {
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

export interface UiElement {
    enable(): void;
    disable(): void;
}

class UiElementImpl implements UiElement {
    id: string;
    constructor(id: string) {
        this.id = id;
    }
    enable(): void {
        console.debug("Enabling "+this.id);
        $(this.id).removeProp("disabled");
    }
    disable(): void {
        console.debug("Disabling "+this.id);
        $(this.id).prop("disabled", true);
    }

}

namespace UrView {
    export let p1Pieces: Pieces;
    export let p2Pieces: Pieces;
    export let dice: Dice = new Dice();
    export let board = null;

    const _buttons = {
        "roller": new UiElementImpl('input[type="button"]#roller'),
        "passer": new UiElementImpl('input[type="button"]#passer')
    };

    export const buttons = _buttons as {[name:string]: UiElement};

    export function initialize(handlers: UrHandlers) { // TODO fix type
        console.debug("Configuring roll/passTurn buttons.");
        
        $(_buttons.roller.id)
            .on('click', handlers.roll);
        
        $(_buttons.passer.id)
            .on('click', handlers.passTurn);

        console.info("Configuring keyboard shortcuts:\n\tEnter/R = roll dice\n\tSpace/P = pass turn");
        $(document).keypress(e => {
            switch (e.which) {
                case 13: // Enter,NumpadEnter
                case 82: // KeyR
                    handlers.roll();
                    break;
                case 32: // Space
                case 80: // KeyP
                    handlers.passTurn();
                    break;
            }
        });
        
        // dnd spaces and piecces are disabled first
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

    export function initializePieces(mask: PlayerEntity, id: string, list: Piece[]) {
        console.debug("initializePieces",mask, id, list);
        return new Pieces(mask, '#'+id+'Start', '#'+id+'Finish', list);
    }

    export function updateTurnDisplay(p: PlayerEntity, name: string) {
        var message = name+"'s Turn";
        var c = (p === EntityId.PLAYER1) ? "p1" : "p2";
        $('#turnIndiator').attr("class", c).html(message);
        dice.clear();
        $('#inputArea > p').html("Roll the dice");
    }

}

export let VIEW = UrView;
