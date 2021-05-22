import JQuerySelectable from "../JQuerySelectable";

export namespace Selectors {
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