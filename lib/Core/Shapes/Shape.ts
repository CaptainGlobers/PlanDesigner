﻿import { IShape } from './IShape';
import { IPoint, Point, IGroup } from '../Primitive/Primitive';

export class Shape implements IShape {
    public type: number;
    public point1: IPoint;
    public point2: IPoint;
    public children: Array<IShape>;
    public valid: boolean;
    public renderObject: IGroup;
    public parents: Array<IShape>;
    public offset: number;
    public width: number = undefined;
    public height: number = undefined;
    public plane: number = undefined;

    constructor(point1: IPoint, point2: IPoint, type: number) {
        this.point1 = new Point(point1);
        this.point2 = new Point(point2);
        this.type = type;
    }
}