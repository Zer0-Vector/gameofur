import { EdgeGraph } from "../../utils/types";
import { StateOwner } from "./StateOwner";

export interface GraphStateProvider extends StateOwner {
    edges: EdgeGraph;
}