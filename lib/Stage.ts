import { ILevel } from './Core/ILevel';
import { Render } from './Core/Render/Render';
import { JsonConverter } from './Core/DataConverter/JsonConverter';
import { ShapeBack } from './Core/Shapes/ShapeBack';
import { TopMenu } from './UI/TopMenu';
import { FileHelper } from './FileHelper';
import { DataConverter } from './Core/DataConverter/DataConverter';

export class Stages {
    private _levels: Array<ILevel>;
    private _render: Render;
    private _startMenu: any;
    private _leftMenu: any;
    private _currentLevel: number = 0;

    constructor(stageContainer: HTMLElement) {
        this._render = new Render(stageContainer);
        this.initStartMenu();
        this.saveHack();
    }

    private selectLevel(value: number): void {
        this._render.cancelCreateWallHandler();
        if (this._levels[value]) {
            this._currentLevel = value;
            this._render.clear();
            if (this._levels[this._currentLevel].back.img) {
                this._topMenu.showBackMenu();
            } else {
                this._topMenu.hideBackMenu();
            }
            this._render.back = this._levels[this._currentLevel].back;
            this._render.backShapes = (this._levels[this._currentLevel - 1] && this._levels[this._currentLevel - 1].objects) ? this._levels[this._currentLevel - 1].objects : undefined;
            this._render.shapes = this._levels[this._currentLevel].objects;
            this._render.setLevel();
            this._leftMenu[2].children[2].content = (this._currentLevel !== 0) ? this._currentLevel : -1;
        } else {
            console.warn(`Level ${value} not exist`);
        }
    }

    private loadProject(): void {
        this._render.cancelCreateWallHandler();
        FileHelper.loadProject((e: any) => {
            const fileContent: string = e.target.result;
            this._levels = JsonConverter.getLevels(fileContent, this._render);
            this.initMenu();
            this.selectLevel(1);
        });
    }
    /*  TODO: replace saveHack
        private saveProject(): void {
            this._render.cancelCreateWallHandler();
            FileHelper.saveProject(this._levels);
        }
        */

    private saveHack(): void {
        const filename: string = 'pro.json';
        const form: HTMLFormElement = document.createElement('form');
        const input: HTMLInputElement = document.createElement('input');
        input.type = 'submit';
        form.appendChild(input);
        form.onsubmit = (e: Event) => {
            this._render.cancelCreateWallHandler();
            const data: string = DataConverter.getJson(this._levels);
            e.preventDefault();
            const foo: any = (window as any).saveAs;
            foo(new Blob([data]), filename);
        };
        input.style.cursor = 'pointer';
        input.style.width = 120 + 'px';
        input.style.position = 'fixed';
        input.style.top = 60 + 'px';

        document.body.appendChild(form);
        // input.style.opacity = '0';
    }

    private newProject(): void {
        this._render.cancelCreateWallHandler();
        this._levels = new Array();
        this._currentLevel = 0;
        this.addLevel();
    }

    private createProject(): void {
        this.initMenu();
        this.newProject();
    }

    private initStartMenu(): void {
        this._startMenu = this._render.drawStart();

        this._startMenu.children[1].content = 'Создать проект';
        this._startMenu.children[2].onClick = () => this.createProject();
        this._startMenu.children[3].content = 'Загрузить проект';
        this._startMenu.children[4].onClick = () => this.loadProject();
    }

    /* NOT DEL!
    private delLevel(): void {
        const len: number = this._levels.length - 1;
        if (len > 1 && this._currentLevel > 0) {
            this._levels.splice(this._currentLevel, 1);
            this._currentLevel--;
            this.selectLevel(this._currentLevel);
        } else if (len > 1 && this._currentLevel === 0) {
            this._levels.splice(this._currentLevel, 1);
            this.selectLevel(this._currentLevel);
        } else if (len === 1) {
            this._levels.splice(this._currentLevel, 1);
            this.addLevel();
        }
    }
    */

    private addLevel(increase: boolean = true): void {
        this._render.cancelCreateWallHandler();
        const newFloorNumber: number = this._currentLevel + (increase ? 1 : -1);
        this._levels[newFloorNumber] = {
            floorNumber: newFloorNumber,
            objects: new Array(),
            back: new ShapeBack()
        };

        this.selectLevel(newFloorNumber);
    }

    private _topMenu: TopMenu;

    private initMenu(): void {
        this._render.mouseDetect();
        this._startMenu.remove();
        // Call (menu create) order not to change
        this._topMenu = new TopMenu(this._render);
        this._leftMenu = this._render.createLeftMenu(5);

        this._leftMenu[0].onClick = () => this.addLevel();
        this._leftMenu[1].onClick = () => this.selectLevel(this._currentLevel + 1);
        this._leftMenu[2].children[2].content = '1';
        this._leftMenu[2].onClick = () => this._render.setZeroOffset();
        this._leftMenu[3].onClick = () => this.selectLevel(this._currentLevel - 1);
        this._leftMenu[4].onClick = () => this.addLevel(false);

        this._topMenu.setFnNewProject((): void => this.newProject());
        // this._topMenu.setFnSaveProject((): void => this.saveProject());
        this._topMenu.setFnLoadProject((): void => this.loadProject());

        this._topMenu.setFnHasBackground((): boolean =>
            this._levels[this._currentLevel].back.img);

        this._topMenu.setFnBackgroundRemove((): void => {
            this._render.delBack();
            this._render.back = this._levels[this._currentLevel].back = new ShapeBack();
        });
    }
}