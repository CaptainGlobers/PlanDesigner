import { IShape } from './IShape';
import { IPoint, Point, IGroup } from '../Primitive/Primitive';
import { ShapeType } from './ShapeType';

export class Shape implements IShape {
    public type: ShapeType;
    public point1: IPoint;
    public point2: IPoint;
    public children: Array<IShape>;
    public renderObject: IGroup;
    public parents: Array<IShape>;
    public offset: number;
    public width: number;
    public height: number;
    public plane: number;

    constructor(point1: IPoint, point2: IPoint, type: ShapeType) {
        this.point1 = new Point(point1);
        this.point2 = new Point(point2);
        this.type = type;
    }
}