import { IPoint, Point } from './Primitive/Primitive';
import { IShape } from './Shapes/IShape';

export class MathCalc {

    public static getPosition(x: number, y: number, scale, center: IPoint): IPoint {
        const cx: number = center.x;
        const cy: number = center.y;
        const x1: number = x - cx;
        const y1: number = y - cy;
        const r: number = Math.sqrt(Math.pow(x1, 2) + Math.pow(y1, 2));

        const cosN: number = x1 / r;
        const sinN: number = y1 / r;
        const x2: number = (r !== 0) ? cx + r * cosN * scale : x;
        const y2: number = (r !== 0) ? cy + r * sinN * scale : y;
        return new Point(x2, y2);
    }

    public static getShapeLength(shape: IShape): number {
        const point1: IPoint = shape.point1;
        const point2: IPoint = shape.point2;
        const result: number = Math.sqrt(Math.pow(point2.x - point1.x, 2) + Math.pow(point2.y - point1.y, 2));
        return result * 10;
    }

    public static setShapeLength(shape: IShape, length: number): void {
        const point1: IPoint = shape.point1;
        const point2: IPoint = shape.point2;

        const angWithOx = Math.atan2(point2.y - point1.y, point2.x - point1.x);
        const onev: IPoint = new Point(0, 0);
        onev.x = Math.cos(angWithOx);
        onev.y = Math.sin(angWithOx);

        shape.point2.x = point1.x + onev.x * length / 10;
        shape.point2.y = point1.y + onev.y * length / 10;
    }

    public static getNormal(A: IPoint, B: IPoint, C: IPoint): IPoint {
        function VDot(v1: IPoint, v2: IPoint): number {
            return v1.x * v2.x + v1.y * v2.y
        }
        function VMul(v1: IPoint, A: number): IPoint {
            const result: IPoint = new Point(0, 0);
            result.x = v1.x * A;
            result.y = v1.y * A;
            return result;
        }
        function VSub(v1: IPoint, v2: IPoint): IPoint {
            const result: IPoint = new Point(0, 0);
            result.x = v1.x - v2.x;
            result.y = v1.y - v2.y;
            return result;
        }
        function VNorm(V): IPoint {
            const result: IPoint = new Point(0, 0);
            var vl;
            vl = Math.sqrt(V.x * V.x + V.y * V.y);
            result.x = V.x / vl;
            result.y = V.y / vl;
            return result;
        }
        function VProject(A: IPoint, B: IPoint): IPoint {
            let result: IPoint = new Point(0, 0);
            A = VNorm(A);
            result = VMul(A, VDot(A, B));
            return result
        }

        let result: IPoint = new Point(0, 0);
        var CA = VSub(C, A);
        result = VSub(VProject(VSub(B, A), CA), CA);
        return result;
    }

    public static linePoint(point1: IPoint, point2: IPoint, r: number) {
        const x1: number = point1.x;
        const x2: number = point2.x;
        const y1: number = point1.y;
        const y2: number = point2.y;

        const kf: number = (y1 - y2) / (x1 - x2);
        const bf: number = y2 - kf * x2;

        const a: number = 1;
        const b: number = -2 * x1;
        const c: number = x1 * x1 - ((r * r) / (1 + (kf * kf)));

        const D: number = Math.sqrt((b * b) - 4 * a * c);
        const ox1: number = (- b + D) / (2 * a);
        const ox2: number = (- b - D) / (2 * a);

        const oy1: number = kf * ox1 + bf;
        const oy2: number = kf * ox2 + bf;

        return r > 0 ? new Point(ox1, oy1) : new Point(ox2, oy2);
    }
}