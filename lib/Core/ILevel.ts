import { IShape } from './Shapes/IShape';
import { ShapeBack } from './Shapes/ShapeBack';

export interface ILevel {
    level: number;
    objects: Array<IShape>;
    back?: ShapeBack;
}