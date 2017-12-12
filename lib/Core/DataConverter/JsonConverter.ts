import { IPoint, Point } from '../Primitive/Primitive';
import { ILevel } from '../ILevel';
import { IShape } from '../Shapes/IShape';
import { Shape } from '../Shapes/Shape';
import { Stage } from '../Stage';
import { MathCalc } from '../MathCalc';
import { ShapeBack } from '../Shapes/ShapeBack';

export class JsonConverter {

    public static getLevels(dto: string, render: Stage): Array<ILevel> {
        const data: any = JSON.parse(dto);
        const zeroPoint: IPoint = new Point(data.offset[0], data.offset[1]);
        const result: Array<ILevel> = [];
        data.levels.forEach((level: any) => {
            result[level.floorNumber] = {
                floorNumber: level.floorNumber,
                objects: JsonConverter.getObjects(level.objects, undefined, render, zeroPoint),
                back: new ShapeBack()
            };
        });

        return result;
    }

    private static getObjects(objectsI: Array<any>, parent: IShape, stage: Stage, zeroPoint: IPoint): Array<IShape> {
        const result: Array<IShape> = new Array();
        if (objectsI) {
            objectsI.forEach((object: any) => {
                const point1: IPoint = new Point((object.coordinates[0].x / 10 + zeroPoint.x), (object.coordinates[0].y / 10 + zeroPoint.y));
                const point2: IPoint = new Point((object.coordinates[1].x / 10 + zeroPoint.x), (object.coordinates[1].y / 10 + zeroPoint.y));
                let shape: IShape = new Shape(point1, point2, object.type);
                if (object.type === 5 || object.type === 6 || object.type === 7) {
                    const width: number = point1.getDistance(point2);
                    // debugger;
                    shape = new Shape(point1, parent.point2, object.type);
                    parent.children.push(shape);
                    shape.parents = [parent];
                    shape.point2 = new Point(parent.point2);
                    shape.point1 = MathCalc.linePoint(point1, point2, width / 2);
                    shape.offset = parent.point1.getDistance(shape.point1);
                    shape.plane = object.plane;
                    shape.height = object.height;
                    shape.width = width * 10;
                }
                stage.createShapeControlsAndRender(shape, true);
                result.push(shape);
                if (object.children) {
                    JsonConverter.getObjects(object.children, shape, stage, zeroPoint);
                }
            });
        }
        return result;
    }
}