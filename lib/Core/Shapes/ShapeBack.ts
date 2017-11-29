import { IPoint, Point, IGroup } from '../Primitive/Primitive';
import { IShape } from './IShape';

export class ShapeBack implements IShape {
    public type: number = null;
    public point1: IPoint;
    public point2: IPoint;
    public children: Array<IShape>;
    public valid: boolean;
    public renderObject: IGroup;
    public parents: Array<IShape>;
    public scale: number = 1;
    public img: any;
    public offset: number;
    public width: number;
    public height: number;
    public plane: number;

    constructor() {
        this.point1 = new Point(0, 0);
        this.point2 = new Point(0, 0);
    }
}