import {GameState, IGrid, LevelFormat} from "./Interfaces";
import Text from "./Text";
import Sprite from "./Sprite";
import Engine from "./Engine";
import {GridTypes} from "./Enums";
import {Button, lerp} from "kontra/kontra";
import {DEBUG_MODE, MP, TYPE_OFFSET, TYPES, URLS} from "./Constants";
import {playMusic} from "./PlayMusic";
import {Chatbot} from "./ChatBot";

export class Game {
    private static readonly maxWidth: number = 15;
    private static readonly maxHeight: number = 12;

    private GAME_STATE: GameState;
    private ENGINE_REF: Engine;
    private GRID: IGrid;
    private SCORE_ELEMENT: Text;
    private TARGET_ELEMENT: Text;
    private SCORE_BAR: Sprite;
    private GOAL_ELEMENTS: Text[];
    private UP_BLOCKS: Sprite[] = [];
    private static isPlayingMusic: boolean = false;
    private static BlockInputReasons: Record<string, boolean> = {};
    // private blockInput: boolean = false;

    private chatBot: Chatbot;

    constructor(_engine: Engine, _level: LevelFormat) {
        this.GAME_STATE = Object.assign({
            variables: {
                SCORE: 0,
                CURR_UPS: _level.upAllowance
            }
        }, _level);
        this.ENGINE_REF = _engine;
        this.ENGINE_REF.scene.push(this.SCORE_ELEMENT = Game.createScoreElement(this.GAME_STATE.width));
        this.ENGINE_REF.scene.push(
            this.TARGET_ELEMENT = Game.createTargetElement(this.GAME_STATE.targetScore, this.GAME_STATE.width)
        );
        // ENGINE.scene.push(SCORE_BAR = createScoreBarElement());
        this.ENGINE_REF.scene.push(...(this.GOAL_ELEMENTS = Game.createGoalElements(this.GAME_STATE)));
        this.UP_BLOCKS.push(
            ...Game.createUpBlocks(
                this.GAME_STATE.upAllowance,
                this.ENGINE_REF.getAsset("./assets/button_y.png"),
                this.GAME_STATE.width
            )
        );
        this.UP_BLOCKS.forEach((e: Sprite) => this.ENGINE_REF.scene.push(e));
        this.GRID = Game.createGridElements(
            this.GAME_STATE,
            this.ENGINE_REF.getAsset("./assets/button.png"),
            (x: number, y: number) => this.onButtonPress(x,y)
        );
        // tslint:disable-next-line:typedef
        this.GRID.forEach((a) => {
            // tslint:disable-next-line:typedef
            a.forEach((b) => {
                this.ENGINE_REF.scene.push(b.text);
                this.ENGINE_REF.scene.push(b.button);
            });
        });
        const overlay: Sprite = new Sprite({
            color: "#00000000",
            width: Engine.width,
            height: Engine.height
        });
        _engine.scene.push(overlay);
        this.chatBot = new Chatbot(
            _engine,
            overlay,
            {
                x: (MP.x * 2) - 2,
                y: (MP.y * 2) - 7
            }
        );

        this.chatBot.addToQueue(this.GAME_STATE.dialogue);
        Game.BlockInputReasons.TutorialPlaying = true;
        _engine.scene.push(this.chatBot);
        setTimeout(() => {
            this.chatBot.play(false).then(() => {
                Game.BlockInputReasons.TutorialPlaying = false;
                setTimeout(() => {
                    this.chatBot.addToQueue([
                        {
                            text: "this\nis\na\ntest!!"
                        }
                    ]);
                    this.chatBot.play(true);
                }, 2000);
            });
        }, 800);
        this.updateGameViewToReflectGameState();
        this.updateGridColors();
    }

    private static playMusic(): void {
        playMusic();
    }

    public loadNewLevel(_level: LevelFormat): void {
        this.GAME_STATE = Object.assign({
            variables: {
                SCORE: 0,
                CURR_UPS: _level.upAllowance
            }
        }, _level);

        for(let i: number = 0; i < Game.maxHeight; i++) {
            if(i < this.GAME_STATE.upAllowance) {
                this.UP_BLOCKS[i].x = this.UP_BLOCKS[i]._oldX = 55 + (20 * (this.GAME_STATE.width));
            } else {
                this.UP_BLOCKS[i].x = -50;
            }
        }

        this.SCORE_ELEMENT.x =
            this.TARGET_ELEMENT.x =
                (MP.x * 2) + (-10 * ((Game.maxWidth - this.GAME_STATE.width) + 1));

        for(let y: number = 0; y < Game.maxHeight; y++) {
            for (let x: number = 0; x < Game.maxWidth; x++) {
                const currButt: Button = this.GRID[y][x].button;
                const currTxt: Text = this.GRID[y][x].text;
                currButt.scaleX = currButt.scaleY = ((
                    x >= this.GAME_STATE.width ||
                    y >= this.GAME_STATE.height
                ) ? 0 : 1);
            }
        }

        this.updateGameViewToReflectGameState();
        this.updateGridColors();
    }

    public close(): void {
        // tslint:disable-next-line:prefer-for-of
        for(let y: number = 0; y < this.GRID.length; y++) {
            // tslint:disable-next-line:prefer-for-of
            for(let x: number = 0; x < this.GRID[y].length; x++) {
                this.ENGINE_REF.removeObj(this.GRID[y][x].text);
                this.ENGINE_REF.removeObj(this.GRID[y][x].button);
            }
        }
        this.GRID = null;
        // this.UP_BLOCKS.forEach((e: Sprite) => {
        //     this.ENGINE_REF.removeObj(e);
        // });
        // this.UP_BLOCKS = null;
        this.GOAL_ELEMENTS.forEach((e: Text) => {
            this.ENGINE_REF.removeObj(e);
        });
        this.GOAL_ELEMENTS = null;
    }

    private static createTargetElement(targetScore: number, _levelWidth: number): Text {
        return new Text({
            x: (MP.x * 2) + (-10 * ((Game.maxWidth - _levelWidth) + 1)),
            y: 45,
            anchor: {x: 1, y: 0},
            text: "目標: " + targetScore,
            color: "#FFFFFFAA",
            font: "14px MS Gothic"
        });
    }

    private static createScoreElement(_levelWidth: number): Text {
        return new Text({
            x: (MP.x * 2) + (-10 * ((Game.maxWidth - _levelWidth) + 1)),
            y: 25,
            anchor: {x: 1, y: 0},
            text: " ",
            color: "white",
            font: "16px MS Gothic"
        });
    }

    private static createGoalElements(_level: LevelFormat): Text[] {
        const res: Text[] = [];
        for(let i: number = 0; i < _level.goals.length; i++) {
            for(let g: number = 0; g < _level.goals[i].length; g++) {
                const txt: Text = new Text({
                    x: 50 + (-25 * g),
                    y: (23) + (20 * i),
                    text: TYPES[(_level.goals[i][g] + 1)],
                    color: "white",
                    font: "17px MS Gothic",
                    anchor: {x: 1, y: 0}
                });
                res.push(txt);
            }
        }
        return res;
    }

    private static createUpBlocks(upAllowance: number, upBlockImg: HTMLImageElement, levelWidth: number): Sprite[] {
        const res: Sprite[] = [];
        for(let i: number = 0; i < Game.maxHeight; i++) {
            const currUpBlockBg: Sprite = new Sprite({
                color: "#FFFF0066",
                width: 17,
                height: 17
            });
            const x: number = 55 + (20 * (levelWidth));
            const currUpBlock: Sprite = new Sprite({
                x: x,
                _oldX: x,
                y: (23) + (i * 20),
                image: upBlockImg
            });
            const currUpBlockText: Text = new Text({
                text: TYPES[GridTypes.UP + 1],
                color: "yellow"
            });
            currUpBlock.addChild(currUpBlockBg);
            currUpBlock.addChild(currUpBlockText);
            res.push(currUpBlock);
            if(i >= upAllowance) {
                currUpBlock.x = -50;
            }
        }
        return res;
    }

    private static createGridElements(_level: LevelFormat, _buttonImg: HTMLImageElement, _onBtnPress: Function): IGrid {
        const retVal: IGrid = [];

        for(let y: number = 0; y < Game.maxHeight; y++) {
            retVal.push([]);
            for(let x: number = 0; x < Game.maxWidth; x++) {
                const yOffset: number = 40;
                let textObj: Text;
                const position: {x: number, y: number} = {
                    // x: (0 - ((20 * _level.width) / 2)) + (20 * x) - 90,
                    x: 55 + (20 * x),
                    y: yOffset + (20 * y)
                };

                const button: Button = new Button({
                    x: position.x,
                    y: position.y,
                    image: _buttonImg,
                    anchor: {x: 0, y: 1},

                    // customProps
                    column: x,
                    row: y,
                    linkedButton: null,

                    onUp(): void {
                        _onBtnPress(this.column, this.row);
                    }
                });
                const text: string = Game.getText(x, y, _level);
                const color: string = Game.getColor(x, y, _level);
                textObj = new Text({
                    x: position.x + 10,
                    y: position.y - 8,
                    anchor: {x: 0.5, y: 0.5},
                    // image: obj[urls[0]],
                    width: 16,
                    height: 16,

                    // custom props
                    column: x,
                    row: y,
                    type: _level.contents.grid[y][x] as GridTypes,

                    text,
                    color,
                    font: "14px MS Gothic"
                });
                retVal[y].push({
                    button,
                    text: textObj,
                    type: _level.contents.grid[y][x] as GridTypes
                });

                if(x >= _level.width || y >= _level.height) {
                    button.scaleX = button.scaleY = 0;
                    textObj.scaleX = textObj.scaleY = 0;
                }
            }
        }
        return retVal;
    }

    private isAllowedToInput(): boolean {
        let thisisnotoptimal: boolean = true;
        Object.keys(Game.BlockInputReasons).forEach((e: string) => {
            if(Game.BlockInputReasons[e]) {
                thisisnotoptimal = false;
            }
        });
        return thisisnotoptimal;
    }

    private async onButtonPress(_x: number, _y: number): Promise<void> {
        if(DEBUG_MODE) {
            console.log(`Button @ ${_x}, ${_y}`);
        }

        if(
            !this.isAllowedToInput()
        ) {
            if(DEBUG_MODE) {
                console.warn("do nothing because input is blocked");
            }
            return;
        }

        if(
            this.GAME_STATE.contents.grid[_y][_x] !== GridTypes.UP &&
            this.GAME_STATE.variables.CURR_UPS === 0
        ) {
            if(DEBUG_MODE) {
                console.warn("do nothing because out of ups");
            }
            return;
        }

        if(
            this.GAME_STATE.contents.grid[_y][_x] === GridTypes.EMPTY
        ) {
            if(DEBUG_MODE) {
                console.warn("do nothing because empty");
            }
            return;
        }

        if(
            this.GAME_STATE.contents.grid[0][_x] !== GridTypes.EMPTY
            && this.GAME_STATE.contents.grid[_y][_x] !== GridTypes.UP
        ) {
            if(DEBUG_MODE) {
                console.warn("Cannot move this higher");
            }
            return;
        }

        Game.BlockInputReasons.UpdatingGameState = true;
        if(!Game.isPlayingMusic) {
            Game.isPlayingMusic = true;
            Game.playMusic();
        }

        this.updateGameState(
            _x, _y,
            !(this.GAME_STATE.contents.grid[_y][_x] === GridTypes.UP)
        );

        await new Promise<void>((resolve: Function): void => {
            const frametime: number = 33;
            let id: number;
            let progress: number = 0;
            let stage: number = 0;
            const textObj: Text = this.GRID[_y][_x].text;
            if(DEBUG_MODE) console.log(textObj);
            id = setInterval((): void => {
                switch(stage) {
                    case 0:
                        if(progress >= 1) {
                            textObj.scaleX = 0;
                            progress = 0;
                            stage++;
                            this.updateGameViewToReflectGameState();
                            this.updateGridColors();
                            return;
                        }
                        textObj.scaleX = lerp(1, 0, progress += 0.35);
                        break;
                    case 1:
                        if(progress >= 1) {
                            textObj.scaleX = 1;
                            stage++;
                            return;
                        }
                        textObj.scaleX = lerp(0, 1, progress += 0.35);
                        break;
                    case 2:
                        clearInterval(id);
                        resolve();
                        break;
                }
            }, frametime) as unknown as number;
        });

        delete Game.BlockInputReasons.UpdatingGameState;
        //
        // // tslint:disable-next-line:no-conditional-assignment
        // // this.y += ((this.isUp = !this.isUp) ? -20 : 20);
        // // this.y = yOffset + ((--this.row) * 20);
        //
        // for(let i: number = this.row; i >= 0; i--) {
        //     GRID[i][this.column].button.y += -20;
        //     GRID[i][this.column].button.y = Math.round(GRID[i][this.column].button.y);
        // }
        // updateGridColors();
    }

    private updateGameState(_x: number, _y: number, _goingUp: boolean): void {
        if(_goingUp) {
            for(let y: number = 0; y < _y; y++) {
                this.GAME_STATE.contents.grid[y][_x] = this.GAME_STATE.contents.grid[y+1][_x];
            }
            this.GAME_STATE.contents.grid[_y][_x] = GridTypes.UP;
            this.GAME_STATE.variables.CURR_UPS--;
        } else {
            for(let y: number = _y; y > 0; y--) {
                this.GAME_STATE.contents.grid[y][_x] = this.GAME_STATE.contents.grid[y-1][_x];
            }
            this.GAME_STATE.contents.grid[0][_x] = GridTypes.EMPTY;
            this.GAME_STATE.variables.CURR_UPS++;
        }

        if(DEBUG_MODE) {
            console.log(this.GAME_STATE.contents.grid);
        }
    }

    private updateGridColors(): void {
        let score: number = 0;
        // tslint:disable-next-line:prefer-for-of
        for(let y: number = 0; y < this.GAME_STATE.contents.grid.length; y++) {
            // tslint:disable-next-line:prefer-for-of
            for(let x: number = 0; x < this.GAME_STATE.contents.grid[y].length; x++) {
                // if(GAME_STATE.contents.grid[y][x] === GridTypes.EMPTY) ;
                const goals: number[] = this.GAME_STATE.goals[y];
                let assetChangeNum: number = 0;
                if(!this.GRID[y][x].text._oldPos) this.GRID[y][x].text._oldPos = {
                    x: this.GRID[y][x].text.x,
                    y: this.GRID[y][x].text.y
                };
                if(goals.indexOf(this.GAME_STATE.contents.grid[y][x]) !== -1) {
                    score++;
                    this.GRID[y][x].text.color = "#00FF00";
                    this.GRID[y][x].text.x = this.GRID[y][x].text._oldPos.x;
                    this.GRID[y][x].text.y = this.GRID[y][x].text._oldPos.y;
                } else if(this.GAME_STATE.contents.grid[y][x] === GridTypes.EMPTY) {
                    this.GRID[y][x].text.color = "#FFFFFF00";
                } else if(this.GAME_STATE.contents.grid[y][x] === GridTypes.UP) {
                    this.GRID[y][x].text.color = "#FFFF00";
                    this.GRID[y][x].text.x = this.GRID[y][x].text._oldPos.x - 1;
                    this.GRID[y][x].text.y = this.GRID[y][x].text._oldPos.y - 1;
                    assetChangeNum = 1;
                } else {
                    this.GRID[y][x].text.color = "#FF0000";
                    this.GRID[y][x].text.x = this.GRID[y][x].text._oldPos.x;
                    this.GRID[y][x].text.y = this.GRID[y][x].text._oldPos.y;
                }
                this.GRID[y][x].button.image = this.ENGINE_REF.getAsset(URLS[assetChangeNum]);
            }
        }
        this.SCORE_ELEMENT.text = `スコア: ${(score < 10 ? ("0" + score) : score)}`;
        for(let i: number = 0; i < this.UP_BLOCKS.length; i++) {
            if(i < this.GAME_STATE.variables.CURR_UPS) {
                this.UP_BLOCKS[i].x = this.UP_BLOCKS[i]._oldX;
            } else {
                this.UP_BLOCKS[i].x = -50;
            }
        }
    }

    private updateGameViewToReflectGameState(): void {
        for(let y: number = 0; y < this.GRID.length; y++) {
            // tslint:disable-next-line:prefer-for-of
            for(let x: number = 0; x < this.GRID[y].length; x++) {
                this.GRID[y][x].text.text = Game.getText(x, y, this.GAME_STATE);
            }
        }
    }

    private static getText(x: number, y: number, _state: LevelFormat): string {
        return (_state.contents.grid[y][x] === GridTypes.EMPTY ?
            TYPES[(GridTypes.EMPTY+1)]
            :
            TYPES[(_state.contents.grid[y][x] + TYPE_OFFSET)]) || TYPES[GridTypes.UNDEFINED+1];
    }

    private static getColor(x: number, y: number, _state: LevelFormat): string {
        return _state.contents.grid[y][x] === GridTypes.EMPTY ?
            "#FFFFFF00"
            :
            "#FFFFFFFF";
    }
}
