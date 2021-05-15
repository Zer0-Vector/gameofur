import { Identifier } from "./Identifier";

export interface Containable<ContainerType extends Identifier> {
    location: ContainerType;
}