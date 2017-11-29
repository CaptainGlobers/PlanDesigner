import { IPoint, IGroup, IPath, Group, Point, Color, IColor, IPointText, PointText, IRaster, Raster } from '../Primitive/Primitive';
import { GraphicsSettings } from './GraphicsSettings';
import { MathCalc } from '../MathCalc';
import { IShape } from '../Shapes/IShape';
import { ShapeDesignerHelper } from './ShapeDesignerHelper';
import { ColorConfig } from '../../ColorConfig';
import { ShapeBack } from '../Shapes/ShapeBack';

export class ShapeDesigner {

    private _graphicsSettings: GraphicsSettings;
    constructor(graphicsSettings: GraphicsSettings) {
        this._graphicsSettings = graphicsSettings;
    }

    public originalPosition(x: number, y: number): IPoint {
        return MathCalc.getPosition(x, y, 1 / this.zoom, this.center);
    }

    public newPosition(x: number, y: number): IPoint {
        return MathCalc.getPosition(x, y, this.zoom, this.center);
    }

    public drawGrid(shape: IShape, winWidth: number, winHeight: number, offsetXExt: number, offsetYExt: number) {
        const offsetX: number = offsetXExt - Math.round(winWidth / 2) - 3;
        const offsetY: number = offsetYExt - Math.round(winHeight / 2) - 5;
        const high: number = (this.zoom > 1.5) ? 50 : 100;
        const width: number = (this.zoom > 1.5) ? 50 : 100;
        const pool: Array<IPath> = new Array;
        const widthElement = Math.round(2 * winWidth / width);
        const highElement = Math.round(2 * winHeight / high);
        const widthLength = widthElement * width;
        const highLength = highElement * high;

        for (let i: number = 0; i <= widthElement; i++) {
            pool.push(ShapeDesignerHelper.createPath(
                this.newPosition(i * width + 0.5 + offsetX, + 0.5 + offsetY),
                this.newPosition(i * width + 0.5 + offsetX, highLength + 0.5 + offsetY)
            ));
        }
        for (let i: number = 0; i <= highElement; i++) {
            pool.push(ShapeDesignerHelper.createPath(
                this.newPosition(0.5 + offsetX, i * high + 0.5 + offsetY),
                this.newPosition(widthLength + 0.5 + offsetX, i * high + 0.5 + offsetY)
            ));
        }

        const group: IGroup = new Group(pool);
        if (shape.renderObject) {
            group.insertBelow(shape.renderObject);
            shape.renderObject.remove();
        }
        shape.renderObject = group;
        shape.point1 = new Point(group.position.x, group.position.y);
    }

    public drawControl(shape: IShape, offsetX: number, offsetY: number): void {
        this.drawSquare(shape, offsetX, offsetY, 8, 'yellow', 'lightblue', 'yellow');
    }

    public drawColumn(shape: IShape, offsetX: number, offsetY: number): void {
        this.drawSquare(shape, offsetX, offsetY, 20, ColorConfig.column, new Color(0, 0.45, 1, 0.5), new Color(1, 0.45, 0, 0.5));
    }

    private drawSquare(
        shape: IShape,
        offsetX: number,
        offsetY: number,
        size: number,
        rectColor: IColor | string,
        colorEnter: IColor | string,
        colorLeave: IColor | string
    ): void {
        const point1: IPoint = this.newPosition(shape.point1.x + offsetX, shape.point1.y + offsetY);
        const width: number = size * this.zoom;
        const length: number = size * this.zoom;

        const rect: IPath =
            ShapeDesignerHelper.createRectangle(point1, width, length, 'black', 'rect', rectColor, 0);

        if (shape.renderObject && shape.renderObject.children[0]) {
            rect.insertBelow(shape.renderObject);
            shape.renderObject.children[0].remove();
            shape.renderObject.addChild(rect);
        } else {
            shape.renderObject =
                ShapeDesignerHelper.createRenderObject([rect], colorEnter, colorLeave, this.menu);
        }
    }

    public drawWall(shape: IShape, offsetX: number, offsetY: number, color: IColor, desiredWidth: number): void {
        const point1: IPoint = this.newPosition(shape.point1.x + offsetX, shape.point1.y + offsetY);
        const point2: IPoint = this.newPosition(shape.point2.x + offsetX, shape.point2.y + offsetY);
        const vector: IPoint = new Point(point2.x - point1.x, point2.y - point1.y);
        const width: number = desiredWidth * this.zoom;
        const length: number = point2.getDistance(point1, false);

        const rect: IPath =
            ShapeDesignerHelper.createRectangle(point1, width, length, 'black', 'rect', color, vector.angle - 90, true);

        const text: IPointText =
            PointText.create(new Point(rect.position.x, rect.position.y + width / 3), 'center', 'black', 'Wall', 20);
        text.fontWeight = 'bold';
        text.visible = false;

        if (shape.renderObject && shape.renderObject.children[0]) {
            ShapeDesignerHelper.addChildren(shape, text, rect);
        } else {
            shape.renderObject = new Group([rect, text]);
            shape.renderObject.insertBelow(this.menu);
        }

        shape.renderObject.onMouseEnter = () => {
            shape.renderObject.children[0].fillColor = new Color(0, 0.45, 1, 0.5);
            (shape.renderObject.children[1] as IPointText).content = ' ' + Math.round(MathCalc.getShapeLength(shape));
            shape.renderObject.children[1].visible = true;
        };
        shape.renderObject.onMouseLeave = (e: MouseEvent) => {
            shape.renderObject.children[0].fillColor = color;
            shape.renderObject.children[1].visible = false;
        };
    }

    public drawShapeOnWall(shape: IShape, offsetX: number, offsetY: number, color2: IColor): void {
        const point1: IPoint = this.newPosition(shape.point1.x + offsetX, shape.point1.y + offsetY);
        const point2: IPoint = this.newPosition(shape.point2.x + offsetX, shape.point2.y + offsetY);
        const vector: IPoint = new Point(point2.x - point1.x, point2.y - point1.y);
        const width: number = 20 * this.zoom;
        const smallWidth: number = 8 * this.zoom;
        const length: number = shape.width / 10 * this.zoom;

        const rect: IPath =
            ShapeDesignerHelper.createRectangle(point1, width, length, 'black', 'rect', ColorConfig.wallPlace, vector.angle - 90);

        if (color2) {
            const smallRect: IPath =
                ShapeDesignerHelper.createRectangle(point1, smallWidth, length, 'black', 'smallrect', color2, vector.angle - 90);

            if (shape.renderObject && shape.renderObject.children[0]) {
                ShapeDesignerHelper.addChildren(shape, smallRect, rect);
            } else {
                shape.renderObject =
                    ShapeDesignerHelper.createRenderObject([rect, smallRect], new Color(0, 0.45, 1, 0.5), 'black', this.menu, true);
            }
        } else {
            if (shape.renderObject && shape.renderObject.children[0]) {
                rect.insertBelow(shape.renderObject);
                shape.renderObject.children[0].remove();
                shape.renderObject.addChild(rect);
            } else {
                shape.renderObject =
                    ShapeDesignerHelper.createRenderObject([rect], new Color(0, 0.45, 1, 0.5), 'black', this.menu, true);
            }
        }
    }

    public drawBack(shape: ShapeBack, offsetX: number, offsetY: number, grid: IShape): void {
        const point1: IPoint = this.newPosition(shape.point1.x + offsetX, shape.point1.y + offsetY);
        const icon: IRaster = Raster.create(shape.img, point1, this.zoom * shape.scale);

        if (shape.renderObject) {
            shape.renderObject.children[0].remove();
            shape.renderObject.addChild(icon);
        } else {
            const group: IGroup = new Group([icon]);
            group.opacity = 0.6;
            shape.type = 13;
            shape.renderObject = group;
            group.insertBelow(grid.renderObject);
        }
    }

    //------------------------------
    private get zoom(): number {
        return this._graphicsSettings.zoom;
    }
    private get center(): IPoint {
        return this._graphicsSettings.center;
    }
    private get menu(): IPath {
        return this._graphicsSettings.menu;
    }

}