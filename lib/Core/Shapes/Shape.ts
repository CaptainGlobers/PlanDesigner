import { ShapeBase } from './ShapeBase';
import { IPoint, Point } from '../Primitive/Primitive';
import { ShapeType } from './ShapeType';

export class Shape extends ShapeBase {
    constructor(point1: IPoint, point2: IPoint, type: ShapeType) {
        super();
        this.point1 = new Point(point1);
        this.point2 = new Point(point2);
        this.type = type;
    }
}
