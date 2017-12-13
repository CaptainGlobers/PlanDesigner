import { IGroup, Path, Point, IColor, IPath } from '../Primitive/Primitive';
import { MenuDesigner } from './MenuDesigner';
import { ShapeDesigner } from './ShapeDesigner';
import { IShape } from '../Shapes/IShape';
import { BackgroundShape } from '../Shapes/ShapeBack';
import { ColorConfig } from './ColorConfig';
import { ShapeType } from '../Shapes/ShapeType';

// TODO: Static
export class RenderApi {
    public static drawMenu(count: number, width: number, hight: number): Array<IGroup> {
        return MenuDesigner.drawMenu(count, width, hight);
    }

    public static drawLeftMenu(count: number): Array<IGroup> {
        return MenuDesigner.drawLeftMenu(count);
    }

    public static renderShape(shape: IShape): void {
        RenderApi.renderShapeInternal(shape);
    }

    private static renderShapeInternal(shape: IShape, option?: string): void {
        let param: string = option;
        if (shape.type === ShapeType.OuterWall) {
            RenderApi.drawWall(shape, ColorConfig.outerWall, 20);
        }
        if (shape.type === ShapeType.InnerWall) {
            RenderApi.drawWall(shape, ColorConfig.innerWall, 20);
        }
        if (shape.type === ShapeType.Column) {
            ShapeDesigner.drawColumn(shape);
        }
        if (shape.type === ShapeType.Partition) {
            RenderApi.drawWall(shape, ColorConfig.partition, 8);
        }
        if (shape.type === ShapeType.Window) {
            RenderApi.drawShapeOnWall(shape, ColorConfig.window);
            param = 'noOne';
        }
        if (shape.type === ShapeType.Door) {
            RenderApi.drawShapeOnWall(shape, ColorConfig.doorWay);
            param = 'noOne';
        }
        if (shape.type === ShapeType.DoorWay) {
            RenderApi.drawShapeOnWall(shape, ColorConfig.transparent);
            param = 'noOne';
        }
        if (shape.type === ShapeType.ControlFirst || shape.type === ShapeType.ControlSecond) {
            RenderApi.drawControl(shape);
        }
        if (shape.type === ShapeType.BackGround) {
            RenderApi.drawBack(shape as BackgroundShape);
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
                        RenderApi.renderShape(child);
                    }
                });
            }

            if (shape.parents) {
                shape.parents.forEach((parent: IShape) => {
                    if (parent.type && shape === parent.children[0]) {
                        parent.point1 = shape.point1;
                        RenderApi.renderShapeInternal(parent, 'noControls');
                    }
                    if (parent.type && shape === parent.children[1]) {
                        parent.point2 = shape.point1;
                        RenderApi.renderShapeInternal(parent, 'noControls');
                    }
                });
            }

        }
    }

    public static renderBackgroundShapes(shape: IShape): void {
        if (shape.type === ShapeType.OuterWall) {
            RenderApi.drawWall(shape, ColorConfig.outerWall, 20);
        }
        if (shape.type === ShapeType.InnerWall) {
            RenderApi.drawWall(shape, ColorConfig.innerWall, 20);
        }
        if (shape.type === ShapeType.Column) {
            ShapeDesigner.drawColumn(shape);
        }
        if (shape.children) {
            shape.children.forEach((child: IShape) => RenderApi.renderBackgroundShapes(child));
        }
    }

    public static drawBack(shape: BackgroundShape): void {
        ShapeDesigner.drawBack(shape);
    }

    public static drawControl(shape: IShape): void {
        ShapeDesigner.drawControl(shape);
    }

    private static drawWall(shape: IShape, color: IColor, desiredWidth: number): void {
        ShapeDesigner.drawWall(shape, color, desiredWidth);
    }

    private static drawShapeOnWall(shape: IShape, color2: IColor): void {
        ShapeDesigner.drawShapeOnWall(shape, color2);
    }
}
