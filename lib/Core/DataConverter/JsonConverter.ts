import { IPoint, Point } from '../Primitive/Primitive';
import { ILevel } from '../ILevel';
import { IShape } from '../Shapes/IShape';
import { Shape } from '../Shapes/Shape';
import { Render } from '../Render/Render';
import { MathCalc } from '../MathCalc';

export class JsonConverter {

    public static getLevels(data: string, render: Render): Array<ILevel> {
        const dataI: any = JSON.parse(data);
        const zeroPoint: IPoint = new Point(dataI.offset[0], dataI.offset[1]);

        const getObjects = (objectsI: Array<any>, parent: IShape) => {
            const result: Array<IShape> = new Array();
            if (objectsI) {
                objectsI.forEach((object) => {
                    const point1: IPoint = new Point((object.coordinates[0].x / 10 + zeroPoint.x), (object.coordinates[0].y / 10 + zeroPoint.y));
                    const point2: IPoint = new Point((object.coordinates[1].x / 10 + zeroPoint.x), (object.coordinates[1].y / 10 + zeroPoint.y));
                    let shape: IShape = new Shape(point1, point2, object.type);
                    if (object.type === 5 || object.type === 6 || object.type === 7) {
                        const width: number = point1.getDistance(point2);
                        //debugger;
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
                    render.createShape(shape, true);
                    result.push(shape);
                    if (object.children) {
                        getObjects(object.children, shape);
                    }
                });
            }
            return result;
        }

        const isUnderLevelSet: boolean = (dataI.levels[0][-1]) ? true : false;
        //const iterator = isUnderLevelSet ? -1 : 0;

        const result: Array<ILevel> = [];
        if (!isUnderLevelSet) {
            result.push({
                level: -1,
                objects: new Array()
            });
        }

        dataI.levels.forEach((levelI: any, i: number) => {
            if (isUnderLevelSet && i === 0) {
                i = -1;
            } else if (isUnderLevelSet) {
            } else if (!isUnderLevelSet) {
                i++;
            }
            result.push({
                level: null,
                objects: getObjects(levelI[i].objects, null)
            });
        });

        return result;
    }
}