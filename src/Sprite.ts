import {Sprite as KSprite} from "kontra";
import {GameObject} from "kontra/kontra";
import {onUpdate, update} from "./SharedFunctions";

// tslint:disable-next-line:max-line-length class-name no-any
interface args {color?: string; image?: HTMLImageElement | HTMLCanvasElement; animations?: object; x?: number; y?: number; width?: number; height?: number; context?: CanvasRenderingContext2D; dx?: number; dy?: number; ddx?: number; ddy?: number; ttl?: number; anchor?: {x: number, y: number}; sx?: number; sy?: number; children?: GameObject[]; opacity?: number; rotation?: number; scaleX?: number; scaleY?: number; update?: (dt?: number) => void; render?: Function; [props: string]: any;}

export default class Sprite extends KSprite.class {

    public _alpha: number = 1;

    constructor(props: args) {
        super(props);
    }

    public get onUpdate(): {add: Function, remove: Function} {
        return onUpdate.call(this);
    }

    public set alpha(e: number) {
        this._alpha = Math.min(Math.max(0, e), 1);
        this.updateAlpha();
    }

    public get alpha(): number {
        return this._alpha;
    }

    private updateAlpha(): void {
        const newCol: string = (Math.round(this._alpha * 255)).toString(16);
        this.color = this.color.substr(0, 7) + ((newCol.length === 1) ? "0" : "") + newCol;
    }

    public update(dt: number): void {
        super.update(dt);
        update.call(this, dt);
    }
}
