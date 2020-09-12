import {Button, GameObject} from "kontra/kontra";
import Text from "./Text";
import Engine from "./Engine";
import Easing from "./Easing";
import {Game} from "./Game";
import {TestLevel} from "../Levels/TestLevel";
import {DEBUG_MODE} from "./Constants";
import {TestLevel2} from "../Levels/TestLevel2";
import LevelOrder from "./LevelOrder";

// tslint:disable-next-line
interface props {x?: number, y?: number, width?: number, height?: number, context?: CanvasRenderingContext2D, dx?: number, dy?: number, ddx?: number, ddy?: number, ttl?: number, anchor?: {x: number, y: number}, sx?: number, sy?: number, children?: GameObject[], opacity?: number, rotation?: number, scaleX?: number, scaleY?: number, update?: (dt?: number) => void, render?: Function, [props: string]: any};

export class MainMenu extends GameObject.class {

    private textAnimInterval: unknown;
    private title: Text;
    private subtitle: Text;
    private heading: Text;
    private startButton: Button;

    constructor(_engine: Engine, properties: props) {
        super(properties);
        const self: MainMenu = this;

        this.heading = new Text({
            text: "-404-",
            y: -24,
            color: "white",
            anchor: {x: 0.5, y: 0.5},
            font: "22px MS Gothic",
            textAlign: "center"
        });
        this.addChild(this.heading);
        this.title = new Text({
            text: "友達を見つかりません",
            y: 0,
            color: "white",
            anchor: {x: 0.5, y: 0.5},
            font: "22px MS Gothic",
            textAlign: "center"
        });
        this.addChild(this.title);
        this.subtitle = new Text({
            text: "::FRIEND NOT FOUND::",
            y: 24,
            color: "white",
            anchor: {x: 0.5, y: 0.5},
            font: "14px MS Gothic",
            textAlign: "center"
        });
        this.addChild(this.subtitle);

        this.startButton = Button({
            text: {
                text: "ここクリックして\nゲームを始まります",
                color: "white",
                font: "14px MS Gothic",
                anchor: {x: 0.5, y: 0.5},
                textAlign: "center"
            },
            onUp(): void {
                if(DEBUG_MODE) console.log("starting");
                if(Engine.BlockInputReasons.AnimatingMainMenu) {
                    return;
                }
                Engine.BlockInputReasons.AnimatingMainMenu = true;

                new Promise((resolve: Function): void => {
                    const startTime: number = Date.now();
                    const duration: number = 1000;
                    const testY: number = self.y;
                    const change: number = 500;
                    let id: number;
                    id = setInterval(() => {
                        const progress: number = Date.now() - startTime;
                        self.x += (Math.random() - 0.5) * 5;
                        self.y = Easing.easeInElastic(progress, testY, change, duration);

                        if(progress >= duration) {
                            clearInterval(id);
                            self.y = testY + change;
                            resolve();
                        }
                    }, 33) as unknown as number;

                })
                .then(() => {
                    if(DEBUG_MODE) console.log("done");
                    Engine.BlockInputReasons.AnimatingMainMenu = false;
                    const game: Game = new Game(_engine, LevelOrder.getNextLevel(), true);
                    if(!Game.isPlayingMusic) {
                        Game.isPlayingMusic = true;
                        Game.playMusic();
                    }
                    if(DEBUG_MODE) { // @ts-ignore
                        window._GAME = game;
                    }
                });
            },
            update(): void {
                if(!Engine.isAllowedToInput()) return;
                if(this.hovered) {
                    this.color = "#008800FF";
                } else {
                    this.color = "#005500FF";
                }
            },
            width: 150,
            height: 43,
            color: "#005500FF",
            y: 114,
            anchor: {x: 0.5, y: 0.5},
        });
        this.addChild(this.startButton);

        this.textAnimInterval = setInterval(() => {
            this.title.color = this.subtitle.color = this.heading.color =
                `#${
                    this.generateRandomColor()
                }${
                    this.generateRandomColor()
                }${
                    this.generateRandomColor()
                }FF`;
        }, 250);
    }

    public update(dt?: number): void {
        super.update(dt);
    }

    private generateRandomColor(): string {
        let res: string = Math.round((Math.random() * 100) + 150).toString(16);
        if(res.length === 1) res = "0" + res;
        return res;
    }
}
