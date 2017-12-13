import { IShape } from '../Shapes/IShape';
import { IPoint, IPath, IGroup, Point } from '../Primitive/Primitive';
import { MathCalc } from '../MathCalc';

export class GraphicsSettings {
    public static readonly current: GraphicsSettings = new GraphicsSettings();

    private _menu: IPath;
    public get menu(): IPath {
        return this._menu;
    }

    public set menu(value: IPath) {
        this._menu = value;
    }

    private _grid: IShape;
    public get grid(): IShape {
        return this._grid;
    }

    public set grid(value: IShape) {
        this._grid = value;
    }

    public insertBelowGrid(renderObject: IGroup): void {
        renderObject.insertBelow(this._grid.renderObject);
    }

    public moveAboveGrid(path: IPath): void {
        (path as any).moveAbove(this._grid.renderObject);
    }

    public insertAboveMenu(shape: IShape, renderObject?: IGroup): void {
        if (renderObject) {
            renderObject.insertAbove(this._menu);
        } else {
            shape.renderObject.insertAbove(this._menu);
        }
    }

    public insertBelowMenu(shape: IShape, renderObject?: IGroup): void {
        if (renderObject) {
            renderObject.insertBelow(this._menu);
        } else {
            shape.renderObject.insertBelow(this._menu);
        }
    }

    private _zoom: number = 1;
    public get zoom(): number {
        return this._zoom;
    }
    public set zoom(value: number) {
        this._zoom = value;
    }

    private _offset: IPoint = new Point(0, 0);
    public get offset(): IPoint {
        return this._offset;
    }
    public set offset(value: IPoint) {
        this._offset = value;
    }

    private _center: IPoint;
    public get center(): IPoint {
        return this._center;
    }
    public set center(value: IPoint) {
        this._center = value;
    }

    public originalPosition(x: number, y: number): IPoint {
        return MathCalc.getPosition(x, y, 1 / this.zoom, this.center);
    }

    public newPosition(x: number, y: number): IPoint {
        return MathCalc.getPosition(x, y, this.zoom, this.center);
    }

}
