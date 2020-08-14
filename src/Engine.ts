import {GameLoop, init} from "kontra/kontra";
import Sprite from "./Sprite";
import Loader from "./Loader";

export default class Engine {
    public canvas: HTMLCanvasElement;
    public context: CanvasRenderingContext2D;
    public loop: GameLoop;
    public loader: Loader = new Loader();
    public scene: Sprite[] = [];

    constructor() {
        const canvas: HTMLCanvasElement = document.getElementById("mainCanvas") as HTMLCanvasElement;
        canvas.width = 480, canvas.height = 272;
        const {context} = init();
        this.canvas = canvas;
        this.context = context;
        this.loop = GameLoop({
            update: (dt) => this.update(dt),
            render: () => this.render()
        });
    }

    public start(): void {
        this.loop.start();
    }

    private update(dt): void {
        this.scene.forEach((e: Sprite) => e.update(dt));
    }

    private render(): void {
        this.scene.forEach((e: Sprite) => e.render());
    }
}
