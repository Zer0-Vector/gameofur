export type PieceId = `PIECE-${PlayerId}${number}`;

export type SpaceRow = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

export type SpaceColumn = PlayerId | "M";

export type StartSpaceId = `${PlayerId}-START`;

export function isStartSpace(id: string): id is StartSpaceId {
  return id === "A-START" || id === "B-START";
}

export type FinishSpaceId = `${PlayerId}-FINISH`;
export function isFinishSpace(id: string): id is FinishSpaceId {
  return id === "A-FINISH" || id === "B-FINISH";
}


export type SpaceId =
  | `${SpaceColumn}${SpaceRow}`
  | StartSpaceId
  | FinishSpaceId;

export type PipValue = 0 | 1;

export function isPipValue(value: number): value is PipValue {
  return value === 0 || value === 1;
}

export type DiceValues = [PipValue, PipValue, PipValue, PipValue];

export function isDiceValues(values: number[]): values is DiceValues {
  return (
    values.length === 4 &&
    values.every(isPipValue)
  );
}

export type DieId = `DIE-${number}`;

export type PlayerId = "A" | "B";

