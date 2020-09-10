import {
    GameLoop,
    init, initPointer,
    // initKeys,
    Button,
    Text, Grid
} from "kontra/kontra";
import Sprite from "./Sprite";
import Loader from "./Loader";

export default class Engine {
    public static readonly width: number = 480;
    public static readonly height: number = 272;
    public canvas: HTMLCanvasElement;
    public context: CanvasRenderingContext2D;
    public loop: GameLoop;
    private loader: Loader = new Loader();
    public scene: Array<Grid | Button | Text | Sprite> = [];
    private assets: Record<string, HTMLImageElement>;

    constructor() {
        const canvas: HTMLCanvasElement = document.getElementById("mainCanvas") as HTMLCanvasElement;
        canvas.width = Engine.width, canvas.height = Engine.height;
        const {context}: {context: CanvasRenderingContext2D} = init();
        this.canvas = canvas;
        this.context = context;
        // this.context.scale(0.5, 0.5);
        this.loop = this.createGameLoop();
        // initKeys();
        initPointer();
    }

    public add(url: string | string[]): void {
        return this.loader.add(url);
    }

    public getAsset(key: string): HTMLImageElement {
        return this.assets[key];
    }

    public load(): Promise<Record<string, HTMLImageElement>> {
        return this.loader.load().then((assets: Record<string, HTMLImageElement>) => {
            return this.assets = assets;
        });
    }

    public blackAndWhite(enabled: boolean): void {
        this.canvas.style.filter = enabled ? "grayscale(100%)" : "";
    }

    public removeObj(obj: Sprite | Text | Button): void {
        const i: number = this.scene.findIndex((e: Text | Sprite) => {
            // tslint:disable-next-line:triple-equals
            return e == obj;
        });
        if(i===-1) throw new Error();
        this.scene.splice(i, 1);
    }

    public clearScene(): void {
        this.scene.length = 0;
    }

    public start(): void {
        this.loop.start();
    }

    public stop(): void {
        this.loop.stop();
    }

    private update(dt: number): void {
        this.scene.forEach((e: Sprite) => e.update(dt));
    }

    public createGameLoop(): GameLoop {
        return GameLoop({
            update: (dt: number): void => this.update(dt),
            render: (): void => this.render()
        });
    }

    public reset(): void {
        this.clearScene();
        this.loop.stop();
        this.loop = null;
        this.loop = this.createGameLoop();
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.start();
    }

    public forceRender(): void {
        console.error("This is not to go into production");
        this.render();
    }

    private render(): void {
        this.scene.forEach((e: Sprite | Text) => e.render());
    }
}
