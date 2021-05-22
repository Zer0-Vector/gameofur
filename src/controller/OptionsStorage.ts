import { GameOptions } from "../model/game/GameOptions";

export class OptionsStorage {
    private static readonly STORAGE_KEY = "RoyalGameOfUrOptions";
    private _options: GameOptions = new GameOptions();
    get() {
        return this._options;
    }
    save() {
        localStorage.setItem(OptionsStorage.STORAGE_KEY, JSON.stringify(this._options));
    }
    load() {
        let stored = localStorage.getItem(OptionsStorage.STORAGE_KEY);
        if (stored !== null && stored.length > 0) {
            this._options = JSON.parse(stored);
        }
    }
}