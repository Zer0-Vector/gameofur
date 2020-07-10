import { PlayerEntity, UrUtils, EntityId, UrHandlers, DiceList, DieValue, DiceValue, Maybe, Identifiable, Identifier, Selectable, DieId, SpaceId, PieceId, SimpleId, AName, Containable, BOARD } from "./utils.js";

//#region Selector classes
abstract class JQuerySelectable implements Selectable {
    abstract selector: string;
    get jquery() {
        return $(this.selector);
    }
}

abstract class ACssClass extends JQuerySelectable {
    protected constructor(toString:string) {
        super();
        this.toString = () => toString;
    }
    addTo(s:Selectable) {
        return $(s.selector).addClass(this.toString());
    }
    removeFrom(s:Selectable) {
        return $(s.selector).removeClass(this.toString());
    }
}

class CssClass extends ACssClass {
    readonly selector: string;
    constructor(name:string) {
        super(name);
        this.selector = "."+name;
    }
}

class CssClasses extends ACssClass {
    readonly selector: string;
    readonly classes: CssClass[];
    constructor(...classes:CssClass[]) {
        super(classes.map(c => c.toString()).join(" "));
        this.selector = classes.map(c => c.selector).join(", ");
        this.classes = classes;
    }
}

abstract class SelectableId<ID extends Identifier> extends JQuerySelectable implements Identifiable<ID> {
    readonly abstract id: ID;
    constructor(id:string) {
        super();
        this.toString = () => id;
    }
    get selector() {
        return this.id.selector;
    }
}

class SimpleSelectableId extends SelectableId<SimpleId> {
    id: SimpleId;
    constructor(id:string) {
        super(id);
        this.id = SimpleId.get(id);
    }
}
//#endregion

namespace Selectors {
    export const AllPieceContainers = new CssClass("pieceHolder");
    export const PieceInMotion = new CssClass("ur-piece-in-motion");
    export const PieceHover = new CssClass("ur-piece-hover");
    export const AllSpaces = new CssClass("space");
    export const StartingAreas = new CssClass("startingArea");
    export const FinishAreas = new CssClass("finishArea");
    export const DropTargets = new CssClasses(FinishAreas, AllSpaces);
    export const NoLegalMoves = new CssClass("ur-no-moves");
    export const LegalMoveHover = new CssClass("ur-legal-move-space");
    export const SpaceOccupied = new CssClass("ur-occupied");
    export const MoveTarget = new CssClass("ur-move-target");

    export const TurnIndicator = new SimpleSelectableId("turnIndicator");
    export const InputArea = new SimpleSelectableId("inputArea");
    export const DiceFeedback = new (class extends JQuerySelectable {
        selector: string = InputArea.selector + " > p";
        })();

    export const PlayerClasses = new CssClasses(
        new CssClass("p1"),
        new CssClass("p2")
        );

    export const DieRotationClasses = new CssClasses(
        new CssClass("r120"), 
        new CssClass("r240")
        );
    export const GameArea = new SimpleSelectableId("gameArea");
}

interface Renderable {
    render(): Promise<void | void[]>;
}

interface Updateable<UpdateDescriptor> {
    update(update?:UpdateDescriptor): Promise<void>;
}

class Die extends SelectableId<DieId> implements Updateable<DieValue>, Renderable {
    static nextId = 0;

    static readonly svgMap = {
        [0 as DieValue]: 'images/die0.svg',
        [1 as DieValue]: 'images/die1.svg'
    }

    static getNew(n:number):Die {
        if (n > 3 || n < 0) throw "Invlid Die id number: "+n;
        return new Die(DieId.get(n));
    }

    id: DieId;    
    currentView: DieValue = 0;
    
    private constructor(id:DieId) {
        super(id.toString());
        this.id = id;
    }

    get svg(): string {
        return Die.svgMap[this.currentView];
    }

    render(): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            Selectors.DieRotationClasses.removeFrom(this);
            this.jquery.load(this.svg, (response, status, xhr) => {
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
        let orientation = Math.floor(Math.random() * 3); // TODO
        this.currentView = view;
        if (orientation < 2) { // 2 === no rotation
            await this.render();
            Selectors.DieRotationClasses.classes[orientation].addTo(this);
        } else {
            return this.render();
        }
    }

    clear() {
        $(this.id.selector).empty();
    }
}

class RollInfo implements Updateable<DiceValue>, Identifiable<SimpleId> {
    readonly id: SimpleId;
    constructor() {
        this.id = SimpleId.get("rollInfo");
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
        this.id = SimpleId.get("diceCup");
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

class Piece implements Renderable, Identifiable<PieceId>, Containable<SpaceId> {
    static readonly svgPath = 'images/piece5.svg';
    readonly owner: PlayerEntity;
    readonly id: PieceId;
    location: SpaceId;

    constructor(id: PieceId, owner: PlayerEntity, initialContainer: SpaceId) {
        this.id = id;
        this.owner = owner;
        this.location = initialContainer;
    }

    render(): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            $(this.location.selector).append(
                $("<div id=\""+this.id+"\" class=\"pieceHolder p"+this.owner+"\">")
                    .load(Piece.svgPath, (response, status, xhr) => {
                        if (status === "success") {
                            console.debug("Loaded piece into "+this.id.selector+" under "+this.location.selector);
                            // $(this.id.selector).position({
                            //     my: "center",
                            //     at: "center",
                            //     of: $(this.location.selector)
                            // });
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

class HtmlButton extends JQuerySelectable implements Enableable, Identifiable<SimpleId>, Selectable {
    id: SimpleId;
    constructor(id: string) {
        super();
        this.id = SimpleId.get(id);
        this.toString = () => id;
    }
    get selector() {
        return "button"+this.id.selector;
    }
    enable(): void {
        console.debug("Enabling "+this.id);
        this.jquery.prop("disabled", false);
    }
    disable(): void {
        console.debug("Disabling "+this.id);
        this.jquery.prop("disabled", true);
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
        roller: new HtmlButton('roller'),
        passer: new HtmlButton('passer'),
        starter: new HtmlButton('starter'),
        newgame: new HtmlButton('newgame'),
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
        
        buttons.roller.jquery.on('click', handlers.roll);
        buttons.passer.jquery.on('click', handlers.passTurn);
        buttons.starter.jquery.on('click', handlers.startGame);
        buttons.newgame.jquery.on('click', handlers.newGame);
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
        Selectors.DropTargets.jquery.droppable({
            disabled: true,
            drop: async (event: JQueryEventObject, ui: JQueryUI.DroppableEventUIParam) => {
                let tid: SpaceId = SpaceId.from($(event.target).attr('id') as string);
                var pscid: PieceId = PieceId.from($(ui.draggable).attr('id') as string);
                console.info(pscid+" dropped in "+tid);
                await relocatePiece(pscid, tid, true);
                handlers.pieceMoved(pscid, tid);
            }
        });
        Selectors.DropTargets.jquery.droppable("option", "classes.ui-droppable-hover", Selectors.PieceHover.toString());
    }

    export function disableDnD() {
        console.debug("Disabling all drag and drop");
        Selectors.AllPieceContainers.jquery.draggable("option", {
            disabled: true,
            scope: undefined,
        });
        Selectors.DropTargets.jquery.droppable({
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

    export function applyLegalMoveBehavior(piece:PieceId, space:SpaceId) {
        console.debug("Legal move behavior for "+piece+" and "+space);
        $(piece.selector).on("mouseenter mouseover", () => {
            // FIXME when this is registered and the mouse is already over the element, the event does not trigger.
            Selectors.LegalMoveHover.addTo(space);
        }).on("mouseleave", () => {
            Selectors.LegalMoveHover.removeFrom(space);
        }).on("dblclick", (event) => {
            Promise.resolve(moveAlongPath(piece, space)).then(() => moveHander(piece, space));
        });
    }

    export function applyNoMovesStyles(piece: PieceId) {
        console.debug("Apply no moves styles: "+piece)
        Selectors.NoLegalMoves.addTo(piece);
    }
    
    export function removeNoMovesStyles() {
        console.debug("Remove no moves styles from all pieces");
        Selectors.NoLegalMoves.removeFrom(Selectors.AllPieceContainers);
    }

    const AllTurns = {
        [EntityId.PLAYER1]: [
            SpaceId.get(EntityId.PLAYER1, 4), 
            SpaceId.get(EntityId.MIDDLE, 5),
            SpaceId.get(EntityId.MIDDLE, 12),
            SpaceId.get(EntityId.PLAYER1, 13), 
        ],
        [EntityId.PLAYER2]: [
            SpaceId.get(EntityId.PLAYER2, 4),
            SpaceId.get(EntityId.MIDDLE, 5),
            SpaceId.get(EntityId.MIDDLE, 12),
            SpaceId.get(EntityId.PLAYER2, 13),
        ],
    };

    export async function movePiece(piece:PieceId, space:SpaceId, updateSpaceClass:boolean=true, starting:boolean=true, ending:boolean=true): Promise<void> {
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
                            if (starting) {
                                Selectors.PieceInMotion.addTo(piece);
                            }
                        },
                        done: async () => {
                            console.debug("Move animation: done");
                            if (ending) {
                                await relocatePiece(piece, space, updateSpaceClass).then(resolve);
                            }
                        },
                        fail: () => {
                            reject();
                        },
                        always: () => {
                            if (ending) {
                                Selectors.PieceInMotion.removeFrom(piece);
                            }
                        },
                    });
                }
            });
        });
    }

    async function moveAlongPath(piece: PieceId, space:SpaceId): Promise<void> {
        let path = getPath(AllTurns[piece.owner], UrView.getPiece(piece).location, space)
        console.debug("Move path: ["+path.join(", ")+"]");
        const last = () => { Selectors.MoveTarget.removeFrom(space); };
        Selectors.MoveTarget.addTo(space);
        if (path.length === 0) {
            await movePiece(piece, space).then(last);
        } else {
            await movePiece(piece, path[0]);
            for (let i = 1; i < path.length; i++) {
                await movePiece(piece, path[i]);
            }
            return movePiece(piece, space).then(last);
        }
    }    

    function getPath(turns:SpaceId[], source:SpaceId, destination:SpaceId): SpaceId[] {
        if (destination.trackId < source.trackId) {
            throw "There is no path from "+source+" to "+destination;
        }
        if (source.trackId === destination.trackId || destination.trackId - source.trackId === 1 ) {
            return [];
        }
        return turns.filter(turn => {
            return turn.trackId > source.trackId && turn.trackId < destination.trackId;
        });
    }

    async function relocatePiece(piece: PieceId, space: SpaceId, updateSpaceClass:boolean): Promise<void> {
        removeLegalMoveBehavior();
        let p = UrView.getPiece(piece);
        if (updateSpaceClass) {
            Selectors.SpaceOccupied.removeFrom(p.location);
        }
        p.location = space;
        let previousRender = $(p.id.selector).removeAttr("id");
        await p.render();
        previousRender.remove();
        if (space.trackId > 0) {
            Selectors.SpaceOccupied.addTo(space);
        }
        initializeDraggable($(p.id.selector));
    }

    export function removeLegalMoveBehavior() {
        Selectors.AllPieceContainers.jquery.off("mouseenter mouseleave mouseover dblclick");
        Selectors.LegalMoveHover.removeFrom(Selectors.DropTargets);
    }

    export function initializePieces(mask: PlayerEntity, list: PieceId[], start: SpaceId) {
        console.debug("initializePieces", mask, list);
        return new Pieces(mask, SpaceId.get(mask, 0), SpaceId.get(mask, 15), list.map(pid => new Piece(pid, mask, start)));
    }

    export function updateTurnDisplay(p: PlayerEntity, name: string) {
        var message = name+"'s Turn";
        Selectors.TurnIndicator.jquery.attr("class", Selectors.PlayerClasses.classes[p-1].toString()).html(message);
        dice.clear();
        Selectors.DiceFeedback.jquery.html("Roll the dice");
    }
}

export default UrView;
