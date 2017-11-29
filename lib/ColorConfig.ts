import { IColor, Color } from './Core/Primitive/Primitive';

export class ColorConfig {
    public static outerWall: IColor = new Color(1, 0.45, 0, 0.5);
    public static innerWall: IColor = new Color(0.60, 0.73, 0.21, 0.5);
    public static partition: IColor = new Color(0.72, 0.34, 0.02, 0.5);
    public static column: IColor = new Color(1, 0.45, 0, 0.5);

    public static window: IColor = new Color(0.44, 0.62, 0.80, 0.5);
    public static doorWay: IColor = new Color(0.72, 0.34, 0.02, 0.5);
    public static door: IColor = null;
    public static wallPlace: IColor = new Color(1, 1, 1, 1);
}