import { RenderApi } from './RenderApi';
import { Events } from '../Events';
import { Dialog } from '../../UI/Dialog';
import { StageMoveController } from '../StageMoveController';
import { IShape } from '../Shapes/IShape';
import { IPoint, Point, IPath, Path, Size } from '../Primitive/Primitive';
import { Shape } from '../Shapes/Shape';
import { ShapeDesignerHelper } from './ShapeDesignerHelper';
import { BackgroundShape } from '../Shapes/ShapeBack';
import { GraphicsSettings } from './GraphicsSettings';
import { ColorConfig } from './ColorConfig';

export class RenderEvents {
    private static round: number = 10;
    private readonly _events: Events;
    private readonly _dialog: Dialog;
    private readonly _stageMoveController: StageMoveController;

    private _shapes: Array<IShape>;
    private _allowSelect: boolean = true;

    public constructor(dialog: Dialog, stageMoveController: StageMoveController) {
        this._dialog = dialog;
        this._stageMoveController = stageMoveController;

        this._events = new Events();
        this._events.addMouseMoveListener((e: any) => this.moveShapeListener(e));
    }

    public mouseDetect(): void {
        this._stageMoveController.mouseDetect();
    }

    public resetOffset(): void {
        this._stageMoveController.resetOffset();
    }

    public setShapes(shapes: Array<IShape>): void {
        this._shapes = shapes;
    }

    private _selected: IShape = undefined;
    public get selected(): IShape {
        return this._selected;
    }
    public set selected(value: IShape) {
        this._selected = value;
        this._stageMoveController.isStageMoveable = value ? false : true;
    }

    // del
    private renderShape(shape: IShape): void {
        RenderApi.renderShape(shape);
    }

    public splitWall(shape: IShape): void {
        const point: IPoint = new Point((shape.point1.x + shape.point2.x) / 2, (shape.point1.y + shape.point2.y) / 2);
        const point2: IPoint = new Point(shape.point2);
        shape.point2.x = point.x;
        shape.point2.y = point.y;

        const newShape: IShape = new Shape(point, point2, shape.type);
        this._shapes.push(newShape);
        this.createShapeControlsAndRender(newShape);

        newShape.children[1].renderObject.remove();
        newShape.children[1] = shape.children[1];
        newShape.children[1].point1.x = newShape.point2.x;
        newShape.children[1].point1.y = newShape.point2.y;

        const indexParent: number = shape.children[1].parents.indexOf(shape);
        shape.children[1].parents.splice(indexParent, 1);
        shape.children[1] = newShape.children[0];

        newShape.children[0].parents.push(shape);
        newShape.children[1].parents.push(newShape);
        this.insertAboveMenu(newShape.children[0]);
        this.insertAboveMenu(newShape.children[1]);
    }

    private moveShape(shape: IShape, moveX: number, moveY: number): void {
        shape.point1.x = Math.round((this._startPoint1.x + moveX / this.zoom) / RenderEvents.round) * RenderEvents.round;
        shape.point2.x = Math.round((this._startPoint2.x + moveX / this.zoom) / RenderEvents.round) * RenderEvents.round;
        shape.point1.y = Math.round((this._startPoint1.y + moveY / this.zoom) / RenderEvents.round) * RenderEvents.round;
        shape.point2.y = Math.round((this._startPoint2.y + moveY / this.zoom) / RenderEvents.round) * RenderEvents.round;
        if (shape.type === 6 || shape.type === 7 || shape.type === 5) {
            shape.point1 = ShapeDesignerHelper.newPointOnLine(shape.parents[0], shape.point1);
            shape.point2 = new Point(shape.parents[0].point2.x, shape.parents[0].point2.y);
            shape.offset = shape.parents[0].point1.getDistance(shape.point1);
        }
        this.renderShape(shape);
    }

    public moveBack(background: BackgroundShape): void {
        const rect: IPath = Path.Rectangle(new Point(0, 0), new Size(window.innerWidth, window.innerHeight));
        rect.fillColor = 'white';
        rect.opacity = 0.5;
        background.renderObject.insertAbove(rect);

        background.renderObject.onMouseDown = (event: any) => {
            this.selected = background;
        };

        const handler: any = () => {
            this.selected = undefined;
            rect.remove();
            GraphicsSettings.current.insertBelowGrid(background.renderObject);
            background.renderObject.onMouseUp = undefined;
            background.renderObject.onMouseDown = undefined;
            background.renderObject.onMouseLeave = undefined;
        };

        background.renderObject.onMouseUp = handler;
        background.renderObject.onMouseLeave = handler;
    }

    private moveShapeListener(event: any): void {
        if (this.selected && this._allowSelect) {
            const currentPoint: IPoint = new Point(this.getEventPointX(event.point), this.getEventPointY(event.point));
            const moveX: number = currentPoint.x - this._startMove.x;
            const moveY: number = currentPoint.y - this._startMove.y;
            this.moveShape(this.selected, moveX, moveY);
        }
    }

    private _startMove: IPoint = new Point(0, 0);
    private _startPoint1: IPoint = new Point(0, 0);
    private _startPoint2: IPoint = new Point(0, 0);

    public setShapeHandlers(newShape: IShape): IShape {
        const selectShape: Function = (event: any, callback: any) => {
            if (event.event.button === 0) {
                this.selected = newShape;

                this._startMove = new Point(this.getEventPointX(event.point), this.getEventPointY(event.point));
                this._startPoint1 = new Point(this.selected.point1);
                this._startPoint2 = new Point(this.selected.point2);
            } else if (event.event.button === 2) {
                if (callback) {
                    callback(event, newShape);
                }
            }
        };
        if (newShape.type === 1 || newShape.type === 2 || newShape.type === 4) {
            newShape.renderObject.onMouseDown = (event: any) => {
                selectShape(event, this._dialog.wallContext(event, newShape));
            };
        } else if (newShape.type === 5 || newShape.type === 6 || newShape.type === 7) {
            newShape.renderObject.onMouseDown = (event: any) => {
                selectShape(event, this._dialog.onWallShapeContext(event, newShape));
            };
        } else {
            newShape.renderObject.onMouseDown = (event: any) => {
                selectShape(event, undefined);
            };
        }

        const saveAsFunc: Function = newShape.renderObject.onMouseLeave;
        newShape.renderObject.onMouseLeave = () => {
            if (this.selected) {
                this.selected.point1.x = Math.round(this.selected.point1.x);
                this.selected.point2.x = Math.round(this.selected.point2.x);
                this.selected.point1.y = Math.round(this.selected.point1.y);
                this.selected.point2.y = Math.round(this.selected.point2.y);
            }
            this.selected = undefined;
            saveAsFunc();
        };
        newShape.renderObject.onMouseUp = () => {
            if (this.selected) {
                this.selected.point1.x = Math.round(this.selected.point1.x);
                this.selected.point2.x = Math.round(this.selected.point2.x);
                this.selected.point1.y = Math.round(this.selected.point1.y);
                this.selected.point2.y = Math.round(this.selected.point2.y);
            }
            this.selected = undefined;
        };
        return newShape;
    }

    public createShapeControlsAndRender(newShape: IShape, notDraw: boolean = false): void {
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
                RenderApi.drawControl(control1);
                RenderApi.drawControl(control2);
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
    }

    public getRound(point: IPoint): IPoint {
        const original: IPoint = this.originalPosition(point);
        original.x = Math.round(original.x / RenderEvents.round) * RenderEvents.round;
        original.y = Math.round(original.y / RenderEvents.round) * RenderEvents.round;

        return GraphicsSettings.current.newPosition(original.x + this.offset.x, original.y + this.offset.y);
    }

    private _drawWallMouseDownHandler: (event: any) => void;
    private _drawWallMouseMoveHandler: (event: any) => void;
    public cancelCreateWallHandler = () => { };

    public createWall(isChain: boolean, type: number): void {
        this.cancelCreateWallHandler();

        this._allowSelect = false;

        let line: IPath;
        let startPoint: IPoint = undefined;
        let startShape: IShape = undefined;
        let chainControl: IShape = undefined;

        let cancelEvent: () => void;
        let near: IShape = undefined;

        const onMouseDown: (event: any) => void = (event: any) => {
            if (this._drawWallMouseDownHandler && event.point.y < 35) {
                cancelEvent();
            } else if (this._drawWallMouseDownHandler) {
                this._drawWallMouseDownHandler(event);
            }
        };
        const onMouseMove: (event: any) => void = (event: any) => {
            this._drawWallMouseMoveHandler(event);
        };
        cancelEvent = () => {
            this._drawWallMouseDownHandler = undefined;
            this._drawWallMouseMoveHandler = undefined;
            startPoint = undefined;
            startShape = undefined;
            if (line) {
                line.remove();
            }
            line = undefined;
            this._events.removeMouseDownListener(onMouseDown);
            this._events.removeMouseMoveListener(onMouseMove);
            this._allowSelect = true;
        };

        if (this._drawWallMouseDownHandler || this._drawWallMouseMoveHandler) {
            cancelEvent();
        }

        this._drawWallMouseDownHandler = (event: any) => {
            startPoint = this.getRound(event.point);
            if (line) {
                const point1: IPoint = this.originalPosition(line.segments[0].point);
                const point2: IPoint = this.originalPosition(line.segments[1].point);
                const newShape: IShape = new Shape(point1, point2, type);
                this._shapes.push(newShape);
                this.createShapeControlsAndRender(newShape);
                if (startShape) {
                    if (startShape.type === 11 || startShape.type === 12) {
                        newShape.children[0].renderObject.remove();
                        newShape.children[0] = startShape;
                        this.insertAboveMenu(startShape);
                        startShape.parents.push(newShape);
                        startShape = undefined;
                    }
                }
                if (this.selected) {
                    if (this.selected.type === 11 || this.selected.type === 12) {
                        newShape.children[1].renderObject.remove();
                        newShape.children[1] = this.selected;
                        this.insertAboveMenu(this.selected);
                        this.selected.parents.push(newShape);
                    }
                }
                this.renderShape(newShape);
                if (chainControl) {
                    newShape.children[0].renderObject.remove();
                    newShape.children[0] = chainControl;
                    chainControl.parents.push(newShape);
                    this.insertAboveMenu(chainControl);
                }
                line.remove();
                line = undefined;
                if (!isChain) {
                    startPoint = undefined;
                    chainControl = undefined;
                } else {
                    chainControl = newShape.children[1];
                }
            } else if (this.selected) {
                startShape = this.selected;
                this.selected = undefined;
            }
        };

        let saveSelect: IShape;
        const startOffsetX: number = this.offset.x;
        this._drawWallMouseMoveHandler = (event: any) => {
            if (startOffsetX !== this.offset.x) {
                this.cancelCreateWallHandler();
            }
            const point2: IPoint = this.getRound(event.point);
            if (startPoint) {
                line = Path.Line(startPoint, point2);
                line.strokeColor = ColorConfig.line;
                line.strokeWidth = 2;
                // TODO: find paper type
                GraphicsSettings.current.moveAboveGrid(line);
                startPoint = undefined;
            } else if (line) {
                near = this.findAround(event.point, 20 * this.zoom);
                if (near) {
                    line.segments[line.segments.length - 1].point = near.renderObject.position;
                    this.selected = near;
                    saveSelect = near;
                } else {
                    line.segments[line.segments.length - 1].point = point2;
                    if (this.selected === saveSelect) {
                        this.selected = undefined;
                    }
                }
            }
        };

        this.cancelCreateWallHandler = () => {
            if (this._drawWallMouseMoveHandler || this._drawWallMouseDownHandler) {
                cancelEvent();
            }
        };
        this._events.clearMouseDownListener();
        this._events.addMouseDownListener(onMouseDown);
        this._events.addMouseMoveListener(onMouseMove);
    }

    private findAround(point: IPoint, round: number): IShape {
        let result: IShape = undefined;
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
        };
        aroundShape(this._shapes);
        return result;
    }

    public createColumn(): void {
        this.cancelCreateWallHandler();
        this._allowSelect = false;
        let cancelEvent: () => void;

        const onMouseDown: (event: any) => void = (event: any) => {
            if (event.point.y > 35) {
                const point1: IPoint = this.originalPosition(event.point);
                point1.x = Math.round(point1.x / RenderEvents.round) * RenderEvents.round;
                point1.y = Math.round(point1.y / RenderEvents.round) * RenderEvents.round;

                const point2: IPoint = new Point(point1);
                const newShape: IShape = new Shape(point1, point2, 3);
                this._shapes.push(newShape);
                this.createShapeControlsAndRender(newShape);
            } else {
                cancelEvent();
            }
        };

        cancelEvent = () => {
            this._events.removeMouseDownListener(onMouseDown);
            this._allowSelect = true;
        };

        this._events.clearMouseDownListener();
        this._events.addMouseDownListener(onMouseDown);
    }

    public createShapeOnWall(type: number): any {
        this.cancelCreateWallHandler();
        this._allowSelect = false;
        let cancelEvent: () => void;

        const onMouseDown: (event: any) => void = (event: any) => {
            if (event.event.button === 0) {
                if (event.point.y > 35 && this.selected && (this.selected.type === 1 || this.selected.type === 2 || this.selected.type === 4)) {
                    const selected: IShape = this.selected;
                    const point1: IPoint = this.originalPosition(event.point);
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
                    this.createShapeControlsAndRender(newShape);
                    this._dialog.createDialog2(() => { }, newShape);
                } else {
                    cancelEvent();
                }
            }
        };

        cancelEvent = () => {
            this._events.removeMouseDownListener(onMouseDown);
            this._allowSelect = true;
        };

        this._events.clearMouseDownListener();
        this._events.addMouseDownListener(onMouseDown);
    }

    // ------------------------------------------------

    private getEventPointX(point: IPoint): number {
        return point.x - this.offset.x * this.zoom;
    }

    private getEventPointY(point: IPoint): number {
        return point.y - this.offset.y * this.zoom;
    }

    private originalPosition(point: IPoint): IPoint {
        return GraphicsSettings.current.originalPosition(this.getEventPointX(point), this.getEventPointY(point));
    }

    // TODO: Refactor GraphicsSettings

    private get center(): IPoint {
        return GraphicsSettings.current.center;
    }

    private get zoom(): number {
        return GraphicsSettings.current.zoom;
    }

    private set zoom(value: number) {
        GraphicsSettings.current.zoom = value;
    }

    private insertAboveMenu(shape: IShape): void {
        GraphicsSettings.current.insertAboveMenu(shape);
    }

    private get offset(): IPoint {
        return GraphicsSettings.current.offset;
    }
}