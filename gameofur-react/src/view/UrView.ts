import { Dice } from "./components/Dice";
import { RollInfo } from "./components/RollInfo";
import { HtmlButton } from "./components/HtmlButton";
import { CheckBox } from "./components/CheckBox";
import { PieceId } from "../model/game/ids/PieceId";
import { UrHandlers } from "../model/game/abstract/UrHandlers";
import { EntityId } from "../model/game/ids/EntityId";
import { SpaceId } from "../model/game/ids/SpaceId";
import { Maybe, PlayerEntity, PlayerInfoMap } from "../model/utils/types";
import { UrUtils } from "../model/utils/UrUtils";
import { Selectors } from "./utils/Selectors";
import { Piece } from "./components/Piece";
import { Pieces } from "./components/Pieces";


// TODO: extract behaviors to separate classes; bind with UI elements somehow
export namespace UrView {

    function initializeDraggable(selector:JQuery<HTMLElement>, 
        options:JQueryUI.DraggableOptions = {
            disabled: true, 
            revert: "invalid",
            revertDuration: 250,
        }) {
            selector.draggable(options);
    }

    export let p1Pieces: Pieces;
    export let p2Pieces: Pieces;
    export let dice: Dice = new Dice();
    export let rollInfo: RollInfo = new RollInfo();

    export const buttons = {
        roller: new HtmlButton('roller'),
        passer: new HtmlButton('passer'),
        starter: new HtmlButton('starter'),
        newgame: new HtmlButton('newgame'),
    };

    export const checkboxes = {
        autopass: new CheckBox("chxAutoPass"),
        autoroll: new CheckBox("chxAutoRoll"),
    };

    // TODO consodidate into map
    export function getPiece(id: PieceId) {
        let rval: Maybe<Piece> = p1Pieces.pieces.get(id);
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
                throw "Not a player id: " + player;
        }
    }

    let moveHander: (pid: PieceId, sid: SpaceId) => void;

    export function initialize(handlers: UrHandlers) {
        console.debug("Configuring roll/passTurn buttons.");

        buttons.roller.jquery.on('click', handlers.roll);
        buttons.passer.jquery.on('click', handlers.passTurn);
        buttons.starter.jquery.on('click', handlers.startGame);
        buttons.newgame.jquery.on('click', handlers.newGame);
        moveHander = handlers.pieceMoved;

        console.debug("Configuring checkboxes...");
        let cbh = (event: JQueryEventObject) => {
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
                console.info(pscid + " dropped in " + tid);
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

    function dropControl(space: SpaceId, enabled: boolean, scope?: string) {
        let action = enabled ? "enable" : "disable";
        console.debug(action + " drop for " + space.selector + " in scope:" + scope || "");
        $(space.selector).droppable("option", "scope", scope);
        $(space.selector).droppable(action);
    }

    function dragControl(piece: PieceId, enabled: boolean, scope?: string) {
        let action = enabled ? "enable" : "disable";
        console.debug(action + " drag for " + piece.selector + " in scope:" + scope || "");
        $(piece.selector).draggable("option", "scope", scope);
        $(piece.selector).draggable(action);
    }

    export function dndControl(piece: PieceId, space: SpaceId, enabled: boolean, scope?: string) {
        console.assert(!enabled || scope !== undefined, "Cannot enable dnd for pieces/spaces unless specifying a scope");
        dragControl(piece, enabled, scope);
        dropControl(space, enabled, scope);
    }

    export function applyLegalMoveBehavior(piece: PieceId, space: SpaceId) {
        console.debug("Legal move behavior for " + piece + " and " + space);
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
        console.debug("Apply no moves styles: " + piece);
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

    export async function movePiece(piece: PieceId, space: SpaceId, durationMs: number, updateSpaceClass: boolean = true, starting: boolean = true, ending: boolean = true): Promise<void> {
        return new Promise((resolve, reject) => {
            $(piece.selector).position({
                my: "center",
                at: "center",
                of: $(space.selector),
                using: (pos: any) => {
                    console.debug("Animating: " + piece + " to " + space);
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

    async function moveAlongPath(piece: PieceId, space: SpaceId, totalDurationMs: number): Promise<void> {
        let path = getPath(AllTurns[piece.owner], UrView.getPiece(piece).location, space);
        console.debug("Move path: [" + path.join(", ") + "]");
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

    function getPath(turns: SpaceId[], source: SpaceId, destination: SpaceId): SpaceId[] {
        if (destination.trackId < source.trackId) {
            throw "There is no path from " + source + " to " + destination;
        }
        if (source.trackId === destination.trackId || destination.trackId - source.trackId === 1) {
            return [];
        }
        return turns.filter(turn => {
            return turn.trackId > source.trackId && turn.trackId < destination.trackId;
        });
    }

    async function relocatePiece(piece: PieceId, space: SpaceId, updateSpaceClass: boolean): Promise<void> {
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
        let message = name + "'s Turn";
        Selectors.TurnIndicator.jquery.attr("class", Selectors.PlayerClasses.selectables[p - 1].toString()).html(message);
        Selectors.TurnIndicatorClass.removeFrom(Selectors.Scoreboards);
        Selectors.TurnIndicatorClass.addTo(Selectors.Scoreboards.getClass(p - 1));
        dice.clear();
        Selectors.DiceFeedback.jquery.html("Roll the dice");
    }

    export function showWinnder(p: PlayerEntity, name: String) {
        let message = name + " Wins!";
        Selectors.TurnIndicator.jquery.attr("class", Selectors.PlayerClasses.selectables[p - 1].toString()).html(message);
        dice.clear();
        Selectors.DiceFeedback.jquery.empty();
    }


    export async function startWinnerAnimation(winner: PlayerEntity) {
        removeNoMovesStyles();
        let loserPieces = Array.from(getPieces(UrUtils.getOpponent(winner)).pieces.values());

        for (let i = 0; i < loserPieces.length; i++) {
            let lp = loserPieces[i];
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
        Selectors.Player1ScoreValue.jquery.html("" + scores[EntityId.PLAYER1]);
        Selectors.Player2ScoreValue.jquery.html("" + scores[EntityId.PLAYER2]);
    }
}
