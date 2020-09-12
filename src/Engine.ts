import {
    GameLoop,
    init, initPointer,
    // initKeys,
    Button,
    Text, Grid, GameObject
} from "kontra/kontra";
import Sprite from "./Sprite";
import Loader from "./Loader";
import {Game} from "./Game";

export default class Engine {
    public static readonly width: number = 480;
    public static readonly height: number = 272;
    public canvas: HTMLCanvasElement;
    public context: CanvasRenderingContext2D;
    public loop: GameLoop;
    private loader: Loader = new Loader();
    public scene: Array<Grid | Button | Text | Sprite | GameObject> = [];
    private assets: Record<string, HTMLImageElement>;

    public static BlockInputReasons: Record<string, boolean> = {};
    private savedDataEvent: boolean;
    private savedData: object = {};

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
        this.loadSave();
    }

    public static isAllowedToInput(): boolean {
        let thisisnotoptimal: boolean = true;
        Object.keys(Engine.BlockInputReasons).forEach((e: string) => {
            if(Engine.BlockInputReasons[e]) {
                thisisnotoptimal = false;
            }
        });
        return thisisnotoptimal;
    }

    private loadSave(): void {
        this.savedData = JSON.parse(window.localStorage.getItem("404sl") || "{}");
    }

    public save(newData: object, skipSave?: boolean): void {
        this.savedData = Object.assign(this.savedData, newData);

        if(!this.savedDataEvent && !skipSave) {
            this.savedDataEvent = true;
            setTimeout((): void => {
                window.localStorage.setItem("404sl", JSON.stringify(this.savedData));
                this.savedDataEvent = false;
            }, 1000);
        }
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

    public isInScene(go: GameObject): boolean {
        return (this.scene.findIndex(
            (e: GameObject) => e === go
        ) !== -1);
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
        this.scene.forEach((e: GameObject) => e.update(dt));
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
        this.scene.forEach((e: GameObject) => {
            if(
                (e.x - (e.width * e.anchor.x)) > Engine.width ||
                (e.x + (e.width * e.anchor.x)) < 0 ||
                (e.y - (e.height * e.anchor.y)) > Engine.height ||
                (e.y + (e.height * e.anchor.y)) < 0
            ) {
                // console.log("not rendering");
                return;
            } else {
                e.render();
            }
        });
    }
}
