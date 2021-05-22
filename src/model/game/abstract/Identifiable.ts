import { Identifier } from "./Identifier";

export interface Identifiable<ID extends Identifier> {
    readonly id: ID;
}