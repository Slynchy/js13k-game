import {Text as KText} from "kontra";
import {GameObject} from "kontra/kontra";
import {onUpdate, update} from "./SharedFunctions";

// tslint:disable-next-line:max-line-length class-name no-any
interface args {text: string; font?: string; color?: string; width?: number; textAlign?: string; lineHeight?: number; x?: number; y?: number; height?: number; context?: CanvasRenderingContext2D; dx?: number; dy?: number; ddx?: number; ddy?: number; ttl?: number; anchor?: {x: number, y: number}; sx?: number; sy?: number; children?: GameObject[]; opacity?: number; rotation?: number; scaleX?: number; scaleY?: number; update?: (dt?: number) => void; render?: Function; [props: string]: any;}

export default class Text extends KText.class {

    private _alpha: number;

    constructor(props: args) {
        super(props);
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

    public get onUpdate(): {add: Function, remove: Function} {
        return onUpdate.call(this);
    }

    public update(dt: number): void {
        super.update(dt);
        update.call(this, dt);
    }

}
