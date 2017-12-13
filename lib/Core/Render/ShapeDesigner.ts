import { IPoint, IGroup, IPath, Group, Point, IColor, IPointText, PointText, IRaster, Raster } from '../Primitive/Primitive';
import { GraphicsSettings } from './GraphicsSettings';
import { MathCalc } from '../MathCalc';
import { IShape } from '../Shapes/IShape';
import { ShapeDesignerHelper } from './ShapeDesignerHelper';
import { ColorConfig } from './ColorConfig';
import { BackgroundShape } from '../Shapes/ShapeBack';

export class ShapeDesigner {

    public static drawGrid(shape: IShape, windowWidth: number, windowHeight: number): void {
        const offsetX: number = ShapeDesigner.offset.x - Math.round(windowWidth / 2) - 3;
        const offsetY: number = ShapeDesigner.offset.y - Math.round(windowHeight / 2) - 5;
        const high: number = (ShapeDesigner.zoom > 1.5) ? 50 : 100;
        const width: number = (ShapeDesigner.zoom > 1.5) ? 50 : 100;
        const pool: Array<IPath> = [];
        const widthElement: number = Math.round(2 * windowWidth / width);
        const highElement: number = Math.round(2 * windowHeight / high);
        const widthLength: number = widthElement * width;
        const highLength: number = highElement * high;

        for (let i: number = 0; i <= widthElement; i++) {
            pool.push(ShapeDesignerHelper.drawGridLine(
                GraphicsSettings.current.newPosition(i * width + 0.5 + offsetX, + 0.5 + offsetY),
                GraphicsSettings.current.newPosition(i * width + 0.5 + offsetX, highLength + 0.5 + offsetY)
            ));
        }
        for (let i: number = 0; i <= highElement; i++) {
            pool.push(ShapeDesignerHelper.drawGridLine(
                GraphicsSettings.current.newPosition(0.5 + offsetX, i * high + 0.5 + offsetY),
                GraphicsSettings.current.newPosition(widthLength + 0.5 + offsetX, i * high + 0.5 + offsetY)
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

    public static drawControl(shape: IShape): void {
        ShapeDesigner.drawSquare(shape, 8, ColorConfig.control);
    }

    public static drawColumn(shape: IShape): void {
        ShapeDesigner.drawSquare(shape, 20, ColorConfig.column);
    }

    private static drawSquare(
        shape: IShape,
        size: number,
        fillColor: IColor | string
    ): void {
        const point1: IPoint = GraphicsSettings.current.newPosition(shape.point1.x + ShapeDesigner.offset.x, shape.point1.y + ShapeDesigner.offset.y);
        const width: number = size * ShapeDesigner.zoom;
        const length: number = size * ShapeDesigner.zoom;

        const rect: IPath =
            ShapeDesignerHelper.createRectangle(point1, width, length, fillColor, 0);

        if (shape.renderObject && shape.renderObject.children[0]) {
            rect.insertBelow(shape.renderObject);
            shape.renderObject.children[0].remove();
            shape.renderObject.addChild(rect);
        } else {
            shape.renderObject =
                ShapeDesignerHelper.createRenderObject([rect], fillColor);
        }
    }

    public static drawWall(shape: IShape, color: IColor, desiredWidth: number): void {
        const point1: IPoint = GraphicsSettings.current.newPosition(shape.point1.x + ShapeDesigner.offset.x, shape.point1.y + ShapeDesigner.offset.y);
        const point2: IPoint = GraphicsSettings.current.newPosition(shape.point2.x + ShapeDesigner.offset.x, shape.point2.y + ShapeDesigner.offset.y);
        const vector: IPoint = new Point(point2.x - point1.x, point2.y - point1.y);
        const width: number = desiredWidth * ShapeDesigner.zoom;
        const length: number = point2.getDistance(point1, false);

        const rect: IPath =
            ShapeDesignerHelper.createRectangle(point1, width, length, color, vector.angle - 90, true);

        const text: IPointText =
            PointText.create(new Point(rect.position.x, rect.position.y + width / 3), 'center', ColorConfig.black, 'Wall', 20);
        text.fontWeight = 'bold';
        text.visible = false;

        if (shape.renderObject && shape.renderObject.children[0]) {
            ShapeDesignerHelper.addChildren(shape, text, rect);
        } else {
            shape.renderObject = new Group([rect, text]);
            GraphicsSettings.current.insertBelowMenu(shape);
        }

        shape.renderObject.onMouseEnter = () => {
            shape.renderObject.children[0].fillColor = ColorConfig.mouseEnter;
            (shape.renderObject.children[1] as IPointText).content = ' ' + Math.round(MathCalc.getShapeLength(shape));
            shape.renderObject.children[1].visible = true;
        };
        shape.renderObject.onMouseLeave = (e: MouseEvent) => {
            shape.renderObject.children[0].fillColor = color;
            shape.renderObject.children[1].visible = false;
        };
    }

    public static drawShapeOnWall(shape: IShape, color2: IColor): void {
        // TODO: duplicate drawWall
        const point1: IPoint = GraphicsSettings.current.newPosition(shape.point1.x + ShapeDesigner.offset.x, shape.point1.y + ShapeDesigner.offset.y);
        const point2: IPoint = GraphicsSettings.current.newPosition(shape.point2.x + ShapeDesigner.offset.x, shape.point2.y + ShapeDesigner.offset.y);
        const vector: IPoint = new Point(point2.x - point1.x, point2.y - point1.y);
        const width: number = 20 * ShapeDesigner.zoom;
        const smallWidth: number = 8 * ShapeDesigner.zoom;
        const length: number = shape.width / 10 * ShapeDesigner.zoom;

        const rect: IPath =
            ShapeDesignerHelper.createRectangle(point1, width, length, ColorConfig.black, vector.angle - 90);

        if (color2) {
            const smallRect: IPath =
                ShapeDesignerHelper.createRectangle(point1, smallWidth, length, color2, vector.angle - 90);

            if (shape.renderObject && shape.renderObject.children[0]) {
                ShapeDesignerHelper.addChildren(shape, smallRect, rect);
            } else {
                shape.renderObject =
                    ShapeDesignerHelper.createRenderObject([rect, smallRect]);
            }
        } else {
            if (shape.renderObject && shape.renderObject.children[0]) {
                rect.insertBelow(shape.renderObject);
                shape.renderObject.children[0].remove();
                shape.renderObject.addChild(rect);
            } else {
                shape.renderObject =
                    ShapeDesignerHelper.createRenderObject([rect]);
            }
        }
    }

    public static drawBack(shape: BackgroundShape): void {
        shape.point1 = GraphicsSettings.current.originalPosition(ShapeDesigner.center.x - ShapeDesigner.offset.x * ShapeDesigner.zoom, ShapeDesigner.center.y - ShapeDesigner.offset.y * ShapeDesigner.zoom);

        const point1: IPoint = GraphicsSettings.current.newPosition(shape.point1.x + ShapeDesigner.offset.x, shape.point1.y + ShapeDesigner.offset.y);
        const icon: IRaster = Raster.create(shape.img, point1, ShapeDesigner.zoom * shape.scale);

        if (shape.renderObject) {
            shape.renderObject.children[0].remove();
            shape.renderObject.addChild(icon);
        } else {
            const group: IGroup = new Group([icon]);
            group.opacity = 0.6;
            shape.type = 13;
            shape.renderObject = group;
            GraphicsSettings.current.insertBelowGrid(group);
        }
    }

    // TODO: Refactor GraphicsSettings
    private static get zoom(): number {
        return GraphicsSettings.current.zoom;
    }
    private static get center(): IPoint {
        return GraphicsSettings.current.center;
    }
    private static get offset(): IPoint {
        return GraphicsSettings.current.offset;
    }

}