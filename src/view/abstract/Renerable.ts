export interface Renderable {
    render(): Promise<void | void[]>;
}