/// <reference path='../../../external/paper.d.ts'/>

export interface IItem extends paper.Item { }

export interface IPoint extends paper.Point { }
export class Point extends paper.Point { }

export interface IGroup extends paper.Group { }
export class Group extends paper.Group { }

export interface ISize extends paper.Size { }
export class Size extends paper.Size { }

export interface IPath extends paper.Path { }
export class Path extends paper.Path { }

export interface IColor extends paper.Color { }
export class Color extends paper.Color { }

export interface IPointText extends paper.PointText { }
export class PointText extends paper.PointText {
    public static create(point: Point, justification: string, textColor: string | IColor, content: string, fontSize?: number): IPointText {
        const text: IPointText = new PointText(point);
        text.justification = justification;
        text.fillColor = textColor;
        text.content = content;
        if (fontSize) {
            text.fontSize = fontSize;
        }

        return text;
    }
}

export interface IRaster extends paper.Raster { }
export class Raster extends paper.Raster {
    public static create(source: string, point: IPoint, scale: number, opacity?: number): IRaster {
        const raster: IRaster = new Raster(source);
        raster.position = point;
        raster.scale(scale);
        if (opacity !== undefined) {
            raster.opacity = opacity;
        }

        return raster;
    }
}
