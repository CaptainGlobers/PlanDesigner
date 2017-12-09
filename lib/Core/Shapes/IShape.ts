import { ShapeType } from './ShapeType';
import { IPoint, IGroup } from '../Primitive/Primitive';

export interface IShape {
    type: ShapeType;
    point1: IPoint;
    point2: IPoint;
    children: Array<IShape>;
    renderObject: IGroup;
    parents: Array<IShape>;
    offset: number;
    width: number;
    height: number;
    plane: number;
}