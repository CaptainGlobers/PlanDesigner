import { Point, IPoint } from '../Primitive/Primitive';
import { ILevel } from '../ILevel';
import { IShape } from '../Shapes/IShape';
import { MathCalc } from '../MathCalc';

export class DataConverter {

    public static getJson(levels: Array<ILevel>): string {
        // TODO: set zeroPoint check for all levels
        let zeroPoint: IPoint = levels[1].objects[0] ? new Point(levels[1].objects[0].point1) : new Point(0, 0);
        const getZeroShape: (shapes: Array<IShape>) => void = (shapes: Array<IShape>): void => {
            if (shapes) {
                shapes.forEach((shape: IShape) => {
                    if (shape.type && shape.type > 0 && shape.type < 8) {
                        if (shape.point1.x < zeroPoint.x && shape.point1.y < zeroPoint.y) {
                            zeroPoint = new Point(shape.point1);
                        }
                        if (shape.point2.x < zeroPoint.x && shape.point2.y < zeroPoint.y) {
                            zeroPoint = new Point(shape.point2);
                        }
                    }
                    getZeroShape(shape.children);
                });
            }
        };

        levels.forEach((level: ILevel, i: number) => {
            if (!level.level) {
                getZeroShape(level.objects);
            }
        });

        const getShapes: (shapes: Array<IShape>) => void = (shapes: Array<IShape>): any => {
            const result = new Array();
            if (shapes) {
                shapes.forEach((shape: IShape) => {
                    if (shape.type === 5 || shape.type === 6 || shape.type === 7) {
                        const point1: IPoint = MathCalc.linePoint(shape.point1, shape.point2, -shape.width / 20);
                        const point2: IPoint = MathCalc.linePoint(point1, shape.point2, shape.width / 10);

                        result.push({
                            type: shape.type,
                            coordinates: [
                                {
                                    x: Math.round((point1.x - zeroPoint.x) * 10),
                                    y: Math.round((point1.y - zeroPoint.y) * 10)
                                }, {
                                    x: Math.round((point2.x - zeroPoint.x) * 10),
                                    y: Math.round((point2.y - zeroPoint.y) * 10)
                                },
                            ],
                            children: getShapes(shape.children),
                            plane: shape.plane,
                            height: shape.height
                        });
                    } else if (shape.type > 0 && shape.type < 8) {
                        result.push({
                            type: shape.type,
                            coordinates: [
                                {
                                    x: Math.round((shape.point1.x - zeroPoint.x) * 10),
                                    y: Math.round((shape.point1.y - zeroPoint.y) * 10)
                                }, {
                                    x: Math.round((shape.point2.x - zeroPoint.x) * 10),
                                    y: Math.round((shape.point2.y - zeroPoint.y) * 10)
                                },
                            ],
                            children: getShapes(shape.children)
                        });
                    }
                });
            }

            return !result.length ? undefined : result;
        };

        const isUnderLevelSet: boolean = levels[0].level === null;
        let iterator: number = isUnderLevelSet ? -1 : 1;

        const getLevels = (): any => {
            const result = new Array();
            levels.forEach((level: ILevel, i: number) => {
                if (!level.level) {
                    result.push({
                        [iterator]: {
                            objects: getShapes(level.objects)
                        },
                    });
                    if (iterator === -1) {
                        iterator++;
                    }
                    iterator++;
                }
            });
            return result;
        };

        const result = {
            levels: getLevels(),
            offset: [Math.round(zeroPoint.x), Math.round(zeroPoint.y)]
        };

        return JSON.stringify(result);
    }
}