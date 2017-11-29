import { Render } from '../Core/Render/Render';

export class TopMenu {
    private _menu: Array<any>;
    private _render: Render;

    constructor(render: Render) {
        this._render = render;

        this._menu = this._render.createMenu(8);

        this._menu[1].children[2].content = 'Проект';

        this._menu[1].children[3].children[0].children[1].content = 'Создать новый';
        this._menu[1].children[3].children[0].onClick = () => this._newProject();
        this._menu[1].children[3].children[1].children[1].content = 'Сохранить проект';
        this._menu[1].children[3].children[1].onClick = () => this._saveProject();
        this._menu[1].children[3].children[2].children[1].content = 'Загрузить проект';
        this._menu[1].children[3].children[2].onClick = () => this._loadProject();
        this._menu[1].children[3].children[3].visible = false;
        this._menu[1].children[3].children[4].visible = false;

        this._menu[2].children[2].content = 'Курсор';
        this._menu[2].children[3].children[0].visible = false;
        this._menu[2].children[3].children[1].visible = false;
        this._menu[2].children[3].children[2].visible = false;
        this._menu[2].children[3].children[3].visible = false;
        this._menu[2].children[3].children[4].visible = false;

        this._menu[3].children[2].content = 'Стена';
        this._menu[3].children[3].children[0].children[1].content = 'Добавить внешнюю несущую стену';
        this._menu[3].children[3].children[0].onClick = () => this._render.createWall(false, 1);
        this._menu[3].children[3].children[1].children[1].content = 'Добавить цепочку внешних несущих стен';
        this._menu[3].children[3].children[1].onClick = () => this._render.createWall(true, 1);
        this._menu[3].children[3].children[2].children[1].content = 'Добавить внутренюю несущую стену';
        this._menu[3].children[3].children[2].onClick = () => this._render.createWall(false, 2);
        this._menu[3].children[3].children[3].children[1].content = 'Добавить перегородку';
        this._menu[3].children[3].children[3].onClick = () => this._render.createWall(false, 4);
        this._menu[3].children[3].children[4].children[1].content = 'Добавить столб';
        this._menu[3].children[3].children[4].onClick = () => this._render.createColumn();

        this._menu[4].children[2].content = 'Проём';
        this._menu[4].children[3].children[0].children[1].content = 'Добавить дверь';
        this._menu[4].children[3].children[0].onClick = () => this._render.createShapeOnWall(6);
        this._menu[4].children[3].children[1].children[1].content = 'Добавить окно';
        this._menu[4].children[3].children[1].onClick = () => this._render.createShapeOnWall(5);
        this._menu[4].children[3].children[2].children[1].content = 'Пустой проём';
        this._menu[4].children[3].children[2].onClick = () => this._render.createShapeOnWall(7);
        this._menu[4].children[3].children[3].visible = false;
        this._menu[4].children[3].children[4].visible = false;

        this._menu[5].children[2].content = 'Подложка';
        this._menu[5].children[3].children[0].children[1].content = 'Загрузить';
        this._menu[5].children[3].children[0].onClick = () => {
            this._render.cancelCreateWallHandler();
            if (this._loadBackground()) {
                const loadSuccess: Function = () => this.showBackMenu();
                this._render.loadBack(loadSuccess);
            } else {
                alert('Удалите текущую подложку');
            }
        }
        this._menu[5].children[3].children[1].children[1].content = 'Удалить';
        this._menu[5].children[3].children[1].onClick = () => {
            this._render.cancelCreateWallHandler();
            if (this._backgroundRemove()) {
                this.hideBackMenu();
            } else {
                alert('На данном уровне подложки нет');
            }
        }
        this._menu[5].children[3].children[2].children[1].content = 'Скрыть';
        this._menu[5].children[3].children[2].onClick = () => {
            this._render.cancelCreateWallHandler();
            if (this._hasBackground()) {
                this._render.hideBack();
                this.hideBackMenu();
            }
        }
        this._menu[5].children[3].children[3].children[1].content = 'Отобразить';
        this._menu[5].children[3].children[3].onClick = () => {
            this._render.cancelCreateWallHandler();
            if (this._hasBackground()) {
                this.showBackMenu();
                this._render.showBack();
            }
        }
        this._menu[5].children[3].children[4].visible = false;

        this._menu[6].visible = false;
        this._menu[6].children[2].content = 'Приблизить';
        this._menu[6].onClick = () => this._render.inBack();
        this._menu[6].children[3].children[0].visible = false;
        this._menu[6].children[3].children[1].visible = false;
        this._menu[6].children[3].children[2].visible = false;
        this._menu[6].children[3].children[3].visible = false;
        this._menu[6].children[3].children[4].visible = false;

        this._menu[7].visible = false;
        this._menu[7].children[2].content = 'Отдалить';
        this._menu[7].onClick = () => this._render.outBack();
        this._menu[7].children[3].children[0].visible = false;
        this._menu[7].children[3].children[1].visible = false;
        this._menu[7].children[3].children[2].visible = false;
        this._menu[7].children[3].children[3].visible = false;
        this._menu[7].children[3].children[4].visible = false;

        this._menu[8].visible = false;
        this._menu[8].children[2].content = 'Переместить';
        this._menu[8].onClick = () => this._render.moveBack();
        this._menu[8].children[3].children[0].visible = false;
        this._menu[8].children[3].children[1].visible = false;
        this._menu[8].children[3].children[2].visible = false;
        this._menu[8].children[3].children[3].visible = false;
        this._menu[8].children[3].children[4].visible = false;
    }

    public showBackMenu(): void {
        this._menu[6].visible = true;
        this._menu[7].visible = true;
        this._menu[8].visible = true;
    }
    public hideBackMenu(): void {
        this._menu[6].visible = false;
        this._menu[7].visible = false;
        this._menu[8].visible = false;
    }

    public get menu1(): any {
        return this._menu[1];
    }

    private _newProject: () => void;
    public setFnNewProject(fn: () => void) {
        this._newProject = fn;
    }

    private _saveProject: () => void;
    public setFnSaveProject(fn: () => void) {
        this._saveProject = fn;
    }

    private _loadProject: () => void;
    public setFnLoadProject(fn: () => void) {
        this._loadProject = fn;
    }

    private _loadBackground: () => boolean;
    public setFnLoadBackground(fn: () => boolean) {
        this._loadBackground = fn;
    }

    private _backgroundRemove: () => boolean;
    public setFnBackgroundRemove(fn: () => boolean) {
        this._backgroundRemove = fn;
    }

    private _hasBackground: () => boolean;
    public setFnHasground(fn: () => boolean) {
        this._hasBackground = fn;
    }
}

        /*
                // FF and Opera bug-fix saveProject not work
                let link: Stages = {} as any;
                link = this;
                const filename: string = 'pro.json';
                let data: string;
                const form: HTMLFormElement = document.createElement('form');
                const input: HTMLInputElement = document.createElement('input');
                input.type = 'submit';
                form.appendChild(input);
                form.onsubmit = (e: Event) => {
                    e.preventDefault();
                    const foo: any = (window as any).saveAs;
                    foo(new Blob([data]), filename);
                }
                input.style.cursor = "pointer";
                input.style.width = 120 + 'px';
                input.style.position = 'fixed';
                input.style.top = 60 + 'px';
                //input.style.opacity = '0';
        
                this._topMenu.menu1.onMouseEnter = (event) => {
                    const children: any = event.target.parent.children;
                    console.log('c ' + children.count, children);
                    if (children.count === 5) {
                        children[1].fillColor = '#ffbb80';
                        children[3].visible = true;
                        document.body.style.cursor = "pointer";
                        children[0].fillColor = new Color(0, 0, 0, 0.0);
        
                        data = link.parseData(link);
                        document.body.appendChild(form);
                    }
                }
        
                this._topMenu.menu1.onMouseLeave = (event) => {
                    const children: any = event.target.parent.children;
                    console.log('c ' + children.count, children);
                    if (children.count === 5) {
                        children[1].fillColor = '#f6f0e7';
                        children[3].visible = false;
                        document.body.style.cursor = "default";
                        children[0].fillColor = null;
        
                        document.body.removeChild(form);
                    }
                }*/