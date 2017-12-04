import { ILevel } from './Core/ILevel';
import { Render } from './Core/Render/Render';
import { JsonConverter } from './Core/DataConverter/JsonConverter';
import { ShapeBack } from './Core/Shapes/ShapeBack';
import { TopMenu } from './UI/TopMenu';
import { StageHelper } from './StageHelper';

export class Stages {
    private _levels: Array<ILevel>;
    private _render: Render;
    private _startMenu: any;
    private _leftMenu: any;
    private _currentLevel: number = 0;

    constructor(stageContainer: HTMLElement) {
        this._render = new Render(stageContainer);
        this.initStartMenu();
    }

    private selectLevel(value: number): void {
        this._render.cancelCreateWallHandler();
        if (this._levels[value] && this._levels[value].level === null) {
            this._currentLevel = value;
            this._render.clear();
            if (!this._levels[this._currentLevel].back) {
                this._levels[this._currentLevel].back = new ShapeBack();
            }
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
            console.log('Level ' + value + ' not exist');
        }
    }

    private initProject(fileContent: string): void {
        this._levels = JsonConverter.getLevels(fileContent, this._render);
        this.initMenu();
        this.selectLevel(1);
    }

    private loadProject(): void {
        this._render.cancelCreateWallHandler();
        StageHelper.loadProject((e: any) => this.initProject(e.target.result));
    }

    private saveProject(): void {
        this._render.cancelCreateWallHandler();
        StageHelper.saveProject(this._levels);
    }

    private newProject(): void {
        this._render.cancelCreateWallHandler();
        this._levels = new Array();
        const firstLevel = {
            level: -1,
            objects: new Array()
        };
        this._levels.push(firstLevel);
        this._currentLevel = 0;
        this.addLevel(1);
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

    private addLevel(id: number): void {
        this._render.cancelCreateWallHandler();
        id += this._currentLevel;
        const newLevel: ILevel = {
            level: null,
            objects: new Array()
        };
        this._levels.splice(id, 0, newLevel);
        this.selectLevel(id);
    }

    private addPrevLevel(): void {
        this._render.cancelCreateWallHandler();
        if (this._currentLevel === 1 && this._levels[0].level !== null) {
            this._levels[0].level = null;
            this.selectLevel(0);
        } else {
            this.addLevel(0);
        }
    }

    private _topMenu: TopMenu;

    private initMenu(): void {
        this._render.mouseDetect();
        this._startMenu.remove();
        // Call (menu create) order not to change
        this._topMenu = new TopMenu(this._render);
        this._leftMenu = this._render.createLeftMenu(5);

        this._leftMenu[0].onClick = () => this.addLevel(1);
        this._leftMenu[1].onClick = () => this.selectLevel(this._currentLevel + 1);
        this._leftMenu[2].children[2].content = '1';
        this._leftMenu[2].onClick = () => this._render.setZeroOffset();
        this._leftMenu[3].onClick = () => this.selectLevel(this._currentLevel - 1);
        this._leftMenu[4].onClick = () => this.addPrevLevel();

        this._topMenu.setFnNewProject((): void => this.newProject());
        this._topMenu.setFnSaveProject((): void => this.saveProject());
        this._topMenu.setFnLoadProject((): void => this.loadProject());

        this._topMenu.setFnLoadBackground((): boolean =>
            !this._levels[this._currentLevel].back.img);
        // TODO: Remove setFnLoadBackground
        this._topMenu.setFnHasground((): boolean =>
            this._levels[this._currentLevel].back.img);

        this._topMenu.setFnBackgroundRemove((): boolean => {
            const result: boolean = !!this._levels[this._currentLevel].back.img;
            if (result) {
                this._render.delBack();
                this._levels[this._currentLevel].back = new ShapeBack();
                this._render.back = this._levels[this._currentLevel].back;
            }

            return result;
        });
    }
}