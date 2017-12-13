import { ILevel } from './Core/ILevel';
import { Stage } from './Core/Stage';
import { JsonConverter } from './Core/DataConverter/JsonConverter';
import { BackgroundShape } from './Core/Shapes/ShapeBack';
import { TopMenu } from './UI/TopMenu';
import { FileHelper } from './Core/FileHelper';
import { DataConverter } from './Core/DataConverter/DataConverter';
import { LeftMenu } from './UI/LeftMenu';
import { IShape } from './Core/Shapes/IShape';

export class PlanDesigner {
    private _levels: Array<ILevel>;
    private _stage: Stage;
    private _startMenu: any;
    private _topMenu: TopMenu;
    private _leftMenu: LeftMenu;
    private _currentLevel: number = 0;

    constructor(stageContainer: HTMLElement) {
        this._stage = new Stage(stageContainer);
        this.initStartMenu();
        this.saveHack();
    }

    private selectLevel(value: number): void {
        this._stage.cancelCreateWallHandler();
        if (this._levels[value]) {
            this._currentLevel = value;
            this._stage.clear();
            if (this._levels[this._currentLevel].back.img) {
                this._topMenu.showBackMenu();
            } else {
                this._topMenu.hideBackMenu();
            }
            this.updateBackground();
            const backgroundShapes: Array<IShape> =
                (this._levels[this._currentLevel - 1] && this._levels[this._currentLevel - 1].objects)
                    ? this._levels[this._currentLevel - 1].objects : undefined;
            this._stage.setBackgroundShapes(backgroundShapes);
            this._stage.shapes = this._levels[this._currentLevel].objects;
            this._stage.setLevel();
            this._leftMenu.floorNumber = (this._currentLevel !== 0) ? this._currentLevel : -1;
        } else {
            console.warn(`Level ${value} not exist`);
        }
    }

    private loadProject(): void {
        this._stage.cancelCreateWallHandler();
        FileHelper.loadProject((e: any) => {
            const fileContent: string = e.target.result;
            this._levels = JsonConverter.getLevels(fileContent, this._stage);
            this.initMenu();
            this.selectLevel(1);
        });
    }
    /*  TODO: replace saveHack
        private saveProject(): void {
            this._stage.cancelCreateWallHandler();
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
            this._stage.cancelCreateWallHandler();
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
        this._stage.cancelCreateWallHandler();
        this._levels = new Array();
        this._currentLevel = 0;
        this.addLevel();
    }

    private createProject(): void {
        this.initMenu();
        this.newProject();
    }

    private initStartMenu(): void {
        this._startMenu = this._stage.drawStart();

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
        this._stage.cancelCreateWallHandler();
        const newFloorNumber: number = this._currentLevel + (increase ? 1 : -1);
        this._levels[newFloorNumber] = {
            floorNumber: newFloorNumber,
            objects: new Array(),
            back: new BackgroundShape()
        };

        this.selectLevel(newFloorNumber);
    }

    private updateBackground(isNew?: boolean): void {
        if (isNew) {
            this._stage.delBack();
            this._levels[this._currentLevel].back = new BackgroundShape();
        }
        this._stage.setBackground(this._levels[this._currentLevel].back);
    }

    private initMenu(): void {
        this._stage.mouseDetect();
        this._startMenu.remove();

        this._topMenu = new TopMenu(this._stage);
        this._topMenu.setFnNewProject((): void => this.newProject());
        // this._topMenu.setFnSaveProject((): void => this.saveProject());
        this._topMenu.setFnLoadProject((): void => this.loadProject());
        this._topMenu.setFnHasBackground((): boolean => this._levels[this._currentLevel].back.img);
        this._topMenu.setFnBackgroundRemove((): void => this.updateBackground(true));

        this._leftMenu = new LeftMenu(this._stage);
        this._leftMenu.setButtonAction(0, () => this.addLevel());
        this._leftMenu.setButtonAction(1, () => this.selectLevel(this._currentLevel + 1));
        this._leftMenu.setButtonAction(2, () => this._stage.setZeroOffset());
        this._leftMenu.setButtonAction(3, () => this.selectLevel(this._currentLevel - 1));
        this._leftMenu.setButtonAction(4, () => this.addLevel(false));
        this._leftMenu.floorNumber = 1;
    }
}