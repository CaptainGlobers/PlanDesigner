import { RenderApi } from './Render/RenderApi';
import { Dialog } from '../UI/Dialog';
import { RenderEvents } from './Render/RenderEvents';
import { IShape } from './Shapes/IShape';
import { ShapeGrid } from './Shapes/ShapeGrid';
import { BackgroundShape } from './Shapes/ShapeBack';
import { IPath, Path, Point, Size, IGroup } from './Primitive/Primitive';
import { GraphicsSettings } from './Render/GraphicsSettings';
import { StageMoveController } from './StageMoveController';
import { RenderHelper } from './Render/RenderHelper';
import { ShapeDesignerHelper } from './Render/ShapeDesignerHelper';
import { FileHelper } from './FileHelper';
import { ColorConfig } from './Render/ColorConfig';
import { ShapeDesigner } from './Render/ShapeDesigner';
import { MenuDesigner } from './Render/MenuDesigner';

export class Stage {
    public static round: number = 10;
    private readonly _canvas: HTMLCanvasElement;

    private readonly _dialog: Dialog;
    private readonly _renderEvents: RenderEvents;

    private readonly _grid: IShape = new ShapeGrid();
    private _shapes: Array<IShape>;
    private _background: BackgroundShape;
    private _backgroundShapes: Array<IShape>;

    constructor(stageContainer: HTMLElement) {
        this._canvas = document.createElement('canvas');
        this._canvas.oncontextmenu = () => { return false; };
        this._canvas.onmouseup = () => { this._renderEvents.selected = undefined; };
        document.oncontextmenu = () => { return false; };
        this._canvas.width = window.innerWidth;
        this._canvas.height = window.innerHeight;
        stageContainer.appendChild(this._canvas);

        this._canvas.getContext('2d'); // del ?
        paper.setup(this._canvas);
        const rect: IPath = Path.Rectangle(new Point(0, 0), new Size(window.innerWidth, window.innerHeight));
        rect.fillColor = 'white';

        GraphicsSettings.current.center = new Point(this._canvas.width / 2, this._canvas.height / 2);
        GraphicsSettings.current.grid = this._grid;

        ShapeDesigner.drawGrid(this._grid, this._canvas.width, this._canvas.height);

        this._dialog = new Dialog(this);

        window.setInterval(() => this.reDraw(), 5000);

        const moveCallback: (offsetX: number, offsetY: number) => void = (offsetX: number, offsetY: number) => {
            GraphicsSettings.current.offset.x = offsetX;
            GraphicsSettings.current.offset.y = offsetY;
            this.reDraw();
        };
        const stageMoveController: StageMoveController = new StageMoveController(
            this._canvas, moveCallback, (e: WheelEvent) => this.wheelListener(e));

        this._renderEvents = new RenderEvents(this._dialog, stageMoveController);
    }

    public setBackground(background: BackgroundShape): void {
        this._background = background;
    }

    public setBackgroundShapes(backgroundShapes: Array<IShape>): void {
        this._backgroundShapes = backgroundShapes;
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

    public clear(): void {
        ShapeDesignerHelper.shapeClear(this._shapes);
        ShapeDesignerHelper.shapeClear(this._backgroundShapes);
        if (this._background && this._background.renderObject) {
            this._background.renderObject.remove();
            this._background.renderObject = undefined;
        }
    }

    public set shapes(value: Array<IShape>) {
        this._shapes = value;
        this._renderEvents.setShapes(value);
    }

    public inBack(): void {
        this._background.scale += 0.01;
        RenderApi.drawBack(this._background);
    }

    public outBack(): void {
        this._background.scale -= 0.01;
        RenderApi.drawBack(this._background);
    }

    public delBack(): void {
        if (this._background.renderObject) {
            this._background.renderObject.remove();
        }
    }

    public hideBackground(): void {
        this._background.renderObject.opacity = 0;
    }

    public showBack(): void {
        this._background.renderObject.opacity = 0.6;
    }

    public loadBackground(loadSuccess: Function): void {
        FileHelper.loadBackground((e: any) => {
            this._background.img = e.target.result;
            RenderApi.drawBack(this._background);
            loadSuccess();
        });
    }

    public setLevel(): void {
        const createShapes: Function = (shape: IShape) => {
            if (shape.type === 11 || shape.type === 12) {
                GraphicsSettings.current.insertAboveMenu(shape);
            }
            if (shape.children) {
                shape.children.forEach((item: IShape) => createShapes(item));
            }
            this.setShapeHandlers(shape);
        };
        this.reDraw();
        this._shapes.forEach((item: IShape) => createShapes(item));
    }

    public reDraw(): void {
        if (this._shapes) {
            this._shapes.forEach((item: IShape) => RenderApi.renderShape(item));
        }
        ShapeDesigner.drawGrid(this._grid, this._canvas.width, this._canvas.height);
        this.backShapesDraw(this._backgroundShapes);
        if (this._background && this._background.img) {
            RenderApi.drawBack(this._background);
        }
        paper.project.view.update();
    }

    private backShapesDraw(backShapes: Array<IShape>): void {
        if (backShapes) {
            backShapes.forEach((shape: IShape) => {
                if (shape.type === 1 || shape.type === 2 || shape.type === 3) {
                    RenderApi.renderBackgroundShapes(shape);
                    shape.renderObject.fillColor = ColorConfig.transparent;
                    shape.renderObject.insertBelow(this._grid.renderObject);
                    shape.renderObject.onMouseEnter = undefined;
                    shape.renderObject.onMouseLeave = undefined;
                }
            });
        }
    }

    //
    public deleteShape(shape: IShape): void {
        RenderHelper.deleteShapeInternal(shape, this._shapes);
    }

    // TODO: Proxy renderEvents
    public cancelCreateWallHandler(): () => void {
        return this._renderEvents.cancelCreateWallHandler;
    }

    public mouseDetect(): void {
        this._renderEvents.mouseDetect();
    }

    public setZeroOffset(): void {
        this._renderEvents.resetOffset();
    }

    public setShapeHandlers(newShape: IShape): IShape {
        return this._renderEvents.setShapeHandlers(newShape);
    }

    public splitWall(shape: IShape): void {
        this._renderEvents.splitWall(shape);
    }

    public createWall(isChain: boolean, type: number): void {
        this._renderEvents.createWall(isChain, type);
    }

    public createColumn(): void {
        this._renderEvents.createColumn();
    }

    public createShapeOnWall(type: number): void {
        this._renderEvents.createShapeOnWall(type);
    }

    public moveBack(): void {
        this._renderEvents.moveBack(this._background);
    }

    public createShapeControlsAndRender(newShape: IShape, notDraw: boolean = false): void {
        this._renderEvents.createShapeControlsAndRender(newShape, notDraw);
    }

    // Proxy renderApi
    public createMenu(count: number): Array<IGroup> {
        return RenderApi.drawMenu(count, this._canvas.width, 40);
    }

    public createLeftMenu(count: number): Array<IGroup> {
        return RenderApi.drawLeftMenu(count);
    }

    public drawStart(): IGroup {
        return MenuDesigner.drawStartMenu(GraphicsSettings.current.center);
    }

    // TODO: Refactor GraphicsSettings
    private get zoom(): number {
        return GraphicsSettings.current.zoom;
    }

    private set zoom(value: number) {
        GraphicsSettings.current.zoom = value;
    }
}