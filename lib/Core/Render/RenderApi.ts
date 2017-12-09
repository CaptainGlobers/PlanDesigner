import { IPoint, IGroup, Path, Point, IColor, IPath } from '../Primitive/Primitive';
import { GraphicsSettings } from './GraphicsSettings';
import { MenuDesigner } from './MenuDesigner';
import { ShapeDesigner } from './ShapeDesigner';
import { IShape } from '../Shapes/IShape';
import { ShapeBack } from '../Shapes/ShapeBack';
import { ColorConfig } from './ColorConfig';
import { ShapeType } from '../Shapes/ShapeType';

export class RenderApi {
    private _menuDesigner: MenuDesigner = new MenuDesigner();
    private _shapeDesigner: ShapeDesigner = new ShapeDesigner();

    public originalPosition(x: number, y: number): IPoint {
        return this._shapeDesigner.originalPosition(x, y);
    }

    public newPosition(x: number, y: number): IPoint {
        return this._shapeDesigner.newPosition(x, y);
    }

    public drawGrid(shape: IShape, windowWidth: number, windowHeight: number): void {
        this._shapeDesigner.drawGrid(shape, windowWidth, windowHeight);
    }

    public drawStartMenu(): IGroup {
        return MenuDesigner.drawStartMenu(GraphicsSettings.current.center);
    }

    public drawMenu(count: number, width: number, hight: number): Array<IGroup> {
        return this._menuDesigner.drawMenu(count, width, hight);
    }

    public drawLeftMenu(count: number): Array<IGroup> {
        return this._menuDesigner.drawLeftMenu(count);
    }

    public renderShape(shape: IShape): void {
        this.renderShapeInternal(shape);
    }

    private renderShapeInternal(shape: IShape, option?: string): void {
        let param: string = option;
        if (shape.type === ShapeType.OuterWall) {
            this.drawWall(shape, ColorConfig.outerWall, 20);
        }
        if (shape.type === ShapeType.InnerWall) {
            this.drawWall(shape, ColorConfig.innerWall, 20);
        }
        if (shape.type === ShapeType.Column) {
            this._shapeDesigner.drawColumn(shape);
        }
        if (shape.type === ShapeType.Partition) {
            this.drawWall(shape, ColorConfig.partition, 8);
        }
        if (shape.type === ShapeType.Window) {
            this.drawShapeOnWall(shape, ColorConfig.window);
            param = 'noOne';
        }
        if (shape.type === ShapeType.Door) {
            this.drawShapeOnWall(shape, ColorConfig.doorWay);
            param = 'noOne';
        }
        if (shape.type === ShapeType.DoorWay) {
            this.drawShapeOnWall(shape, ColorConfig.transparent);
            param = 'noOne';
        }
        if (shape.type === ShapeType.ControlFirst || shape.type === ShapeType.ControlSecond) {
            this.drawControl(shape);
        }
        if (shape.type === ShapeType.BackGround) {
            this.drawBack(shape as ShapeBack);
        }
        if (param !== 'noOne') {
            if (shape.children) {
                shape.children.forEach((child: IShape) => {
                    if (child.type === ShapeType.Window || child.type === ShapeType.Door || child.type === ShapeType.DoorWay) {
                        const path: IPath = new Path([shape.point1, shape.point2]);
                        // TODO: Bug path.getPointAt(child.offset) = undefined
                        child.point1 = path.getPointAt(child.offset) || new Point(0, 0);
                        child.point2 = new Point(shape.point2);
                        path.remove();
                    }
                    if (param !== 'noControls' || (child.type !== ShapeType.ControlFirst && child.type !== ShapeType.ControlSecond)) {
                        this.renderShape(child);
                    }
                });
            }

            if (shape.parents) {
                shape.parents.forEach((parent: IShape) => {
                    if (parent.type && shape === parent.children[0]) {
                        parent.point1 = shape.point1;
                        this.renderShapeInternal(parent, 'noControls');
                    }
                    if (parent.type && shape === parent.children[1]) {
                        parent.point2 = shape.point1;
                        this.renderShapeInternal(parent, 'noControls');
                    }
                });
            }

        }
    }

    public renderBackgroundShapes(shape: IShape): void {
        if (shape.type === ShapeType.OuterWall) {
            this.drawWall(shape, ColorConfig.outerWall, 20);
        }
        if (shape.type === ShapeType.InnerWall) {
            this.drawWall(shape, ColorConfig.innerWall, 20);
        }
        if (shape.type === ShapeType.Column) {
            this._shapeDesigner.drawColumn(shape);
        }
        if (shape.children) {
            shape.children.forEach((child: IShape) => this.renderBackgroundShapes(child));
        }
    }

    public drawBack(shape: ShapeBack): void {
        this._shapeDesigner.drawBack(shape);
    }

    public drawControl(shape: IShape): void {
        this._shapeDesigner.drawControl(shape);
    }

    private drawWall(shape: IShape, color: IColor, desiredWidth: number): void {
        this._shapeDesigner.drawWall(shape, color, desiredWidth);
    }

    private drawShapeOnWall(shape: IShape, color2: IColor): void {
        this._shapeDesigner.drawShapeOnWall(shape, color2);
    }
}
