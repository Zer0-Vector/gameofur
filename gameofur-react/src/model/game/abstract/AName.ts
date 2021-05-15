export abstract class AName {
    protected constructor(name:string) {
        this.toString = () => name;
    }
}