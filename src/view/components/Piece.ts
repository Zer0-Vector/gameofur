import { Containable } from "../../model/game/abstract/Containable";
import { Identifiable } from "../../model/game/abstract/Identifiable";
import { PieceId } from "../../model/game/ids/PieceId";
import { SpaceId } from "../../model/game/ids/SpaceId";
import { PlayerEntity } from "../../model/utils/types";
import { Renderable } from "../abstract/Renerable";


export class Piece implements Renderable, Identifiable<PieceId>, Containable<SpaceId> {
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
                $("<div id=\"" + this.id + "\" class=\"pieceHolder p" + this.owner + "\">")
                    .load(Piece.svgPath, (response, status, xhr) => {
                        if (status === "success") {
                            console.debug("Loaded piece into " + this.id.selector + " under " + this.location.selector);
                            // $(this.id.selector).position({
                            //     my: "center",
                            //     at: "center",
                            //     of: $(this.location.selector)
                            // });
                            resolve();
                        } else {
                            let reason = "Error loading " + Piece.svgPath + " into " + this.id.selector;
                            console.error(reason);
                            reject(reason);
                        }
                    }
                    )
            );
        });
    }
}
