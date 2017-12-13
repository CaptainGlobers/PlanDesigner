import { IShape } from './IShape';
import { ShapeType } from './ShapeType';
import { IPoint, IGroup } from '../Primitive/Primitive';

export class ShapeBase implements IShape {
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
}
