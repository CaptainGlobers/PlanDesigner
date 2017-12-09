import { IShape } from './IShape';
import { IPoint, IGroup } from '../Primitive/Primitive';
import { ShapeType } from './ShapeType';

export class ShapeGrid implements IShape {
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