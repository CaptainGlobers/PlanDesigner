import { IPoint, Point, IPath, Size, IGroup, Group, Path, ISize, IItem } from '../Primitive/Primitive';
import { MathCalc } from '../MathCalc';
import { IShape } from '../Shapes/IShape';

export class ShapeDesignerHelper {

    public static shapeClear(shapes: Array<IShape>) {
        if (shapes) {
            shapes.forEach((shape: IShape) => {
                if (shape.renderObject) { // type 11, 12 can be removed
                    shape.renderObject.remove();
                    shape.renderObject = null;
                    this.shapeClear(shape.children);
                }
            });
        }
    }

    public static newPointOnLine(parent: IShape, point: IPoint): IPoint {
        const pointA: IPoint = new Point(parent.point1);
        const pointB: IPoint = new Point(parent.point2);
        const correctionPoint: IPoint = MathCalc.getNormal(pointA, pointB, point);
        return new Point(point.x + correctionPoint.x, point.y + correctionPoint.y);
    }

    public static createRectangle(
        point: IPoint, width: number, length: number, strokeColor: string, name: string, fillColor, angle: number, notSetY?: boolean
    ): IPath {
        const size: ISize = new Size(width, length);
        const rect: IPath = Path.Rectangle(point, size);
        rect.position.x -= width / 2;
        if (!notSetY) {
            rect.position.y -= length / 2;
        }
        rect.strokeColor = strokeColor;
        rect.name = name;
        rect.fillColor = fillColor;
        if (angle) {
            rect.rotate(angle, point);
        }

        return rect;
    }

    public static createRenderObject(items: Array<any>, colorEnter, colorLeave, menu, isStrokeColor?: boolean): IGroup {
        const renderObject: IGroup = new Group(items);
        if (isStrokeColor) {
            renderObject.onMouseEnter = () => renderObject.strokeColor = colorEnter;
            renderObject.onMouseLeave = () => renderObject.strokeColor = colorLeave;
        } else {
            renderObject.onMouseEnter = () => renderObject.children[0].fillColor = colorEnter;
            renderObject.onMouseLeave = () => renderObject.children[0].fillColor = colorLeave;
        }
        if (menu) {
            renderObject.insertBelow(menu);
        }

        return renderObject;
    }

    public static createPath(point1, point2): IPath {
        var myPath = new Path();
        myPath.strokeColor = '#cccccc';
        myPath.strokeWidth = 1;
        myPath.add(point1);
        myPath.add(point2);

        return myPath;
    }

    public static addChildren(shape: IShape, child1: IItem, child2: IItem): void {
        child1.insertBelow(shape.renderObject);
        child2.insertBelow(shape.renderObject);
        shape.renderObject.children[1].remove();
        shape.renderObject.children[0].remove();
        shape.renderObject.addChild(child2);
        shape.renderObject.addChild(child1);
    }
}
