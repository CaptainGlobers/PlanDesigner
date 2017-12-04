import { IColor, Color } from '../Primitive/Primitive';

export class ColorConfig {
    public static stroke: IColor | string = 'black';
    public static mouseEnter: IColor = new Color(0, 0.45, 1, 0.5);

    public static outerWall: IColor = new Color(1, 0.45, 0, 0.5);
    public static innerWall: IColor = new Color(0.60, 0.73, 0.21, 0.5);
    public static partition: IColor = new Color(0.72, 0.34, 0.02, 0.5);
    public static column: IColor = new Color(1, 0.45, 0, 0.5);
    public static control: IColor | string = 'yellow';

    public static window: IColor = new Color(0.44, 0.62, 0.80, 0.5);
    public static doorWay: IColor = new Color(0.72, 0.34, 0.02, 0.5);

    public static black: IColor = new Color(1, 1, 1, 1);
    public static transparent: IColor = new Color(0, 0, 0, 0);

    public static menuText: IColor | string = '#956429';
    public static button: string = '#f6f0e7';
    public static menuMouseEnter: string = '#ffbb80';
    public static line: string = '#0088ff';
    public static gridLine: string = '#cccccc';
    public static dialog: string = '#C9AB8D';

}
