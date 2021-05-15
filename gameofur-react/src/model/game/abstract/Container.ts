import { Identifier } from "./Identifier";

export interface Container<ContainableType extends Identifier> {
    occupants: ContainableType[];
}