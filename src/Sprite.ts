import {Sprite as KSprite} from "kontra";
import {GameObject} from "kontra/kontra";
import {onUpdate, update} from "./SharedFunctions";

interface args {color?: string, image?: HTMLImageElement | HTMLCanvasElement, animations?: object, x?: number, y?: number, width?: number, height?: number, context?: CanvasRenderingContext2D, dx?: number, dy?: number, ddx?: number, ddy?: number, ttl?: number, anchor?: {x: number, y: number}, sx?: number, sy?: number, children?: GameObject[], opacity?: number, rotation?: number, scaleX?: number, scaleY?: number, update?: (dt?: number) => void, render?: Function, [props: string]: any}

export default class Sprite extends KSprite.class {
    constructor(props: args) {
        super(props);
    }

    public get onUpdate(): {add: Function, remove: Function} {
        return onUpdate.call(this);
    }

    public update(dt: number): void {
        super.update(dt);
        update.call(this, dt);
    }
}
