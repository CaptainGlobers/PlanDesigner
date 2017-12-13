import { GraphicsSettings } from './Render/GraphicsSettings';

export class StageMoveController {
    private _positionStartX: number;
    private _positionStartY: number;
    private _differenceX: number;
    private _differenceY: number;
    private _mouseTimeMove: Array<number> = [];
    private _mousePathX: Array<number> = [];
    private _mousePathY: Array<number> = [];
    private _mouseVelocityX: Array<number> = [];
    private _mouseVelocityY: Array<number> = [];
    private _positionCurrentX: number;
    private _positionCurrentY: number;
    private _requestAnimationFrameID: number;
    private _offsetX: number = 0;
    private _offsetY: number = 0;
    private _mouseDown: boolean = false;

    private _moveCallback: (offsetX: number, offsetY: number) => void;
    private _canvas: HTMLCanvasElement;
    private _isStageMoveable: boolean = true;

    constructor(
        canvas: HTMLCanvasElement,
        moveCallback: (offsetX: number, offsetY: number) => void,
        wheelListener: (e: WheelEvent) => void
    ) {
        this._canvas = canvas;
        this._moveCallback = moveCallback;
        this._wheelListener = wheelListener;
    }

    public resetOffset(): void {
        this._offsetX = 0;
        this._offsetY = 0;
        this._moveCallback(this._offsetX, this._offsetY);
    }

    public set isStageMoveable(value: boolean) {
        this._isStageMoveable = value;
    }

    private mouseMoveListener(e: MouseEvent): void {
        if (this._mouseDown) {
            this._positionCurrentX = e.pageX - this._canvas.offsetLeft;
            this._positionCurrentY = e.pageY - this._canvas.offsetTop;

            this._mousePathX.push(this._positionCurrentX);
            this._mousePathY.push(this._positionCurrentY);
            this._mouseTimeMove.push(Date.now());

            if (this._mouseTimeMove[this._mouseTimeMove.length - 2] === this._mouseTimeMove[this._mouseTimeMove.length - 1]) {
                this._mouseTimeMove[this._mouseTimeMove.length - 1]++;
            }

            this._mouseVelocityX.push(Math.round((this._mousePathX[this._mousePathX.length - 2] - this._positionCurrentX) / (this._mouseTimeMove[this._mouseTimeMove.length - 2] - this._mouseTimeMove[this._mouseTimeMove.length - 1])));
            this._mouseVelocityY.push(Math.round((this._mousePathY[this._mousePathY.length - 2] - this._positionCurrentY) / (this._mouseTimeMove[this._mouseTimeMove.length - 2] - this._mouseTimeMove[this._mouseTimeMove.length - 1])));

            this._differenceX = (this._positionCurrentX - this._positionStartX) / this.zoom;
            this._offsetX = this._offsetX + this._differenceX + this._mouseVelocityX[this._mouseVelocityX.length - 1];
            this._positionStartX = this._positionCurrentX;

            this._differenceY = (this._positionCurrentY - this._positionStartY) / this.zoom;
            this._offsetY = this._offsetY + this._differenceY + this._mouseVelocityY[this._mouseVelocityY.length - 1];
            this._positionStartY = this._positionCurrentY;
        }
    }

    private stopPostAnimation(): void {
        this._mouseTimeMove = []; this._mousePathX = []; this._mousePathY = []; this._mouseVelocityX = []; this._mouseVelocityY = [];
        this._positionStartX = 0; this._positionStartY = 0; this._differenceX = 0; this._differenceY = 0;
        cancelAnimationFrame(this._requestAnimationFrameID);
    }

    private mouseUpListener(e: MouseEvent): void {
        this._mouseDown = false;
        this.stopPostAnimation();
    }

    private mouseOutListener(e: MouseEvent): void {
        this._mouseDown = false;
    }

    private moveStage(): void {
        if (this._mouseDown === false) {
            this.stopPostAnimation();
        }

        this._moveCallback(this._offsetX, this._offsetY);
        this._requestAnimationFrameID = requestAnimationFrame(this.moveStage.bind(this));
    }

    private mouseDownListener(e: MouseEvent): void {
        this.stopPostAnimation();
        if (this._isStageMoveable) {
            this._mouseDown = true;
            this._positionStartX = e.pageX - this._canvas.offsetLeft;
            this._positionStartY = e.pageY - this._canvas.offsetTop;

            this._mousePathX.push(this._positionStartX);
            this._mousePathY.push(this._positionStartY);
            this._mouseTimeMove.push(Date.now() - 1);

            this._requestAnimationFrameID = requestAnimationFrame(this.moveStage.bind(this));
        }
    }

    private _wheelListener: (e: WheelEvent) => void;

    public mouseDetect(): void {
        this._canvas.addEventListener('mousedown', (event: MouseEvent) => this.mouseDownListener(event), false);
        this._canvas.addEventListener('mousemove', (event: MouseEvent) => this.mouseMoveListener(event), false);
        this._canvas.addEventListener('mouseup', (event: MouseEvent) => this.mouseUpListener(event), false);
        this._canvas.addEventListener('mouseout', (event: MouseEvent) => this.mouseOutListener(event), false);
        this._canvas.addEventListener('mousewheel', (event: WheelEvent) => this._wheelListener(event), false);
    }

    // TODO: Refactor GraphicsSettings
    private get zoom(): number {
        return GraphicsSettings.current.zoom;
    }
}