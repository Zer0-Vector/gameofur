import { PlayerEntity, UrUtils, EntityId, UrHandlers, DiceList, DieValue, DiceValue, Maybe, Identifiable, Identifier, Selectable as ISelectable, DieId, SpaceId, PieceId, SimpleId as SimpleIdentifier, Containable, PlayerInfoMap } from "./utils.js";

//#region Selector classes




namespace JQuerySelectable {

    export function ofClass(className:string) {
        return new Class(className);
    }

    export function ofElement(elementName:string) {
        return new Element(elementName);
    }

    export function ofId(idName:string) {
        return new SimpleId(idName);
    }

    export function from(selectable:Selectable) {
        return Builder.from(selectable);
    }

    export function fromClass(className:string) {
        return Builder.from(new Class(className));
    }

    export function fromElement(elementName:string) {
        return Builder.from(new Element(elementName));
    }

    export abstract class Selectable implements ISelectable {
        abstract readonly selector: string;
        protected constructor(asString:string) {
            this.toString = () => asString;
        }
        get jquery() {
            return $(this.selector);
        }
    
    }

    class Element extends Selectable {
        readonly selector: string
        constructor(element: string) {
            super("<"+element+"/>");
            this.selector = element;
        }
    }
    
    interface ICollection {
        selectables: Selectable[];
    }

    abstract class Collection extends Selectable implements ICollection {
        readonly selector:string;
        readonly selectables:Selectable[];
        protected constructor(nameSeparator:string, selectorSeparator:string, first:Selectable, second:Selectable, ...more:Selectable[]) {
            super(Array.of(first, second, ...more).map(c => c instanceof Collection ? "("+c.toString()+")" : c.toString()).join(nameSeparator));
            this.selectables = Array.of(first, second, ...more);
            this.selector = this.selectables.map(c => c.selector).join(selectorSeparator);
        }
    }

    abstract class AClassSelector extends Selectable {
        constructor(name:string) {
            super(name);
        }
        protected get classList(): string {
            return this.toString();
        }
        addTo(s:ISelectable) {
            return $(s.selector).addClass(this.classList);
        }
        removeFrom(s:ISelectable) {
            return $(s.selector).removeClass(this.classList);
        }
    }

    class Class extends AClassSelector {
        readonly selector: string;
        constructor(name:string) {
            super(name);
            this.selector = "."+name;
        }
    }

    class ClassCollection extends AClassSelector implements ICollection {
        private readonly _delegate: Collection;
        constructor(delegate:Collection) {
            super(delegate.toString());
            // TODO verify all members are classes
            this._delegate  = delegate;
        }
        protected get classList(): string {
            return this._delegate.selectables.join(" ");
        }
        getClass(index:number) {
            return this._delegate.selectables[index] as AClassSelector;
        }
        get selectables() {
            return this._delegate.selectables;
        }
        get selector(): string {
            return this._delegate.selector;
        }
    }
    
    class Builder {
        private _product:Selectable;
        private constructor(initial:Selectable) {
            this._product = initial;
        }
    
        public static from(selectable:Selectable) {
            return new Builder(selectable);
        }
    
        public build() {
            return this._product;
        }

        public buildClassCollection() {
            if (this._product instanceof Collection) {
                return new ClassCollection(this._product);
            }
            throw "Not a collection";
        }

        public and(selectable:Selectable) {
            this._product = new Conjunction(this._product, selectable);
            return this;
        }
        
        public andClass(className:string) {
            return this.and(new Class(className));
        }
    
        public or(selectable:Selectable) {
            this._product = new Disjunction(this._product, selectable);
            return this;
        }

        public orClass(className:string) {
            return this.or(new Class(className));
        }
    
        public decendent(decendent:Selectable) {
            this._product = new DecendentHeirarchy(this._product, decendent);
            return this;
        }

        public decendentClass(className:string) {
            return this.decendent(new Class(className));
        }
    
        public child(child:Selectable) {
            this._product = new DirectDecendentHeirarchy(this._product, child);
            return this;
        }
    
        public childClass(className:string) {
            return this.child(new Class(className));
        }
    
        public childElement(elementName:string) {
            return this.child(new Element(elementName));
        }
    }

    class Disjunction extends Collection {
        constructor(first:Selectable, second:Selectable, ...more:Selectable[]) {
            super(" | ", ", ", first, second, ...more);
        }
    }
    
    class Conjunction extends Collection {
        constructor(first:Selectable, second:Selectable, ...more:Selectable[]) {
            super(" & ", "", first, second, ...more);
        }
    }
    
    class DecendentHeirarchy extends Collection {
        constructor(first:Selectable, second:Selectable, ...more:Selectable[]) {
            super(" ", " ", first, second, ...more);
        }
    }
    
    class DirectDecendentHeirarchy extends Collection {
        constructor(first:Selectable, second:Selectable, ...more:Selectable[]) {
            super(" > ", " > ", first, second, ...more);
        }
    }

    export abstract class Id<ID extends Identifier> extends Selectable implements Identifiable<ID> {
        readonly abstract id: ID;
        constructor(id:string) {
            super(id);
        }
        get selector() {
            return this.id.selector;
        }
    }
    
    class SimpleId extends Id<SimpleIdentifier> {
        id: SimpleIdentifier;
        constructor(id:string) {
            super(id);
            this.id = SimpleIdentifier.get(id);
        }
    }
}







//#endregion

namespace Selectors {
    export const AllPieceContainers = JQuerySelectable.ofClass("pieceHolder");
    export const PieceInMotion = JQuerySelectable.ofClass("ur-piece-in-motion");
    export const PieceHover = JQuerySelectable.ofClass("ur-piece-hover");
    export const AllSpaces = JQuerySelectable.ofClass("space");
    export const StartingAreas = JQuerySelectable.ofClass("startingArea");
    export const FinishAreas = JQuerySelectable.ofClass("finishArea");
    export const DropTargets = JQuerySelectable.from(FinishAreas).or(AllSpaces).build();
    export const NoLegalMoves = JQuerySelectable.ofClass("ur-no-moves");
    export const LegalMoveHover = JQuerySelectable.ofClass("ur-legal-move-space");
    export const SpaceOccupied = JQuerySelectable.ofClass("ur-occupied");
    export const MoveTarget = JQuerySelectable.ofClass("ur-move-target");

    export const TurnIndicator = JQuerySelectable.ofId("turnIndicator");
    export const InputArea = JQuerySelectable.ofId("inputArea");
    export const DiceFeedback = JQuerySelectable.from(InputArea).childElement("p").build();
    
    export const PlayerClasses = JQuerySelectable.fromClass("p1").orClass("p2").buildClassCollection();

    export const DieRotationClasses = JQuerySelectable.fromClass("r120").orClass("r240").buildClassCollection();
    export const GameArea = JQuerySelectable.ofId("gameArea");
    
    export const Player1Scoreboard = JQuerySelectable.fromClass("scoreboard").andClass("p1").build();
    export const Player2Scoreboard = JQuerySelectable.fromClass("scoreboard").andClass("p2").build();
    export const Scoreboards = JQuerySelectable.from(Player1Scoreboard).or(Player2Scoreboard).buildClassCollection();

    export const Player1ScoreValue = JQuerySelectable.from(Player1Scoreboard).decendentClass("score").build();
    export const Player2ScoreValue = JQuerySelectable.from(Player2Scoreboard).decendentClass("score").build();


    export const TurnIndicatorClass = JQuerySelectable.ofClass("yourturn");
}

interface Renderable {
    render(): Promise<void | void[]>;
}

interface Updateable<UpdateDescriptor> {
    update(update?:UpdateDescriptor): Promise<void>;
}

class Die extends JQuerySelectable.Id<DieId> implements Updateable<DieValue>, Renderable {
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
            Selectors.DieRotationClasses.getClass(orientation).addTo(this);
        } else {
            return this.render();
        }
    }

    clear() {
        $(this.id.selector).empty();
    }
}

class RollInfo implements Updateable<DiceValue>, Identifiable<SimpleIdentifier> {
    readonly id: SimpleIdentifier;
    constructor() {
        this.id = SimpleIdentifier.get("rollInfo");
    }
    async update(update: DiceValue): Promise<void> {
        $(this.id.selector).html("You rolled: <em class=\"rollValue\">"+update+"</em>");
    }
    async rolling(): Promise<void> {
        $(this.id.selector).html("Rolling...");
    };
}

class Dice implements Updateable<DiceList>, Identifiable<SimpleIdentifier>{
    readonly id: SimpleIdentifier;
    readonly dice: [Die, Die, Die, Die];
    constructor() {
        this.id = SimpleIdentifier.get("diceCup");
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

class HtmlButton extends JQuerySelectable.Selectable implements Enableable, Identifiable<SimpleIdentifier>, ISelectable {
    id: SimpleIdentifier;
    constructor(id: string) {
        super(id);
        this.id = SimpleIdentifier.get(id);
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

class CheckBox extends JQuerySelectable.Selectable implements Identifiable<SimpleIdentifier> {
    id: SimpleIdentifier;
    selector: string;
    constructor(id: string) {
        super(id);
        this.id = SimpleIdentifier.get(id);
        this.selector = "#"+this.id;
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

    export const checkboxes = {
        autopass: new CheckBox("chxAutoPass"),
        autoroll: new CheckBox("chxAutoRoll"),
    }

    // TODO consodidate into map
    export function getPiece(id: PieceId) {
        let rval:Maybe<Piece> = p1Pieces.pieces.get(id);
        if (rval !== undefined) {
            return rval;
        }
        return p2Pieces.pieces.get(id) as Piece;
    }

    function getPieces(player: PlayerEntity) {
        switch (player) {
            case EntityId.PLAYER1:
                return p1Pieces;
            case EntityId.PLAYER2:
                return p2Pieces;
            default:
                throw "Not a player id: "+player;
        }
    }

    let moveHander:(pid:PieceId,sid:SpaceId)=>void;

    export function initialize(handlers: UrHandlers) { // TODO fix type
        console.debug("Configuring roll/passTurn buttons.");
        
        buttons.roller.jquery.on('click', handlers.roll);
        buttons.passer.jquery.on('click', handlers.passTurn);
        buttons.starter.jquery.on('click', handlers.startGame);
        buttons.newgame.jquery.on('click', handlers.newGame);
        moveHander = handlers.pieceMoved;
        
        console.debug("Configuring checkboxes...");
        let cbh = (event:JQueryEventObject) => {
            handlers.checkboxChanged($(event.target).prop("name"), $(event.target).prop("checked"));
        };
        checkboxes.autopass.jquery.on('click', cbh);
        checkboxes.autoroll.jquery.on('click', cbh);

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
        initializeDraggable(Selectors.AllPieceContainers.jquery);
        
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
            Promise.resolve(moveAlongPath(piece, space, 300)).then(() => moveHander(piece, space));
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

    export async function movePiece(piece:PieceId, space:SpaceId, durationMs:number, updateSpaceClass:boolean=true, starting:boolean=true, ending:boolean=true): Promise<void> {
        return new Promise((resolve, reject) => {
            $(piece.selector).position({
                my: "center",
                at: "center",
                of: $(space.selector),
                using: (pos:any) => {
                    console.debug("Animating: "+piece+" to "+space);
                    $(piece.selector).animate(pos, {
                        duration: durationMs,
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
                                Selectors.PieceInMotion.removeFrom(piece);
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

    async function moveAlongPath(piece: PieceId, space:SpaceId, totalDurationMs:number): Promise<void> {
        let path = getPath(AllTurns[piece.owner], UrView.getPiece(piece).location, space)
        console.debug("Move path: ["+path.join(", ")+"]");
        const doLast = () => { 
            Selectors.MoveTarget.removeFrom(space);
        };
        Selectors.MoveTarget.addTo(space);
        if (path.length === 0) {
            await movePiece(piece, space, totalDurationMs).then(doLast);
        } else {
            let duration = totalDurationMs / (path.length + 1);
            await movePiece(piece, path[0], duration);
            for (let i = 1; i < path.length; i++) {
                await movePiece(piece, path[i], duration);
            }
            return movePiece(piece, space, duration).then(doLast);
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
        $(p.id.selector).attr("class", previousRender.attr("class") as string);
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
        let message = name+"'s Turn";
        Selectors.TurnIndicator.jquery.attr("class", Selectors.PlayerClasses.selectables[p-1].toString()).html(message);
        Selectors.TurnIndicatorClass.removeFrom(Selectors.Scoreboards);
        Selectors.TurnIndicatorClass.addTo(Selectors.Scoreboards.getClass(p-1));
        dice.clear();
        Selectors.DiceFeedback.jquery.html("Roll the dice");
    }

    export function showWinnder(p: PlayerEntity, name: String) {
        let message = name+ " Wins!";
        Selectors.TurnIndicator.jquery.attr("class", Selectors.PlayerClasses.selectables[p-1].toString()).html(message);
        dice.clear();
        Selectors.DiceFeedback.jquery.empty();
    }


    export async function startWinnerAnimation(winner: PlayerEntity) {
        removeNoMovesStyles();
        let loserPieces = Array.from(getPieces(UrUtils.getOpponent(winner)).pieces.values());

        for (let i = 0; i < loserPieces.length; i++) {
            let lp = loserPieces[i]
            let left = Math.floor((Math.random() - 0.5) * 500);
            let operator = left >= 0 ? '+=' : '-=';
            $(lp.id.selector).animate({
                top: '+=1000',
                left: operator + Math.abs(left) 
            }, {
                duration: 1500,
                easing: "easeInExpo",
            });
        }
    }

    export function updateScores(scores: PlayerInfoMap<number>) {
        console.log("Settings scores: ", scores);
        console.log(Selectors.Player1ScoreValue)
        console.log(Selectors.Player2ScoreValue)
        Selectors.Player1ScoreValue.jquery.html(""+scores[EntityId.PLAYER1]);
        Selectors.Player2ScoreValue.jquery.html(""+scores[EntityId.PLAYER2]);
    }
}

export default UrView;
