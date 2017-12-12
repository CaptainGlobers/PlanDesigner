export class Events {
    private _mouseMoveListenerPool: Array<EventListener> = new Array();
    private _mouseDownListenerPool: Array<EventListener> = new Array();

    constructor() {
        paper.project.activeLayer.onMouseMove = (event: any) => this.mouseMoveListenerCall(event);
        paper.project.activeLayer.onMouseDown = (event: any) => this.mouseDownListenerCall(event);
    }

    private mouseMoveListenerCall(event: any): void {
        if (this._mouseMoveListenerPool.length > 0) {
            this._mouseMoveListenerPool.forEach((listener: any) => listener(event));
        }
    }

    public addMouseMoveListener(listener: any): void {
        this._mouseMoveListenerPool.push(listener);
    }

    public removeMouseMoveListener(listener: any): void {
        this._mouseMoveListenerPool.splice(this._mouseMoveListenerPool.indexOf(listener), 1);
    }

    public clearMouseMoveListener(): void {
        this._mouseMoveListenerPool = new Array();
    }

    public clearMouseDownListener(): void {
        this._mouseDownListenerPool = new Array();
    }

    private mouseDownListenerCall(event: any): void {
        if (this._mouseDownListenerPool.length > 0) {
            this._mouseDownListenerPool.forEach((listener: any) => listener(event));
        }
    }

    public addMouseDownListener(listener: any): void {
        this._mouseDownListenerPool.push(listener);
    }

    public removeMouseDownListener(listener: any): void {
        this._mouseDownListenerPool.splice(this._mouseDownListenerPool.indexOf(listener), 1);
    }
}