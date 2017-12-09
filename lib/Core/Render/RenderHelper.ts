import { IShape } from '../Shapes/IShape';

export class RenderHelper {
    public static deleteShapeInternal(shape: IShape, shapes: IShape[]): void {
        let item: number = shapes.indexOf(shape);
        if (item > -1) {
            shape.renderObject.remove();
            RenderHelper.deleteShapes(shape.children, shape);
            shape.children = undefined;
            shapes.splice(item, 1);
        } else if ((shape.type === 5 || shape.type === 6 || shape.type === 7) && shape.parents) {
            item = shape.parents[0].children.indexOf(shape);
            if (item > -1) {
                shape.renderObject.remove();
                shape.parents[0].children.splice(item, 1);
            }
        } else {
            console.warn('ex: delete Shape not found shape');
        }
    }

    private static deleteShapes(shapes: Array<IShape>, parent?: IShape): void {
        if (shapes) {
            shapes.forEach((shape: IShape) => {
                if (shape.parents && shape.parents.length < 2) { // not del control
                    shape.renderObject.remove();
                    RenderHelper.deleteShapes(shape.children);
                } else if (parent) {
                    const item: number = shape.parents.indexOf(parent);
                    shape.parents.splice(item, 1);
                }
            });
        }
    }
}