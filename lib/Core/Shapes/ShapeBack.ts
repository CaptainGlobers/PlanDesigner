import { ShapeBase } from './ShapeBase';
import { ShapeType } from './ShapeType';
import { IPoint, Point } from '../Primitive/Primitive';

export class BackgroundShape extends ShapeBase {
    public type: ShapeType = ShapeType.BackGround;
    public point1: IPoint = new Point(0, 0);
    public point2: IPoint = new Point(0, 0);

    public scale: number = 1;
    public img: any;
}
