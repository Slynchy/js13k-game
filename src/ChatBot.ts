import Sprite from "./Sprite";
import {Button, GameObject, pointerPressed} from "kontra/kontra";
import Engine from "./Engine";
import {DEBUG_MODE, mAnchor, MP, URLS} from "./Constants";
import Text from "./Text";
import Easing from "./Easing";
import {Game} from "./Game";
import LevelOrder from "./LevelOrder";
import {LevelFormat} from "./Interfaces";
import {MainMenu} from "./MainMenu";
import {currLang, Localizations} from "./Localizations";

const faceParts: Record<string, string> = {
    Eye1: "E1",
    Eye2: "E2",
    Mouth1: "M1"
};
const faceTemplate: string = `(.${faceParts.Eye1}${faceParts.Mouth1}${faceParts.Eye2}.)`;
const eyes: Record<string, string> = {
    NORMAL: "ʘ",
    UPSET_L: "ᗒ",
    UPSET_R: "ᗕ",
    SAD_R: "ಥ",
    SAD_L: "ಥ",
    CHILL: "˘",
    LOOK_L: "◕",
    CONFUSED: "？",
    HAPPY: "^",
    BLINK: "◡"
};
const mouths: Record<string, string> = {
    NORMAL: "‿",
    UPSET: "ᗣ",
    HAPPY: "◡",
    SAD: "﹏"
};
interface FacialExpression { Eye1?: string; Eye2?: string; Mouth1?: string; disableBlink?: boolean; }
const facialExpressions: Record<string, FacialExpression> = {
    NORMAL: {
        Eye1: eyes.NORMAL,
        Eye2: eyes.NORMAL,
        Mouth1: mouths.NORMAL
    },
    CHILL: {
        Eye1: eyes.CHILL,
        Eye2: eyes.CHILL,
        Mouth1: mouths.NORMAL,
        disableBlink: true
    },
    BLINK: {
        Eye1: eyes.BLINK,
        Eye2: eyes.BLINK
    },
    BLINK_2: {
        Eye1: eyes.BLINK,
        Eye2: eyes.BLINK,
        Mouth1: mouths.NORMAL,
        disableBlink: true,
    },
    UPSET: {
        Eye1: eyes.UPSET_L,
        Eye2: eyes.UPSET_R,
        Mouth1: mouths.UPSET,
        disableBlink: true
    },
    CONFUSED: {
        Eye1: eyes.CONFUSED,
        Eye2: eyes.CONFUSED,
        Mouth1: mouths.UPSET,
        disableBlink: true
    },
    SAD: {
        Eye1: eyes.SAD_L,
        Eye2: eyes.SAD_R,
        Mouth1: mouths.SAD,
        disableBlink: true
    },
    LOOK_LEFT: {
        Eye1: eyes.LOOK_L,
        Eye2: eyes.LOOK_L,
        Mouth1: mouths.NORMAL
    },
    HAPPY: {
        Eye1: eyes.HAPPY,
        Eye2: eyes.HAPPY,
        Mouth1: mouths.NORMAL,
        disableBlink: true,
    }
};

export class Chatbot extends GameObject.class {

    private currentFacialExpression: FacialExpression = Object.assign({}, facialExpressions.NORMAL);
    private mainBotSprite: Text;
    private speechBubbleSprite: { sprite: Sprite, text: Text, nextButton: Button };
    private overlayRef: Sprite;
    private resolveFunc: Function = null;

    private queue: Array<{
        text: string;
        face?: string; // key
    }> = [];

    private canSkip: boolean = false;
    private isOpen: boolean = false;

    private closePromise: Promise<void>;

    private pointerUp: boolean = false;

    // tslint:disable-next-line:no-any
    constructor(_engine: Engine, _overlay: Sprite, props: any) {
        super(props);
        this.overlayRef = _overlay;
        this.mainBotSprite = Chatbot.createChatBot(_engine);
        this.updateFacialExpression(facialExpressions.NORMAL);
        this.speechBubbleSprite = Chatbot.createSpeechBubble(
            _engine,
            (): void => {
                if(!this.canSkip) return;
                this.canSkip = true;
                if(DEBUG_MODE) console.log("next");
                this.continueText();
            }
        );
        this.addChild(this.mainBotSprite);
        this.addChild(this.speechBubbleSprite.sprite);

        let id: number = 0;
        let up: number = 2;
        id = setInterval(() => {
            this.speechBubbleSprite.sprite.y += up;
            up *= -1;
        }, 1000) as unknown as number;

        let swich: boolean = true;
        let backup: FacialExpression = null;
        const cb: Function = (): void => {
            if(swich) {
                if(!this.currentFacialExpression.disableBlink) {
                    backup = Object.assign({}, this.currentFacialExpression);
                    this.updateFacialExpression(facialExpressions.BLINK);
                }
                setTimeout(cb, 350);
            } else {
                if(!this.currentFacialExpression.disableBlink) {
                    this.updateFacialExpression(backup);
                }
                setTimeout(cb, 2000);
            }
            swich = !swich;
        };
        setTimeout(cb, 2000);

        this.speechBubbleSprite.nextButton.textNode.color = "#00FFFF00";
        this.speechBubbleSprite.sprite.x = -999;
        // setTimeout(() => {
        //     this.changeLine("INTRO");
        // }, 1000);
    }

    public showLevelEnd(_game: Game): void {
        if(this.showingLevelEnd) return;
        this.addToQueue([
            {
                text: Localizations.ChatBot_LevelEnd[currLang()],
                face: "NORMAL"
            },
        ]);
        this.speechBubbleSprite.nextButton.textNode.color = "#00FF00FF";
        this.showingLevelEnd = true;
        this.play(true).then(() => {
            // @ts-ignore
            if(!window._SCORE_COUNTER) window._SCORE_COUNTER = 0;
            // @ts-ignore
            window._SCORE_COUNTER += _game.getScore();

            const level: LevelFormat = LevelOrder.getNextLevel();
            if(level) {
                _game.loadNewLevel(level);
                this.speechBubbleSprite.nextButton.textNode.color = "#00FFFFFF";
                _game.start();
            } else {
                _game.showOrHide(true);

                const text: Text = new Text({
                    // @ts-ignore
                    text: Localizations.ThanksForPlaying[currLang()] + window._SCORE_COUNTER.toString(),
                    textAlign: "center",
                    font: "22px MS Gothic",
                    color: "white",
                    x: MP.x,
                    y: MP.y + 20,
                    anchor: mAnchor
                });
                _game.getEngine().scene.push(text);

                const stuff: {
                    heading: Text,
                    title: Text,
                    subheading: Text
                } = MainMenu.createTitle();
                stuff.heading.x += MP.x;
                stuff.title.x += MP.x;
                stuff.subheading.x += MP.x;
                stuff.heading.y += MP.y * 0.35;
                stuff.title.y += MP.y * 0.35;
                stuff.subheading.y += MP.y * 0.35;
                _game.getEngine().scene.push(stuff.heading);
                _game.getEngine().scene.push(stuff.title);
                _game.getEngine().scene.push(stuff.subheading);

                const url: string= "https://slynch.dev";
                const button: Button = Button({
                    x: MP.x,
                    y: MP.y * 1.75,
                    font: "22px MS Gothic",
                    text: {
                        text: url,
                        color: "white",
                        anchor: mAnchor,
                        textAlign: "center"
                    },
                    onUp(): void {
                        // tslint:disable-next-line
                        var win = window.open(url, "_blank");
                        win.focus();
                    },
                    anchor: mAnchor,
                });
                _game.getEngine().scene.push(button);

                const url2: string= "https://twitter.com/Slynch2203";
                const button2: Button = Button({
                    x: MP.x,
                    y: MP.y * 1.9,
                    text: {
                        text: "@Slynch2203",
                        color: "white",
                        anchor: mAnchor,
                        textAlign: "center"
                    },
                    onUp(): void {
                        // tslint:disable-next-line
                        var win = window.open(url2, "_blank");
                        win.focus();
                    },
                    anchor: mAnchor,
                });
                _game.getEngine().scene.push(button2);
            }
        });
    }

    public hideLevelEnd(): void {
        if(!this.showingLevelEnd) return;
        this.speechBubbleSprite.nextButton.textNode.color = "#00FFFFFF";
        this.showingLevelEnd = false;
        this.queue.shift();
        this.close(true);
    }

    public update(dt?: number): void {
        super.update(dt);
        this.pointerUp = pointerPressed("left");
    }

    public addToQueue(key: Array<{
        text: string;
        face?: string; // key
    }>): void {
        if(!key) return;
        if(Array.isArray(key)) {
            this.queue.push(...key);
        } else {
            this.queue.push(key);
        }
    }

    public async play(hideOverlay?: boolean): Promise<void> {
        if(this.closePromise) await this.closePromise;
        if(this.isOpen) return;
        this.isOpen = true;
        this.speechBubbleSprite.sprite.x = -71;
        this.speechBubbleSprite.sprite.scaleX = 0;

        let id: unknown;
        const startTime: number = Date.now();
        const duration: number = 1000;
        await new Promise<void>((resolve: Function): void => {
            id = setInterval((): void => {
                const progress: number = Date.now() - startTime;
                this.speechBubbleSprite.sprite.scaleX = Easing.easeOutQuad(progress, 0, 1, duration);
                if(!hideOverlay) {
                    const colVal: string = (
                        Math.round(
                            Easing.easeOutQuad(progress, 0, 102, duration)
                        )
                    ).toString(16);
                    this.overlayRef.color = `#000000${colVal.length === 1 ? "0"+colVal : colVal}`;
                }
                if(progress >= duration) {
                    // @ts-ignore
                    clearInterval(id);
                    if(!hideOverlay) this.overlayRef.color = "#00000066";
                    this.speechBubbleSprite.sprite.scaleX = 1;
                    resolve();
                }
            }, 16);
        });
        if(!hideOverlay) this.overlayRef.color = "#00000066";
        while(this.queue.length !== 0) {
            const line: string = this.queue[0].text;
            const face: string = this.queue[0].face;
            await this.changeLine(line, face);
            this.queue.shift();
        }
        this.closePromise = this.close(hideOverlay).then(() => {
            this.closePromise = null;
        });
    }

    public changeLine(line: string, face?: string): Promise<void> {
        if(face) this.updateFacialExpression(facialExpressions[face] || facialExpressions.NORMAL);
        return new Promise<void>((resolve: Function): void => {
            setTimeout(() => {
                this.speechBubbleSprite.text.text = "";
                let charIndex: number = 0;
                let id: number = 0;
                id = setInterval(() => {
                    if(charIndex >= line.length || this.pointerUp) {
                        this.pointerUp = false;
                        clearInterval(id);
                        this.speechBubbleSprite.text.text = line;
                        this.speechBubbleSprite.nextButton.textNode.color =
                            this.speechBubbleSprite.nextButton.textNode.color.substr(0,7) + "FF";
                        this.canSkip = true;
                        this.resolveFunc = resolve;
                        return;
                    }

                    this.speechBubbleSprite.text.text += line[charIndex];
                    charIndex++;
                }, 100) as unknown as number;
            }, 600);
        });
    }

    private updateFacialExpression(_new: FacialExpression): void {
        this.currentFacialExpression = Object.assign(this.currentFacialExpression, _new);
        this.currentFacialExpression.disableBlink = _new.disableBlink || false;
        let str: string = faceTemplate;
        str = str.replace(faceParts.Eye1, this.currentFacialExpression.Eye1);
        str = str.replace(faceParts.Eye2, this.currentFacialExpression.Eye2);
        str = str.replace(faceParts.Mouth1, this.currentFacialExpression.Mouth1);
        this.mainBotSprite.text = str;
    }

    private static createChatBot(_engine: Engine): Text {
        return new Text({
            text: `(.◕◡◕.)`,
            x: -45,
            y: -5,
            anchor: {x: 0.5, y: 1},
            color: "white",
            font: "16px Hiragino Kaku Gothic Pro"
        });
    }

    private async close(hideOverlay?: boolean): Promise<void> {
        // elapsed, startPosition, endPosition, duration
        if(!this.isOpen) return;
        this.isOpen = false;
        let id: unknown;
        const startTime: number = Date.now();
        const duration: number = 1000;
        this.updateFacialExpression(facialExpressions.NORMAL);
        await new Promise<void>((resolve: Function): void => {
            id = setInterval((): void => {
                const progress: number = Date.now() - startTime;
                this.speechBubbleSprite.sprite.scaleX = Easing.easeOutQuad(progress, 1, -1, duration);
                if(!hideOverlay) {
                    const colVal: string = (
                        Math.round(
                            Easing.easeOutQuad(progress, 102, -102, duration)
                        )
                    ).toString(16);
                    this.overlayRef.color = `#000000${colVal.length === 1 ? "0"+colVal : colVal}`;
                }
                if(progress >= duration) {
                    // @ts-ignore
                    clearInterval(id);
                    if(!hideOverlay) this.overlayRef.color = "#00000000";
                    this.speechBubbleSprite.sprite.x = -999;
                    this.speechBubbleSprite.sprite.scaleX = 1;
                    this.speechBubbleSprite.text.text = " ";
                    resolve();
                }
            }, 16);
        });
    }

    private continueText(): void {
        if(this.queue.length === 0) {
            this.close();
            return;
        }
        if(this.resolveFunc) {
            this.resolveFunc();
            this.resolveFunc = null;
        }
    }

    private static createSpeechBubble(_engine: Engine, _onUp: Function):
        { sprite: Sprite, text: Text, nextButton: Button } {
        const sprite: Sprite = new Sprite({
            x: -71,
            y: -115,
            anchor: mAnchor,
            image: _engine.getAsset(URLS[2])
        });
        const text: Text =  new Text({
            x: 0,
            y: -78,
            color: "white",
            lineHeight: 1.4,
            textAlign: "center",
            anchor: {x: 0.5, y: 0},
            text: "　", // "赤赤赤赤赤\n赤赤赤赤赤\n赤赤赤赤赤\n赤赤赤赤赤\n赤赤赤赤赤\n赤赤赤赤赤\n赤赤赤赤赤\n",
            font: "14px MS Gothic"
        });
        const nextButton: Button = Button({
            x: 23,
            y: 38,
            text: {
                text: "🡆",
                color: "#00FFFF00"
            },
            onUp: _onUp
        });
        sprite.addChild(nextButton);
        sprite.addChild(text);

        return {
            nextButton,
            sprite,
            text
        };
    }
}
