import { IShape } from './Shapes/IShape';
import { ShapeBack } from './Shapes/ShapeBack';

export interface ILevel {
    floorNumber: number;
    objects: Array<IShape>;
    back: ShapeBack;
}