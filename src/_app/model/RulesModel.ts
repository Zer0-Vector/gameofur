import type { PlayerId, SpaceId } from "@/types/game"

export type RulesModelType = {
  paths: {
    [playerId in PlayerId]: SpaceId[];
  }
}
export const RulesModel: RulesModelType = {
  paths: {
    A: ["A-START", "A4", "A3", "A2", "A1", "M1", "M2", "M3", "M4", "M5", "M6", "M7", "M8", "A8", "A7", "A-FINISH"],
    B: ["B-START", "B4", "B3", "B2", "B1", "M1", "M2", "M3", "M4", "M5", "M6", "M7", "M8", "B8", "B7", "B-FINISH"],
  }
}