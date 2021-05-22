export interface Rollable {
    roll(): void;
    readonly value: number | undefined;
}