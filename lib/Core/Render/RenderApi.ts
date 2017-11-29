import { IPoint, IGroup, Path, Point, IColor } from '../Primitive/Primitive';
import { ShapeGrid } from '../Shapes/ShapeGrid';
import { GraphicsSettings } from './GraphicsSettings';
import { MenuDesigner } from './MenuDesigner';
import { ShapeDesigner } from './ShapeDesigner';
import { IShape } from '../Shapes/IShape';
import { ShapeBack } from '../Shapes/ShapeBack';
import { ColorConfig } from '../../ColorConfig';

export class RenderApi {
    private _grid: ShapeGrid;
    private _graphicsSettings: GraphicsSettings;
    private _menuDesigner: MenuDesigner = new MenuDesigner();

    private _shapeDesigner: ShapeDesigner;

    constructor(graphicsSettings: GraphicsSettings, grid: IShape) {
        this._graphicsSettings = graphicsSettings;
        this._grid = grid;
        this._shapeDesigner = new ShapeDesigner(this._graphicsSettings);
    }

    public originalPosition(x: number, y: number): IPoint {
        return this._shapeDesigner.originalPosition(x, y);
    }

    public newPosition(x: number, y: number): IPoint {
        return this._shapeDesigner.newPosition(x, y);
    }

    public drawGrid(shape: IShape, winWidth: number, winHeight: number, offsetX: number, offsetY: number) {
        this._shapeDesigner.drawGrid(shape, winWidth, winHeight, offsetX, offsetY);
    }

    public drawStartMenu(): IGroup {
        return MenuDesigner.drawStartMenu(this._graphicsSettings.center);
    }

    public drawMenu(count: number, width: number, hight: number): Array<IGroup> {
        return this._menuDesigner.drawMenu(count, width, hight, this._graphicsSettings);
    }

    public drawLeftMenu(count: number): Array<IGroup> {
        return this._menuDesigner.drawLeftMenu(count);
    }
    //--------------------------------------------------
    public renderShape(shape: IShape, offsetX: number, offsetY: number, option: string): void;
    public renderShape(shape: IShape, offsetX: number, offsetY: number): void;
    public renderShape(shape, offsetX, offsetY, option?) {
        if (shape.point1 === null) {
            debugger;
        }
        let param: string = option;
        if (shape.type === 1) {
            this.drawOuterWall(shape, offsetX, offsetY);
        }
        if (shape.type === 2) {
            this.drawInnerWall(shape, offsetX, offsetY);
        }
        if (shape.type === 3) {
            this.drawColumn(shape, offsetX, offsetY);
        }
        if (shape.type === 4) {
            this.drawPartition(shape, offsetX, offsetY);
        }
        if (shape.type === 5) {
            this.drawWindow(shape, offsetX, offsetY);
            param = 'noOne';
        }
        if (shape.type === 6) {
            this.drawDoor(shape, offsetX, offsetY);
            param = 'noOne';
        }
        if (shape.type === 7) {
            this.drawDoorWay(shape, offsetX, offsetY);
            param = 'noOne';
        }
        if (shape.type === 11 || shape.type === 12) {
            this.drawControl(shape, offsetX, offsetY);
        }
        if (shape.type === 13) {
            this.drawBack(<ShapeBack>shape, offsetX, offsetY, this._grid);
        }
        if (param !== 'noOne') {
            if (shape.children) {
                shape.children.forEach((child: IShape) => {

                    if (child.type === 6 || child.type === 7 || child.type === 5) {
                        const path = new Path([shape.point1, shape.point2]);
                        // TODO: Bug path.getPointAt(child.offset) = null
                        child.point1 = path.getPointAt(child.offset) || new Point(0, 0);
                        child.point2 = new Point(shape.point2);
                        path.remove();
                    }
                    if (param === 'noControls') {
                        if (child.type !== 11 && child.type !== 12) {
                            this.renderShape(child, offsetX, offsetY);
                        }
                    } else {
                        this.renderShape(child, offsetX, offsetY);
                    }

                });
            }
            if (param === 'noParents') { }
            else {
                if (shape.parents) {
                    shape.parents.forEach((parent: IShape) => {
                        if (parent.type && shape === parent.children[0]) {
                            parent.point1 = shape.point1;
                            this.renderShape(parent, offsetX, offsetY, 'noControls');
                        }
                        if (parent.type && shape === parent.children[1]) {
                            parent.point2 = shape.point1;
                            this.renderShape(parent, offsetX, offsetY, 'noControls');
                        }
                    });
                }
            }
        }
    }

    public renderShapeBack(shape: IShape, offsetX: number, offsetY: number): void {
        if (shape.type === 1) {
            this.drawOuterWall(shape, offsetX, offsetY);
        }
        if (shape.type === 2) {
            this.drawInnerWall(shape, offsetX, offsetY);
        }
        if (shape.type === 3) {
            this.drawColumn(shape, offsetX, offsetY);
        }
        if (shape.children) {
            shape.children.forEach((child: IShape) => this.renderShapeBack(child, offsetX, offsetY));
        }
    }

    public drawOuterWall(shape: IShape, offsetX: number, offsetY: number): void {
        this.drawWall(shape, offsetX, offsetY, ColorConfig.outerWall, 20);
    }

    public drawInnerWall(shape: IShape, offsetX: number, offsetY: number): void {
        this.drawWall(shape, offsetX, offsetY, ColorConfig.innerWall, 20);
    }

    public drawPartition(shape: IShape, offsetX: number, offsetY: number): void {
        this.drawWall(shape, offsetX, offsetY, ColorConfig.partition, 8);
    }

    public drawWindow(shape: IShape, offsetX: number, offsetY: number): void {
        this.drawShapeOnWall(shape, offsetX, offsetY, ColorConfig.window);
    }

    public drawDoor(shape: IShape, offsetX: number, offsetY: number): void {
        this.drawShapeOnWall(shape, offsetX, offsetY, ColorConfig.doorWay);
    }

    public drawDoorWay(shape: IShape, offsetX: number, offsetY: number): void {
        this.drawShapeOnWall(shape, offsetX, offsetY, ColorConfig.door);
    }

    public drawControl(shape: IShape, offsetX: number, offsetY: number): void {
        this._shapeDesigner.drawControl(shape, offsetX, offsetY);
    }

    public drawColumn(shape: IShape, offsetX: number, offsetY: number): void {
        this._shapeDesigner.drawColumn(shape, offsetX, offsetY);
    }

    private drawWall(shape: IShape, offsetX: number, offsetY: number, color: IColor, desiredWidth: number): void {
        this._shapeDesigner.drawWall(shape, offsetX, offsetY, color, desiredWidth);
    }

    private drawShapeOnWall(shape: IShape, offsetX: number, offsetY: number, color2: IColor): void {
        this._shapeDesigner.drawShapeOnWall(shape, offsetX, offsetY, color2);
    }

    public drawBack(shape: ShapeBack, offsetX: number, offsetY: number, grid: IShape): void {
        this._shapeDesigner.drawBack(shape, offsetX, offsetY, grid);
    }
}
