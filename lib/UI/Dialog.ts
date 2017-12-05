import { Render } from '../Core/Render/Render';
import { IShape } from '../Core/Shapes/IShape';
import { MathCalc } from '../Core/MathCalc';
import { ColorConfig } from '../Core/Render/ColorConfig';

export class Dialog {

    private _centerX: number;
    private _dialogHelper: HTMLElement;
    private _render: Render;

    constructor(centerX: number, render: Render) {
        this._centerX = centerX - 100;
        this._render = render;
    }

    public create(): HTMLElement {
        if (this._dialogHelper) {
            this._dialogHelper.parentElement.removeChild(this._dialogHelper);
            this._dialogHelper = undefined;
        }

        const div: HTMLElement = document.createElement('div');
        div.style.position = 'fixed';
        div.style.top = '50px';
        div.style.left = this._centerX + 'px';
        div.style.backgroundColor = ColorConfig.button;
        div.style.padding = '8px';
        return div;
    }

    public contextMenu(event: any, menu: Array<any>): void {
        if (this._dialogHelper) {
            this._dialogHelper.parentElement.removeChild(this._dialogHelper);
            this._dialogHelper = undefined;
        }

        const menuContainer: HTMLElement = document.createElement('div');
        menuContainer.style.position = 'fixed';
        menuContainer.style.top = event.point.y + 'px';
        menuContainer.style.left = event.point.x + 'px';
        menuContainer.style.backgroundColor = ColorConfig.button;
        menuContainer.style.padding = '5px';

        menu.forEach((item: any) => {
            const text: HTMLElement = document.createElement('div');
            text.textContent = item.text;
            text.onclick = () => {
                menuContainer.parentElement.removeChild(menuContainer);
                this._dialogHelper = undefined;
                item.callback();
                this._render.reDraw();
            };
            text.onmouseenter = () => {
                text.style.backgroundColor = ColorConfig.dialog;
            };
            text.onmouseleave = () => {
                text.style.backgroundColor = '';
            };
            text.style.cursor = 'pointer';
            text.style.margin = '5px';
            menuContainer.appendChild(text);
        });

        document.body.appendChild(menuContainer);
        this._dialogHelper = menuContainer;
    }

    public wallContext(event: any, shape: IShape): void {
        if (event.event.button === 2) {
            const subMenu: Array<any> = [
                {
                    text: 'Внешняя несущая',
                    callback: () => { shape.type = 1; }
                }, {
                    text: 'Внутреняя несущая',
                    callback: () => { shape.type = 2; }
                }, {
                    text: 'Перегородка',
                    callback: () => { shape.type = 4; }
                }, {
                    text: 'Закрыть',
                    callback: () => { }
                }];
            const menu: Array<any> = [
                {
                    text: 'Изменить тип стены',
                    callback: () => this.contextMenu(event, subMenu)
                }, {
                    text: 'Разделить стену',
                    callback: () => this._render.splitWall(shape)
                }, {
                    text: 'Изменить параметры',
                    callback: () => this.createDialog(event, shape, (shapeItem: IShape, input: HTMLInputElement) => MathCalc.setShapeLength(shapeItem, Math.round(parseFloat(input.value))))
                }, {
                    text: 'Удалить',
                    callback: () => this._render.deleteShape(shape)
                }, {
                    text: 'Закрыть',
                    callback: () => { }
                }];
            this.contextMenu(event, menu);
        }
    }

    public onWallShapeContext(event: any, shape: IShape): void {
        if (event.event.button === 2) {
            const callback: Function = () => { };
            const menu: Array<any> = [
                {
                    text: 'Изменить параметры',
                    callback: () => this.createDialog2(callback, shape)
                }, {
                    text: 'Удалить',
                    callback: () => this._render.deleteShape(shape)
                }, {
                    text: 'Закрыть',
                    callback: () => { }
                }];
            this.contextMenu(event, menu);
        }
    }

    public createDialog(event: any, shape: IShape, clickFn: Function): void {
        const div: HTMLElement = this.create();

        const textContainer: HTMLElement = document.createElement('div');
        textContainer.textContent = 'Длина: ';
        textContainer.style.display = 'inline-block';

        const input: HTMLInputElement = document.createElement('input');
        input.style.width = '100px';
        input.value = '' + Math.round(MathCalc.getShapeLength(shape));

        const text: HTMLElement = document.createElement('div');
        text.textContent = 'mm';
        text.style.marginLeft = '2px';
        text.style.display = 'inline-block';
        const line: HTMLElement = document.createElement('div');
        div.appendChild(textContainer);
        div.appendChild(input);
        div.appendChild(text);
        div.appendChild(line);

        const button: HTMLElement = document.createElement('div');
        button.textContent = 'ok';
        button.style.padding = '5px 20px';
        button.style.marginLeft = '60px';
        button.style.marginTop = '10px';
        button.style.display = 'inline-block';
        button.style.backgroundColor = ColorConfig.dialog;
        button.style.cursor = 'pointer';

        button.onclick = () => {
            div.parentElement.removeChild(div);
            this._dialogHelper = undefined;
            clickFn(shape, input);
            this._render.reDraw();
        };

        div.appendChild(button);
        document.body.appendChild(div);
        this._dialogHelper = div;
    }

    public createDialog2(callback: Function, shape: IShape): void {
        const div: HTMLElement = this.create();

        const textContainer1: HTMLElement = document.createElement('div');
        textContainer1.textContent = 'Ширина: ';
        textContainer1.style.display = 'inline-block';
        const input1: HTMLInputElement = document.createElement('input');
        input1.style.width = '100px';
        input1.value = '' + shape.width;
        input1.style.marginLeft = '54px';
        const text1: HTMLElement = document.createElement('div');
        text1.textContent = 'mm';
        text1.style.marginLeft = '2px';
        text1.style.display = 'inline-block';
        const line1: HTMLElement = document.createElement('div');
        div.appendChild(textContainer1);
        div.appendChild(input1);
        div.appendChild(text1);
        div.appendChild(line1);

        const textContainer2: HTMLElement = document.createElement('div');
        textContainer2.textContent = 'Высота: ';
        textContainer2.style.display = 'inline-block';
        const input2: HTMLInputElement = document.createElement('input');
        input2.style.width = '100px';
        input2.style.marginLeft = '60px';
        input2.value = '' + shape.height;
        const text2: HTMLElement = document.createElement('div');
        text2.textContent = 'mm';
        text2.style.marginLeft = '2px';
        text2.style.display = 'inline-block';
        const line2: HTMLElement = document.createElement('div');
        div.appendChild(textContainer2);
        div.appendChild(input2);
        div.appendChild(text2);
        div.appendChild(line2);

        const textContainer3: HTMLElement = document.createElement('div');
        textContainer3.textContent = 'Уровень от пола: ';
        textContainer3.style.display = 'inline-block';
        const input3: HTMLInputElement = document.createElement('input');
        input3.style.width = '100px';
        input3.value = '' + shape.plane;
        const text3: HTMLElement = document.createElement('div');
        text3.textContent = 'mm';
        text3.style.marginLeft = '2px';
        text3.style.display = 'inline-block';
        const line3: HTMLElement = document.createElement('div');
        div.appendChild(textContainer3);
        div.appendChild(input3);
        div.appendChild(text3);
        div.appendChild(line3);

        const button: HTMLElement = document.createElement('div');
        button.textContent = 'ok';
        button.style.padding = '5px 20px';
        button.style.marginLeft = '100px';
        button.style.marginTop = '10px';
        button.style.display = 'inline-block';
        button.style.backgroundColor = ColorConfig.dialog;
        button.style.cursor = 'pointer';

        button.onclick = () => {
            div.parentElement.removeChild(div);
            this._dialogHelper = undefined;
            shape.width = parseInt(input1.value, 10);
            shape.height = parseInt(input2.value, 10);
            shape.plane = parseInt(input3.value, 10);
            callback();
            this._render.reDraw();
        };

        div.appendChild(button);
        document.body.appendChild(div);
        this._dialogHelper = div;
    }
}