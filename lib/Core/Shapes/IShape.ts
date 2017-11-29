import { IPoint, IGroup } from '../Primitive/Primitive';


export interface IShape {
    type: number;
    point1: IPoint;
    point2: IPoint;
    children: Array<IShape>;
    valid: boolean;
    renderObject: IGroup;
    parents: Array<IShape>;
    offset: number;
    width: number;
    height: number;
    plane: number;
}