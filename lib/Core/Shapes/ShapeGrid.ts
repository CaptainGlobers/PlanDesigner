import { IShape } from './IShape';
import { IPoint, IGroup } from '../Primitive/Primitive';


export class ShapeGrid implements IShape {
    public type: number = null;
    public point1: IPoint;
    public point2: IPoint;
    public children: Array<IShape>;
    public valid: boolean;
    public renderObject: IGroup;
    public parents: Array<IShape>;
    public offset: number;
    public width: number;
    public height: number;
    public plane: number;
}