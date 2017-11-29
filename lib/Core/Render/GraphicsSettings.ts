import { IPoint, IPath } from '../Primitive/Primitive';

export class GraphicsSettings {

    public constructor(center: IPoint) {
        this._center = center;
    }

    private _menu: IPath = null;
    public get menu(): IPath {
        return this._menu;
    }

    public set menu(value: IPath) {
        this._menu = value;
    }

    private _zoom: number = 1;
    public get zoom(): number {
        return this._zoom;
    }
    public set zoom(value: number) {
        this._zoom = value;
    }

    private _center: IPoint;
    public get center(): IPoint {
        return this._center;
    }

    public get cx() {
        return this._center.x;
    }

    public get cy() {
        return this._center.y;
    }

}
