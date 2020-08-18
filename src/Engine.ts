import {
    GameLoop,
    init,
    initKeys,
    Text
} from "kontra/kontra";
import Sprite from "./Sprite";
import Loader from "./Loader";

export default class Engine {
    public canvas: HTMLCanvasElement;
    public context: CanvasRenderingContext2D;
    public loop: GameLoop;
    public loader: Loader = new Loader();
    public scene: Array<Text | Sprite> = [];

    constructor() {
        const canvas: HTMLCanvasElement = document.getElementById("mainCanvas") as HTMLCanvasElement;
        canvas.width = 480, canvas.height = 272;
        const {context}: {context: CanvasRenderingContext2D} = init();
        this.canvas = canvas;
        this.context = context;
        // this.context.scale(0.5, 0.5);
        this.loop = GameLoop({
            update: (dt: number): void => this.update(dt),
            render: (): void => this.render()
        });
        initKeys();
    }

    public blackAndWhite(enabled: boolean): void {
        this.canvas.style.filter = enabled ? "grayscale(100%)" : "";
    }

    public removeObj(obj: Sprite | Text): void {
        const i: number = this.scene.findIndex((e: Text | Sprite) => {
            // tslint:disable-next-line:triple-equals
            return e == obj;
        });
        if(i===-1) throw new Error();
        this.scene.splice(i, 1);
    }

    public start(): void {
        this.loop.start();
    }

    private update(dt: number): void {
        this.scene.forEach((e: Sprite) => e.update(dt));
    }

    private render(): void {
        this.scene.forEach((e: Sprite | Text) => e.render());
    }
}
