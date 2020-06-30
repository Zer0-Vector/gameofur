import { PlayerEntity, UrUtils, EntityId, UrHandlers, DiceList, DieValue, DiceValue, Maybe, Identifiable, Identifier, DieId, SimpleId, PieceId, SpaceId } from "./utils.js";
import { Space } from "./model.js";

interface Renderable<RenderOptions> {
    render(renderOptions?:RenderOptions): Promise<void | void[]>;
}

interface Updateable<UpdateDescriptor> {
    update(update?:UpdateDescriptor): Promise<void>;
}

class Die implements Updateable<DieValue>, Identifiable<DieId>, Renderable<undefined> {
    static nextId = 0;

    static readonly svgMap = {
        [0 as DieValue]: 'images/die0.svg',
        [1 as DieValue]: 'images/die1.svg'
    }

    static getNew(n:number):Die {
        return new Die(n);
    }

    id: DieId;    
    currentView: DieValue = 0;
    
    private constructor(n:number) {
        if (n > 3 || n < 0) throw "Invlid Die id number: "+n;
        this.id = new DieId(n);
    }

    get svg(): string {
        return Die.svgMap[this.currentView];
    }

    async render(): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            $(this.id.selector).load(this.svg, (response, status, xhr) => {
                if (status === "success") {                    
                    console.debug("Loaded view",this.currentView,"into",this.id.selector);
                    resolve();
                } else {
                    let reason = "Error loading "+this.svg+" into "+this.id.selector;
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
        $(this.id.selector).empty();
    }
}

class RollInfo implements Updateable<DiceValue>, Identifiable<SimpleId> {
    readonly id: SimpleId;
    constructor() {
        this.id = new SimpleId("rollInfo");
    }
    async update(update: DiceValue): Promise<void> {
        $(this.id.selector).html("You rolled: <em class=\"rollValue\">"+update+"</em>");
    }
    async rolling(): Promise<void> {
        $(this.id.selector).html("Rolling...");
    };
}

class Dice implements Updateable<DiceList>, Identifiable<SimpleId>{
    readonly id: SimpleId;
    readonly dice: [Die, Die, Die, Die];
    constructor() {
        this.id = new SimpleId("diceCup");
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
export class Piece implements Renderable<SimpleId>, Identifiable<PieceId> {
    static readonly svgPath = 'images/piece.svg';
    readonly owner: PlayerEntity;
    readonly id: PieceId;

    constructor(id: PieceId, owner: PlayerEntity) {
        this.id = id;
        this.owner = owner;
    }

    render(parent: SimpleId): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            $(parent.selector).append($("<div id=\""+this.id+"\" class=\"pieceHolder\">").load(Piece.svgPath, (response, status, xhr) => {
                if (status === "success") {
                    console.debug("Loaded piece into "+this.id.selector+" under "+parent.selector);
                    resolve();
                } else {
                    let reason = "Error loading "+Piece.svgPath+" into "+this.id.selector;
                    console.error(reason);
                    reject(reason);
                } 
            }));
        });
    }
}

class Pieces implements Renderable<undefined> {
    readonly owner: PlayerEntity;
    readonly startPileId: SpaceId;
    readonly endPileId: SpaceId;
    readonly _pieces: Map<PieceId, Piece>;

    constructor(owner: PlayerEntity, startPileId: SpaceId, endPileId: SpaceId, pieces: Piece[]) {
        if (!UrUtils.isPlayer(owner)) {
            throw "Invalid player id: "+owner;
        }
        this.owner = owner;
        this.startPileId = startPileId;
        this.endPileId = endPileId;
        this._pieces = new Map(pieces.map(p => [p.id, p]));
    }
    get pieces(): Piece[] {
        return Array.from(this._pieces.values());
    }
    getPiece(id:PieceId): Piece {
        let piece: Maybe<Piece> = this._pieces.get(id);
        if (piece === undefined) {
            throw "Unknown piece id: "+id;
        }
        return piece as Piece;
    }

    tryGetPiece(id:PieceId, piece: Maybe<Piece>): boolean {
        piece = this._pieces.get(id);
        return piece !== undefined;
    }

    render(): Promise<void[]> {
        console.debug("Loading player ",this.owner," pieces to ", this.startPileId);
        return Promise.all(this.pieces.map(p => p.render(this.startPileId)));
    }
}

interface Enableable {
    enable(): void;
    disable(): void;
}

class UiElementImpl implements Enableable {
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


// TODO: extract behaviors to separate classes; bind with UI elements somehow
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

    function dropControl(space: SpaceId, enabled:boolean, scope?:string) {
        let action = enabled ? "enable" : "disable"
        console.debug(action+" drop for "+space.selector+" in scope:"+scope || "");
        $(space.selector).droppable("option", "scope", scope);
        $(space.selector).droppable(action);
    }

    function dragControl(piece:PieceId, enabled:boolean, scope?:string) {
        let action = enabled ? "enable" : "disable"
        console.debug(action+" drag for "+piece.selector+" in scope:"+scope || "");
        $(piece.selector).draggable("option", "scope", scope);
        $(piece.selector).draggable(action);
    }

    export function dndControl(piece:PieceId, space:SpaceId, enabled:boolean, scope?: string) {
        console.assert(!enabled || scope !== undefined, "Cannot enable dnd for pieces/spaces unless specifying a scope");
        dragControl(piece, enabled, scope);
        dropControl(space, enabled, scope);
    }

    const LEGAL_MOVE_HOVER_CLASS = "ur-legal-move-hover";
    export function applyLegalMoveBehavior(piece:PieceId, space:SpaceId) {
        $(piece.selector).on("mouseenter", () => {
            $(space.selector).addClass(LEGAL_MOVE_HOVER_CLASS);
        }).on("mouseleave", () => {
            $(space.selector).removeClass(LEGAL_MOVE_HOVER_CLASS);
        }).on("dblclick", (event) => {
            $(piece.selector).position({
                my: "center",
                at: "center",
                of: $(space.selector),
                using: (pos:any) => {
                    console.debug("Animating target: ",$(piece.selector));
                    $(piece.selector).animate(pos, {
                        duration: 500,
                        start: () => {
                            // TODO FreezeBoard and Disable hover behaviors. This may require reworking state machine
                            console.debug("Dblclick move animation: start");
                        },
                        done: () => {
                            console.debug("Dblclick move animation: done");
                            moveHander(piece.toString(), space.toString());
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

    export async function returnPieceToStart(piece:PieceId): Promise<void> {
        return new Promise<void>((resovle, reject) => {
            $(piece.selector).animate({"left":0, "top":0}, 750, "swing", () => {
                console.debug("Updated left/top coords for "+piece.selector);
                resovle();
            });
        });
    }

    export function initializePieces(mask: PlayerEntity, list: Piece[]) {
        console.debug("initializePieces",mask, list);
        return new Pieces(mask, new SpaceId(mask, 0), new SpaceId(mask, 15), list);
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
