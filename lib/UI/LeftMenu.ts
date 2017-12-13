import { Stage } from '../Core/Stage';

export class LeftMenu {
    private _menu: Array<any>;
    private _stage: Stage;

    constructor(stage: Stage) {
        this._stage = stage;
        this._menu = this._stage.createLeftMenu(5);
    }

    public setButtonAction(index: number, fn: () => void): void {
        this._menu[index].onClick = fn;
    }

    public set floorNumber(text: number) {
        this._menu[2].children[2].content = text;
    }
}
