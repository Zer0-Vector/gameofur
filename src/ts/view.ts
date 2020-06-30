import { PlayerEntity, UrUtils, EntityId, UrHandlers, DiceList, DieValue, DiceValue } from "./utils.js";
import { Space } from "./model.js";

interface Renderable<Options> {
    render(renderOptions?:Options): Promise<void | void[]>;
}

interface Updateable<UpdateDescriptor> {
    update(update?:UpdateDescriptor): Promise<void>;
}

abstract class AnUrUiElement {
    private readonly _id: string
    protected constructor(id: string) {
        this._id = id;
    }
    get id(): string {
        return this._id;
    }
    get selector(): string {
        return "#" + this.id;
    };
}

abstract class ARenderableUrUiElement<RenderOptions> extends AnUrUiElement implements Renderable<RenderOptions> {
    abstract render(renderOptions?: RenderOptions): Promise<void | void[]>;
}

class Die extends ARenderableUrUiElement<undefined> implements Updateable<DieValue> {
    static nextId = 0;

    static readonly svgMap = {
        [0 as DieValue]: 'images/die0.svg',
        [1 as DieValue]: 'images/die1.svg'
    }

    static getNew(n:number):Die {
        return new Die(n);
    }
    
    currentView: DieValue = 0;
    
    private constructor(n:number) {
        super((() => {
            if (n > 3 || n < 0) throw "Invlid Die id number: "+n;
            return "die"+n;
        })());
    }

    get svg(): string {
        return Die.svgMap[this.currentView];
    }

    async render(): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            $(this.selector).load(this.svg, (response, status, xhr) => {
                if (status === "success") {                    
                    console.debug("Loaded view",this.currentView,"into",this.selector);
                    resolve();
                } else {
                    let reason = "Error loading "+this.svg+" into "+this.selector;
                    console.error(reason);
                    reject(reason);
                }
            });
        });
    }    
    
    async update(view: DieValue): Promise<void> {
        let orientation = Math.floor(Math.random() * 3) * 120; // TODO
        this.currentView = view;
        return this.render();
    }

    clear() {
        $(this.selector).empty();
    }
}

class RollInfo extends AnUrUiElement implements Updateable<DiceValue> {
    constructor() {
        super("rollInfo");
    }
    async update(update: DiceValue): Promise<void> {
        $(this.selector).html("You rolled: <em class=\"rollValue\">"+update+"</em>");
    }
    async rolling(): Promise<void> {
        $(this.selector).html("Rolling...");
    };
}

class Dice extends AnUrUiElement implements Updateable<DiceList>{
    readonly dice: [Die, Die, Die, Die];
    constructor() {
        super("diceCup");
        this.dice = [
            Die.getNew(0),
            Die.getNew(1),
            Die.getNew(2),
            Die.getNew(3)
        ];
    }
    
    async update(values: DiceList): Promise<void> {
        this.clear();
        return new Promise<void>((resolve, reject) => {
            setTimeout(() => resolve(), 250);
        }).then(async () => { await Promise.all(values.map((val, i) => this.dice[i].update(val))); } );
    }

    clear() {
        this.dice.forEach(d => {
            d.clear();
        });
    }
}

// TODO this should export
export class Piece extends ARenderableUrUiElement<string> {
    static readonly svgPath = 'images/piece.svg';
    readonly owner: PlayerEntity;

    constructor(id: string, owner: PlayerEntity) {
        super(id);
        this.owner = owner;
    }

    render(parentSelector: string): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            $(parentSelector).append($("<div id=\""+this.id+"\" class=\"pieceHolder\">").load(Piece.svgPath, (response, status, xhr) => {
                if (status === "success") {
                    console.debug("Loaded piece into #"+this.id);
                    resolve();
                } else {
                    let reason = "Error loading "+Piece.svgPath+" into "+this.selector;
                    console.error(reason);
                    reject(reason);
                } 
            }));
        });
    }
}

class Pieces implements Renderable<undefined> {
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
    }
    render(): Promise<void[]> {
        console.debug("Loading player ",this.owner," pieces to ", this.startPileId);
        return Promise.all(this.pieces.map(p => p.render(this.startPileId)));
    }
}

interface UiElement {
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
        $(this.id).prop("disabled", false);
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
    export let rollInfo: RollInfo = new RollInfo();

    export const buttons = {
        roller: new UiElementImpl('button#roller'),
        passer: new UiElementImpl('button#passer'),
        starter: new UiElementImpl('button#starter'),
        newgame: new UiElementImpl('button#newgame'),
    }

    let moveHander:(pid:string,sid:string)=>void;

    export function initialize(handlers: UrHandlers) { // TODO fix type
        console.debug("Configuring roll/passTurn buttons.");
        
        $(buttons.roller.id).on('click', handlers.roll);
        $(buttons.passer.id).on('click', handlers.passTurn);
        $(buttons.starter.id).on('click', handlers.startGame);
        $(buttons.newgame.id).on('click', handlers.newGame);
        moveHander = handlers.pieceMoved;

        console.info("Configuring keyboard shortcuts:\n\tEnter/R = roll dice\n\tSpace/P = pass turn");
        $(document).on('keypress', e => {
            switch (e.which) {
                case 13: // Enter,NumpadEnter
                case 82: // R
                case 114: // r
                    console.debug("Kepress (Roll)", e);
                    handlers.roll();
                    break;
                case 32: // Space
                case 80: // P
                case 112: // p
                    console.debug("Keypress (PassTurn):", e);
                    handlers.passTurn();
                    break;
                case 115: // S
                case 83: // s
                    console.debug("Keypress (Start Game):", e);
                    handlers.startGame();
                    break;
                case 110: // N
                case 78: // n
                    console.debug("Keypress (New Game):", e);
                    handlers.newGame();
                    break;
                default:
                    console.debug("Ignoring keypress: ", e);
            }
        });
        
        // dnd spaces and piecces are disabled first
        console.debug("Configuring drag/drop for pieces.");
        $('.startingArea > div').draggable({
            disabled: true, 
            revert: "invalid",
            revertDuration: 250,
        });
        
        console.debug("Configuring drag/drop for spaces.");
        $('.space, .startingArea, .finishArea').droppable({
            disabled: true,
            drop: (e,u) => handlers.pieceDropped(e,u)
        });
        $('.space, .startingArea, .finishArea').droppable("option", "classes.ui-droppable-hover", "ur-piece-hover");
    }

    function spaceCssId(space:Space): string {
        let rval = "#"+UrUtils.SPACE_ID_PREFIX;
        if (UrUtils.hasEntityType(space.type, EntityId.PLAYER1)) {
            rval += "a";
        } else if (UrUtils.hasEntityType(space.type, EntityId.PLAYER2)) {
            rval += "b";
        } else if (UrUtils.hasEntityType(space.type, EntityId.MIDDLE)) {
            rval += "m";
        }
        return rval + space.trackId;
    }
    export function disableDnD() {
        console.debug("Disabling all drag and drop");
        $(".startingArea > div").draggable("option", {
            disabled: true,
            scope: undefined,
        });
        $(".space, .startingArea, .finishArea").droppable({
            disabled: true,
            scope: undefined,
        });
    }

    function dropControl(space:Space, enabled:boolean, scope?:string) {
        let cssId = spaceCssId(space);
        let action = enabled ? "enable" : "disable"
        console.debug(action+" drop for "+cssId+" in scope:"+scope || "");
        $(cssId).droppable("option", "scope", scope);
        $(cssId).droppable(action);
    }

    function dragControl(piece:Piece, enabled:boolean, scope?:string) {
        let cssId = "#"+piece.id;
        let action = enabled ? "enable" : "disable"
        console.debug(action+" drag for "+cssId+" in scope:"+scope || "");
        $(cssId).draggable("option", "scope", scope);
        $(cssId).draggable(action);
    }

    export function dndControl(piece:Piece, space:Space, enabled:boolean, scope?: string) {
        console.assert(!enabled || scope !== undefined, "Cannot enable dnd for pieces/spaces unless specifying a scope");
        dragControl(piece, enabled, scope);
        dropControl(space, enabled, scope);
    }

    const LEGAL_MOVE_HOVER_CLASS = "ur-legal-move-hover";
    export function applyLegalMoveBehavior(piece:Piece, space:Space) {
        let pcid = "#"+piece.id;
        let spid = spaceCssId(space);
        $(pcid).on("mouseenter", () => {
            $(spid).addClass(LEGAL_MOVE_HOVER_CLASS);
        }).on("mouseleave", () => {
            $(spid).removeClass(LEGAL_MOVE_HOVER_CLASS);
        }).on("dblclick", (event) => {
            $(pcid).position({
                my: "center",
                at: "center",
                of: $(spid),
                using: (pos:any) => {
                    console.debug("Animating target: ",$(pcid));
                    $(pcid).animate(pos, {
                        duration: 500,
                        start: () => {
                            // TODO FreezeBoard and Disable hover behaviors. This may require reworking state machine
                            console.debug("Dblclick move animation: start");
                        },
                        done: () => {
                            console.debug("Dblclick move animation: done");
                            moveHander(piece.id, spid.substring(1));
                        }
                    });
                }
            })
        });
    }

    export function removeLegalMoveBehavior() {
        $(".startingArea > div").off("mouseenter mouseleave dblclick");
        $(".space, .finishArea").removeClass(LEGAL_MOVE_HOVER_CLASS);
    }

    export async function returnPieceToStart(pieceId:string): Promise<void> {
        return new Promise<void>((resovle, reject) => {
            $("#"+pieceId).animate({"left":0, "top":0}, 750, "swing", () => {
                console.debug("Updated left/top coords for #"+pieceId);
                resovle();
            });
        });
    }

    export function initializePieces(mask: PlayerEntity, list: Piece[]) {
        console.debug("initializePieces",mask, list);
        return new Pieces(mask, '#'+UrUtils.getSpaceId(mask | EntityId.START, 0), '#'+UrUtils.getSpaceId(mask | EntityId.FINISH, 15), list);
    }

    export function updateTurnDisplay(p: PlayerEntity, name: string) {
        var message = name+"'s Turn";
        var c = (p === EntityId.PLAYER1) ? "p1" : "p2";
        $('#turnIndiator').attr("class", c).html(message);
        dice.clear();
        $('#inputArea > p').html("Roll the dice");
    }

}

// TODO double-click to animate move to space

export let VIEW = UrView;
