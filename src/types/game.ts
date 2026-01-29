export type PieceId = `PIECE-${PlayerId}${number}`;

export type SpaceRow = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

export type SpaceNotation =
  | `M${SpaceRow}` // middle column
  | `${PlayerId}${SpaceRow}` // player columns
  | `START` // starting area
  | `FINISH`; // finishing area

export type SpaceId = `SPACE-${SpaceNotation}`;

export type PipValue = 0 | 1;

export type DiceValues = [PipValue, PipValue, PipValue, PipValue];

export type PlayerId = "A" | "B";

