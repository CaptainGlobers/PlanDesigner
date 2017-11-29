import { IPoint, Point, IPath, Size, Color, IGroup, Path } from '../Primitive/Primitive';
import { IShape } from '../Shapes/IShape';
import { RenderApi } from './RenderApi';
import { ShapeGrid } from '../Shapes/ShapeGrid';
import { Events } from '../Events';
import { Dialog } from '../../UI/Dialog';
import { ShapeBack } from '../Shapes/ShapeBack';
import { StageMoveController } from '../StageMoveController';
import { GraphicsSettings } from './GraphicsSettings';
import { Shape } from '../Shapes/Shape';
import { ShapeDesignerHelper } from './ShapeDesignerHelper';

export class Render {
    private _canvas: HTMLCanvasElement;
    private _shapes: Array<IShape>;
    private _renderApi: RenderApi;
    private readonly _grid: IShape = new ShapeGrid();
    private _selected: IShape = null;
    private _selectedMode: boolean = true;
    private _selectedPoint: IPoint = new Point(0, 0);
    private _events: Events;
    private _dialog: Dialog;
    public back: ShapeBack;
    public backShapes: Array<IShape>;
    public static round: number = 10;

    private _offsetX: number = 0;
    private _offsetY: number = 0;

    private _stageMoveController: StageMoveController;

    private _graphicsSettings: GraphicsSettings;

    constructor(stageContainer: HTMLElement) {
        this._canvas = document.createElement('canvas');
        this._canvas.oncontextmenu = () => { return false };
        this._canvas.onmouseup = () => { this.selected = null }
        document.oncontextmenu = () => { return false };
        this._canvas.width = window.innerWidth;
        this._canvas.height = window.innerHeight;
        stageContainer.appendChild(this._canvas);

        this._canvas.getContext('2d'); // del ?
        paper.setup(this._canvas);
        const rect: IPath = Path.Rectangle(new Point(0, 0), new Size(window.innerWidth, window.innerHeight));
        rect.fillColor = 'white';

        this._graphicsSettings = new GraphicsSettings(new Point(this._canvas.width / 2, this._canvas.height / 2));
        this._renderApi = new RenderApi(this._graphicsSettings, this._grid);
        this._renderApi.drawGrid(this._grid, this._canvas.width, this._canvas.height, 0, 0);

        this._dialog = new Dialog(this._graphicsSettings.cx, this);

        this._events = new Events(this);
        this._events.addMouseMoveListener((e: any) => this.moveShapeListener(e));
        window.setInterval(() => this.reDraw(), 5000);

        const moveCallback: (offsetX: number, offsetY: number) => void = (offsetX: number, offsetY: number) => {
            this._offsetX = offsetX;
            this._offsetY = offsetY;
            this.reDraw();
        };
        this._stageMoveController = new StageMoveController(
            this._canvas, this._graphicsSettings, moveCallback, (e: WheelEvent) => this.wheelListener(e));
    }

    private get center(): IPoint {
        return this._graphicsSettings.center;
    }

    private get zoom(): number {
        return this._graphicsSettings.zoom;
    }

    private set zoom(value: number) {
        this._graphicsSettings.zoom = value;
    }

    private wheelListener(e: WheelEvent): void {
        this.cancelCreateWallHandler();
        if (e.deltaY > 0 && this.zoom < 2) {
            this.zoom = this.zoom + 0.1;
        } else if (e.deltaY < 0 && this.zoom > 0.5) {
            this.zoom = this.zoom - 0.1;
        }
        this.reDraw();
    }

    private set selected(value: IShape) {
        this._selected = value;
        this._stageMoveController.isStageMoveable = value ? false : true;
    }

    private get selected(): IShape {
        return this._selected;
    }

    public mouseDetect(): void {
        this._stageMoveController.mouseDetect();
    }

    public setZeroOffset(): void {
        this._stageMoveController.resetOffset();
    }
    public deleteShape(shape: IShape): void {
        let item: number = this._shapes.indexOf(shape);
        if (item > -1) {
            shape.renderObject.remove();
            this.deleteShapes(shape.children, shape);
            shape.children = null;
            this._shapes.splice(item, 1);
        } else if ((shape.type === 5 || shape.type === 6 || shape.type === 7) && shape.parents) {
            item = shape.parents[0].children.indexOf(shape);
            if (item > -1) {
                shape.renderObject.remove();
                shape.parents[0].children.splice(item, 1);
            }
        } else {
            console.log('ex: delete Shape not found shape');
        }
    }

    public deleteShapes(shapes: Array<IShape>, parent?: IShape) {
        if (shapes) {
            shapes.forEach((shape: IShape) => {
                if (shape.parents && shape.parents.length < 2) { // not del control
                    shape.renderObject.remove();
                    this.deleteShapes(shape.children);
                } else if (parent) {
                    let item: number = shape.parents.indexOf(parent);
                    shape.parents.splice(item, 1);
                }
            });
        }
    }

    public splitWall(shape: IShape): void {
        const point: IPoint = new Point((shape.point1.x + shape.point2.x) / 2, (shape.point1.y + shape.point2.y) / 2);
        const point2: IPoint = new Point(shape.point2);
        shape.point2.x = point.x;
        shape.point2.y = point.y;

        const newShape: IShape = new Shape(point, point2, shape.type);
        this._shapes.push(newShape);
        this.createShape(newShape);

        newShape.children[1].renderObject.remove();
        newShape.children[1] = shape.children[1];
        newShape.children[1].point1.x = newShape.point2.x;
        newShape.children[1].point1.y = newShape.point2.y;

        const indexParent: number = shape.children[1].parents.indexOf(shape);
        shape.children[1].parents.splice(indexParent, 1);
        shape.children[1] = newShape.children[0];

        newShape.children[0].parents.push(shape);
        newShape.children[1].parents.push(newShape);
        newShape.children[0].renderObject.insertAbove(this._menu[0]);
        newShape.children[1].renderObject.insertAbove(this._menu[0]);
    }

    public clear(): void {
        ShapeDesignerHelper.shapeClear(this._shapes);
        ShapeDesignerHelper.shapeClear(this.backShapes);
        if (this.back && this.back.renderObject) {
            this.back.renderObject.remove();
            this.back.renderObject = null;
        }
    }

    public set shapes(value: Array<IShape>) {
        this._shapes = value;
    }

    public inBack(): void {
        this.back.scale += 0.01;
        this._renderApi.drawBack(this.back, this._offsetX, this._offsetY, this._grid);
    }

    public outBack(): void {
        this.back.scale -= 0.01;
        this._renderApi.drawBack(this.back, this._offsetX, this._offsetY, this._grid);
    }

    public delBack(): void {
        if (this.back.renderObject) {
            this.back.renderObject.remove();
        }
    }

    public hideBack(): void {
        this.back.renderObject.opacity = 0;
    }

    public showBack(): void {
        this.back.renderObject.opacity = 0.6;
    }

    public loadBack(loadSuccess: Function): void {
        const fileReader: FileReader = new FileReader();
        fileReader.onload = (e: any) => {
            this.back.point1 = this._renderApi.originalPosition(this.center.x - this._offsetX * this.zoom, this.center.y - this._offsetY * this.zoom);
            this.back.img = e.target.result;
            this._renderApi.drawBack(this.back, this._offsetX, this._offsetY, this._grid);
            loadSuccess();
        };
        fileReader.onerror = (e: any) => alert('File not read ' + e.target.error.code);

        const input: HTMLInputElement = document.createElement('input');
        input.type = 'file';
        input.onchange = () => fileReader.readAsDataURL(input.files[0]);
        input.click();
    }

    public setLevel(): void {
        const createShapes: Function = (shape: IShape) => {
            if (shape.type === 11 || shape.type === 12) {
                shape.renderObject.insertAbove(this._menu[0]);
            }
            if (shape.children) {
                shape.children.forEach((item: IShape) => createShapes(item));
            }
            this.setShapeHandlers(shape);
        }
        this.reDraw();
        this._shapes.forEach((item: IShape) => createShapes(item));
    }

    public reDraw(): void {
        if (this._shapes) {
            this._shapes.forEach((item: IShape) => this.renderShape(item));
        }
        this._renderApi.drawGrid(this._grid, this._canvas.width, this._canvas.height, this._offsetX, this._offsetY);
        this.backShapesDraw(this.backShapes);
        if (this.back && this.back.img) {
            this._renderApi.drawBack(this.back, this._offsetX, this._offsetY, this._grid);
        }
        paper.project.view.update();
    }

    private backShapesDraw(backShapes: Array<IShape>): void {
        if (backShapes) {
            backShapes.forEach((shape: IShape) => {
                if (shape.type === 1 || shape.type === 2 || shape.type === 3) {
                    this._renderApi.renderShapeBack(shape, this._offsetX, this._offsetY);
                    shape.renderObject.fillColor = new Color(0, 0, 0, 0);
                    shape.renderObject.insertBelow(this._grid.renderObject);
                    shape.renderObject.onMouseEnter = null;
                    shape.renderObject.onMouseLeave = null;
                }
            })
        }
    }

    private renderShape(shape: IShape): void {
        this._renderApi.renderShape(shape, this._offsetX, this._offsetY);
    }

    private moveShape(shape: IShape, moveX: number, moveY: number): void {
        shape.point1.x = Math.round((this._startPoint1.x + moveX / this.zoom) / Render.round) * Render.round;
        shape.point2.x = Math.round((this._startPoint2.x + moveX / this.zoom) / Render.round) * Render.round;
        shape.point1.y = Math.round((this._startPoint1.y + moveY / this.zoom) / Render.round) * Render.round;
        shape.point2.y = Math.round((this._startPoint2.y + moveY / this.zoom) / Render.round) * Render.round;
        if (shape.type === 6 || shape.type === 7 || shape.type === 5) {
            shape.point1 = ShapeDesignerHelper.newPointOnLine(shape.parents[0], shape.point1);
            shape.point2 = new Point(shape.parents[0].point2.x, shape.parents[0].point2.y);
            shape.offset = shape.parents[0].point1.getDistance(shape.point1);
        }
        this.renderShape(shape);

        // recursive call moved to Render Api
        // if (shape.children) {
        //     shape.children.forEach((child: IShape, i: number) => this.moveShape(child, moveX, moveY));
        // }
    }

    public moveBack(): void {
        const rect: IPath = Path.Rectangle(new Point(0, 0), new Size(window.innerWidth, window.innerHeight));
        rect.fillColor = 'white';
        rect.opacity = 0.5;
        this.back.renderObject.insertAbove(rect);

        this.back.renderObject.onMouseDown = (event: any) => {
            this._selectedPoint.x = event.point.x - this._offsetX * this.zoom;
            this._selectedPoint.y = event.point.y - this._offsetY * this.zoom;
            this.selected = this.back;
        };

        const handler: any = () => {
            this.selected = null;
            rect.remove();
            this.back.renderObject.insertBelow(this._grid.renderObject);
            this.back.renderObject.onMouseUp = null;
            this.back.renderObject.onMouseDown = null;
            this.back.renderObject.onMouseLeave = null;
        };

        this.back.renderObject.onMouseUp = handler;
        this.back.renderObject.onMouseLeave = handler;
    }

    private moveShapeListener(event: any): void {
        if (this.selected && this._selectedMode) {
            const currentPoint: IPoint = new Point(event.point.x - this._offsetX * this.zoom, event.point.y - this._offsetY * this.zoom);
            const moveX: number = currentPoint.x - this._startMove.x;
            const moveY: number = currentPoint.y - this._startMove.y;
            this.moveShape(this.selected, moveX, moveY);
            // this._selectedPoint = curentPoint;
        }
    }

    private _startMove: IPoint = new Point(0, 0);
    private _startPoint1: IPoint = new Point(0, 0);
    private _startPoint2: IPoint = new Point(0, 0);

    public setShapeHandlers(newShape: IShape): IShape {
        const selectShape: Function = (event, calback) => {
            if (event.event.button === 0) {
                this._selectedPoint.x = event.point.x - this._offsetX * this.zoom;
                this._selectedPoint.y = event.point.y - this._offsetY * this.zoom;
                this.selected = newShape;

                this._startMove.x = event.point.x - this._offsetX * this.zoom;
                this._startMove.y = event.point.y - this._offsetY * this.zoom;
                this._startPoint1 = new Point(this.selected.point1);
                this._startPoint2 = new Point(this.selected.point2);
            } else if (event.event.button === 2) {
                if (calback) {
                    calback(event, newShape);
                }
            }
        };
        if (newShape.type === 1 || newShape.type === 2 || newShape.type === 4) {
            newShape.renderObject.onMouseDown = (event: any) => {
                selectShape(event, this._dialog.wallContext(event, newShape));
            };
        } else if (newShape.type === 5 || newShape.type === 6 || newShape.type === 7) {
            newShape.renderObject.onMouseDown = (event: any) => {
                selectShape(event, this._dialog.onwallShapeContext(event, newShape));
            };
        } else {
            newShape.renderObject.onMouseDown = (event: any) => {
                selectShape(event, null);
            };
        }

        const saveAsFunct: Function = newShape.renderObject.onMouseLeave;
        newShape.renderObject.onMouseLeave = () => {
            if (this.selected) {
                this.selected.point1.x = Math.round(this.selected.point1.x);
                this.selected.point2.x = Math.round(this.selected.point2.x);
                this.selected.point1.y = Math.round(this.selected.point1.y);
                this.selected.point2.y = Math.round(this.selected.point2.y);
            }
            this.selected = null;
            saveAsFunct();
        };
        newShape.renderObject.onMouseUp = () => {
            if (this.selected) {
                this.selected.point1.x = Math.round(this.selected.point1.x);
                this.selected.point2.x = Math.round(this.selected.point2.x);
                this.selected.point1.y = Math.round(this.selected.point1.y);
                this.selected.point2.y = Math.round(this.selected.point2.y);
            }
            this.selected = null;
        };
        return newShape;
    }

    public createShape(newShape: IShape, notDraw: boolean = false): IShape {
        const type: number = newShape.type;
        if (!notDraw) {
            this.renderShape(newShape);
            this.setShapeHandlers(newShape);
        }

        if (type === 1 || type === 2 || type === 4) {
            newShape.children = new Array();
            const point1: IPoint = newShape.point1;
            const point2: IPoint = newShape.point2;
            const control1: IShape = new Shape(point1, point2, 11);
            const control2: IShape = new Shape(point2, point1, 12);
            control1.parents = new Array();
            control2.parents = new Array();
            if (!notDraw) {
                this._renderApi.drawControl(control1, this._offsetX, this._offsetY);
                this._renderApi.drawControl(control2, this._offsetX, this._offsetY);
                control1.renderObject.insertAbove(newShape.renderObject);
                control2.renderObject.insertAbove(newShape.renderObject);
                this.setShapeHandlers(control1);
                this.setShapeHandlers(control2);
            }
            control1.type = 11;
            control2.type = 12;
            control1.parents.push(newShape);
            control2.parents.push(newShape);
            newShape.children.push(control1);
            newShape.children.push(control2);
        }
        return newShape;
    }

    public getRound(point: IPoint): IPoint {
        const original: IPoint = this._renderApi.originalPosition(point.x - this._offsetX * this.zoom, point.y - this._offsetY * this.zoom);
        original.x = Math.round(original.x / Render.round) * Render.round;
        original.y = Math.round(original.y / Render.round) * Render.round;

        const newPpoint: IPoint = this._renderApi.newPosition(original.x + this._offsetX, original.y + this._offsetY);
        return newPpoint;
    }

    private _drawWallMouseDownHandler;
    private _drawWallMouseMoveHandler;
    public cancelCreateWallHandler = () => { };

    public createWall(isChain: boolean, type: number): any {
        this.cancelCreateWallHandler();

        this._selectedMode = false;

        let line: IPath;
        let startPoint: IPoint = null;
        let startShape: IShape = null;
        let chainControl: IShape = null;

        let cancelEvent;
        let near: IShape = null;

        const onMouseDown = (event: any) => {
            if (this._drawWallMouseDownHandler && event.point.y < 35) {
                cancelEvent();
            } else if (this._drawWallMouseDownHandler) {
                this._drawWallMouseDownHandler(event);
            }
        };
        const onMouseMove = (event: any) => {
            this._drawWallMouseMoveHandler(event);
        };
        cancelEvent = () => {
            this._drawWallMouseDownHandler = null;
            this._drawWallMouseMoveHandler = null;
            startPoint = null;
            startShape = null;
            if (line) {
                line.remove();
            }
            line = null;
            this._events.removeMouseDownListener(onMouseDown);
            this._events.removeMouseMoveListener(onMouseMove);
            this._selectedMode = true;
        }

        if (this._drawWallMouseDownHandler || this._drawWallMouseMoveHandler) {
            cancelEvent();
        }

        this._drawWallMouseDownHandler = (event: any) => {
            startPoint = this.getRound(event.point);
            if (line) {
                const point1: IPoint = this._renderApi.originalPosition(line.segments[0].point.x - this._offsetX * this.zoom, line.segments[0].point.y - this._offsetY * this.zoom);
                const point2: IPoint = this._renderApi.originalPosition(line.segments[1].point.x - this._offsetX * this.zoom, line.segments[1].point.y - this._offsetY * this.zoom);
                const newShape: IShape = new Shape(point1, point2, type);
                this._shapes.push(newShape);
                this.createShape(newShape);
                if (startShape) {
                    if (startShape.type === 11 || startShape.type === 12) {
                        newShape.children[0].renderObject.remove();
                        newShape.children[0] = startShape;
                        startShape.renderObject.insertAbove(this._menu[0]);
                        startShape.parents.push(newShape);
                        startShape = null;
                    }
                }
                if (this.selected) {
                    if (this.selected.type === 11 || this.selected.type === 12) {
                        newShape.children[1].renderObject.remove();
                        newShape.children[1] = this.selected;
                        this.selected.renderObject.insertAbove(this._menu[0]);
                        this.selected.parents.push(newShape);
                    }
                }
                this.renderShape(newShape);
                if (chainControl) {
                    newShape.children[0].renderObject.remove();
                    newShape.children[0] = chainControl;
                    chainControl.parents.push(newShape);
                    chainControl.renderObject.insertAbove(this._menu[0]);
                }
                line.remove();
                line = null;
                if (!isChain) {
                    startPoint = null;
                    chainControl = null;
                } else {
                    chainControl = newShape.children[1];
                }
            } else if (this.selected) {
                startShape = this.selected;
                this.selected = null;
            }
        }

        let saveSelect: IShape;
        const startOffsetX: number = this._offsetX;
        this._drawWallMouseMoveHandler = (event: any) => {
            if (startOffsetX !== this._offsetX) {
                this.cancelCreateWallHandler();
            }
            const point2: IPoint = this.getRound(event.point);
            if (startPoint) {
                line = Path.Line(startPoint, point2);
                line.strokeColor = '#0088ff';
                line.strokeWidth = 2;
                // TODO: find paper type
                (line as any).moveAbove(this._grid.renderObject);
                startPoint = null;
            } else if (line) {
                near = this.findAround(event.point, 20 * this.zoom);
                if (near) {
                    line.segments[line.segments.length - 1].point = near.renderObject.position;
                    this.selected = near;
                    saveSelect = near;
                } else {
                    line.segments[line.segments.length - 1].point = point2;
                    if (this.selected === saveSelect) {
                        this.selected = null;
                    }
                }
            }
        }

        this.cancelCreateWallHandler = () => {
            if (this._drawWallMouseMoveHandler || this._drawWallMouseDownHandler) {
                cancelEvent(this);
            }
        }
        this._events.clearMouseDownListener();
        this._events.addMouseDownListener(onMouseDown);
        this._events.addMouseMoveListener(onMouseMove);
    }

    private findAround(point: IPoint, round: number): IShape {
        let result: IShape = null;
        const aroundShape: Function = (shapes: Array<IShape>) => {
            shapes.forEach((shape: IShape) => {
                if (shape.type === 11 || shape.type === 12) {
                    if (shape.renderObject.position.x < point.x + round && shape.renderObject.position.x > point.x - round && shape.renderObject.position.y < point.y + round && shape.renderObject.position.y > point.y - round) {
                        result = shape;
                        return;
                    }
                }
                if (shape.children) {
                    aroundShape(shape.children);
                }
            });
        }
        aroundShape(this._shapes);
        return result;
    }

    public createColumn(): any {
        this.cancelCreateWallHandler();
        this._selectedMode = false;
        let cancelEvent;

        const onMouseDown = (event: any) => {
            if (event.point.y > 35) {
                const point1: IPoint = this._renderApi.originalPosition(event.point.x - this._offsetX * this.zoom, event.point.y - this._offsetY * this.zoom);
                point1.x = Math.round(point1.x / Render.round) * Render.round;
                point1.y = Math.round(point1.y / Render.round) * Render.round;

                const point2: IPoint = new Point(point1);
                const newShape: IShape = new Shape(point1, point2, 3);
                this._shapes.push(newShape);
                this.createShape(newShape);
            } else {
                cancelEvent();
            }
        };

        cancelEvent = () => {
            this._events.removeMouseDownListener(onMouseDown);
            this._selectedMode = true;
        }

        this._events.clearMouseDownListener();
        this._events.addMouseDownListener(onMouseDown);
    }

    public createShapeOnWall(type: number): any {
        this.cancelCreateWallHandler();
        this._selectedMode = false;
        let cancelEvent;

        const onMouseDown = (event: any) => {
            if (event.event.button === 0) {
                if (event.point.y > 35 && this.selected && (this.selected.type === 1 || this.selected.type === 2 || this.selected.type === 4)) {
                    const selected: IShape = this.selected;
                    const point1: IPoint = this._renderApi.originalPosition(event.point.x - this._offsetX * this.zoom, event.point.y - this._offsetY * this.zoom);
                    const point2: IPoint = new Point(selected.point2);
                    const newPoint: IPoint = ShapeDesignerHelper.newPointOnLine(selected, point1);
                    const newShape: IShape = new Shape(newPoint, point2, type);
                    newShape.offset = selected.point1.getDistance(newPoint);
                    newShape.parents = new Array();
                    newShape.parents.push(selected);
                    selected.children.push(newShape);
                    newShape.width = 800;
                    newShape.height = 2100;
                    newShape.plane = 0;
                    this.createShape(newShape);
                    this._dialog.createDialog2(() => { }, newShape);
                } else {
                    cancelEvent();
                }
            }
        };

        cancelEvent = () => {
            this._events.removeMouseDownListener(onMouseDown);
            this._selectedMode = true;
        }

        this._events.clearMouseDownListener();
        this._events.addMouseDownListener(onMouseDown);
    }

    private _menu: Array<any>;
    public createMenu(count: number): Array<IGroup> {
        this._menu = this._renderApi.drawMenu(count, this._canvas.width, 40);

        return this._menu;
    }

    public createLeftMenu(count: number): Array<IGroup> {
        return this._renderApi.drawLeftMenu(count);
    }

    public drawStart(): IGroup {
        return this._renderApi.drawStartMenu();
    }

    //private _dialogHelper: HTMLElement;
}