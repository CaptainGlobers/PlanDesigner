import { IShape } from './Shapes/IShape';
import { BackgroundShape } from './Shapes/ShapeBack';

export interface ILevel {
    floorNumber: number;
    objects: Array<IShape>;
    back: BackgroundShape;
}