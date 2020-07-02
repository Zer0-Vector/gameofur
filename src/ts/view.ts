import { PlayerEntity, UrUtils, EntityId, UrHandlers, DiceList, DieValue, DiceValue, Maybe, Identifiable, Identifier, DieId, SimpleId, PieceId, SpaceId } from "./utils.js";

interface Renderable {
    render(): Promise<void | void[]>;
}

interface Updateable<UpdateDescriptor> {
    update(update?:UpdateDescriptor): Promise<void>;
}

class Die implements Updateable<DieValue>, Identifiable<DieId>, Renderable {
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

class Piece implements Renderable, Identifiable<PieceId> {
    static readonly svgPath = 'images/piece5.svg';
    readonly owner: PlayerEntity;
    readonly id: PieceId;
    container: Identifier;

    constructor(id: PieceId, owner: PlayerEntity, initialContainer: Identifier) {
        this.id = id;
        this.owner = owner;
        this.container = initialContainer;
    }

    render(): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            $(this.container.selector).append(
                $("<div id=\""+this.id+"\" class=\"pieceHolder p"+this.owner+"\">")
                    .load(Piece.svgPath, (response, status, xhr) => {
                        if (status === "success") {
                            console.debug("Loaded piece into "+this.id.selector+" under "+this.container.selector);
                            $(this.id.selector).position({
                                my: "center",
                                at: "center",
                                of: $(this.container.selector)
                            });
                            resolve();
                        } else {
                            let reason = "Error loading "+Piece.svgPath+" into "+this.id.selector;
                            console.error(reason);
                            reject(reason);
                        } 
                    }
                )
            );
        });
    }
}

class Pieces implements Renderable {
    readonly owner: PlayerEntity;
    readonly startPileId: SpaceId;
    readonly endPileId: SpaceId;
    pieces: Map<PieceId, Piece>;

    constructor(owner: PlayerEntity, startPileId: SpaceId, endPileId: SpaceId, pieces: Piece[]) {
        if (!UrUtils.isPlayer(owner)) {
            throw "Invalid player id: "+owner;
        }
        this.owner = owner;
        this.startPileId = startPileId;
        this.endPileId = endPileId;
        this.pieces = new Map(pieces.map(p => [p.id, p]));
    }

    render(): Promise<void[]> {
        console.debug("Loading player ",this.owner," pieces to ", this.startPileId);
        return Promise.all(Array.from(this.pieces.values()).map(p => p.render()));
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


function initializeDraggable(selector:JQuery<HTMLElement>, 
    options:JQueryUI.DraggableOptions = {
        disabled: true, 
        revert: "invalid",
        revertDuration: 250,
    }) {
        selector.draggable(options);
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

    // TODO consodidate into map
    export function getPiece(id: PieceId) {
        let rval:Maybe<Piece> = p1Pieces.pieces.get(id);
        if (rval !== undefined) {
            return rval;
        }
        return p2Pieces.pieces.get(id) as Piece;
    }

    let moveHander:(pid:PieceId,sid:SpaceId)=>void;

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
        initializeDraggable($('.startingArea > div'));
        
        console.debug("Configuring drag/drop for spaces.");
        $('.space, .startingArea, .finishArea').droppable({
            disabled: true,
            drop: (event: JQueryEventObject, ui: JQueryUI.DroppableEventUIParam) => {
                ui.draggable.position({
                    my: "center",
                    at: "center",
                    of: $(event.target),
                });
                
                let tid: SpaceId = SpaceId.from($(event.target).attr('id') as string);
                var pscid: PieceId = PieceId.from($(ui.draggable).attr('id') as string);
                console.info(pscid+" dropped in "+tid);
                handlers.pieceMoved(pscid, tid);
            }
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
            Promise.resolve(movePiece(piece, space)).then(() => moveHander(piece, space));
        });
    }

    export async function movePiece(piece:PieceId, space:SpaceId): Promise<void> {
        return new Promise((resolve, reject) => {
            $(piece.selector).position({
                my: "center",
                at: "center",
                of: $(space.selector),
                using: (pos:any) => {
                    console.debug("Animating: "+piece+" to "+space);
                    $(piece.selector).animate(pos, {
                        duration: 500,
                        start: (promise) => {
                            // TODO is it possible to use this promise?
                            console.debug("Move animation: start");
                        },
                        done: () => {
                            console.debug("Move animation: done");
                            let p = UrView.getPiece(piece);
                            $(p.id.selector).remove();
                            p.container = space;
                            p.render().then(() => {
                                initializeDraggable($(p.id.selector));
                            }).then(resolve);
                        },
                        fail: () => {
                            reject();
                        },
                    });
                }
            });
        });
    }

    export function removeLegalMoveBehavior() {
        $(".pieceHolder").off("mouseenter mouseleave dblclick");
        $(".space, .finishArea").removeClass(LEGAL_MOVE_HOVER_CLASS);
    }

    export function initializePieces(mask: PlayerEntity, list: PieceId[], start: SpaceId) {
        console.debug("initializePieces", mask, list);
        return new Pieces(mask, new SpaceId(mask, 0), new SpaceId(mask, 15), list.map(pid => new Piece(pid, mask, start)));
    }

    export function updateTurnDisplay(p: PlayerEntity, name: string) {
        var message = name+"'s Turn";
        var c = (p === EntityId.PLAYER1) ? "p1" : "p2";
        $('#turnIndiator').attr("class", c).html(message);
        dice.clear();
        $('#inputArea > p').html("Roll the dice");
    }

}

export default UrView;
