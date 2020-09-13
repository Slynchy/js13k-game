import {GameState, IGrid, LevelFormat} from "./Interfaces";
import Text from "./Text";
import Sprite from "./Sprite";
import Engine from "./Engine";
import {GridTypes} from "./Enums";
import {Button, lerp} from "kontra/kontra";
import {DEBUG_MODE, LEVEL_EDIT_MODE, mAnchor, MP, TYPE_OFFSET, TYPES, URLS} from "./Constants";
import {beep, playMusic} from "./PlayMusic";
import {Chatbot} from "./ChatBot";

export class Game {
    public static readonly maxWidth: number = 15;
    public static readonly maxHeight: number = 12;

    private GAME_STATE: GameState;
    private ENGINE_REF: Engine;
    private GRID: IGrid;
    private SCORE_ELEMENT: Text;
    private LEVEL_ID_ELEMENT: Text;
    private TARGET_ELEMENT: Text;
    private SCORE_BAR: Sprite;
    private GOAL_ELEMENTS: Text[][];
    private UP_BLOCKS: Sprite[] = [];
    public static isPlayingMusic: boolean = false;
    // private blockInput: boolean = false;

    private chatBot: Chatbot;

    private initializeGameState(_level: LevelFormat): void {
        this.GAME_STATE = Object.assign({
            variables: {
                SCORE: 0,
                CURR_UPS: _level.upAllowance
            }
        }, _level);

        while(this.GAME_STATE.goals.length < Game.maxHeight) {
            this.GAME_STATE.goals.unshift(new Array(2).fill(GridTypes.EMPTY));
        }

        while(this.GAME_STATE.contents.grid.length < Game.maxHeight) {
            this.GAME_STATE.contents.grid.unshift(
                new Array(this.GAME_STATE.width).fill(GridTypes.EMPTY)
                    .concat(
                        new Array(Game.maxWidth - this.GAME_STATE.width).fill(GridTypes.UNDEFINED)
                    )
            );
        }
        // tslint:disable-next-line:prefer-for-of
        for(let y: number = 0; y < this.GAME_STATE.contents.grid.length; y++) {
            while(this.GAME_STATE.contents.grid[y].length < Game.maxWidth) {
                this.GAME_STATE.contents.grid[y].push(GridTypes.UNDEFINED);
            }
        }
    }

    constructor(_engine: Engine, _level: LevelFormat, autoStart?: boolean) {
        this.initializeGameState(_level);
        this.ENGINE_REF = _engine;
        this.ENGINE_REF.scene.push(this.SCORE_ELEMENT = Game.createScoreElement(this.GAME_STATE.width));
        this.ENGINE_REF.scene.push(
            this.TARGET_ELEMENT = Game.createTargetElement(this.GAME_STATE.targetScore, this.GAME_STATE.width)
        );
        this.ENGINE_REF.scene.push(
            this.LEVEL_ID_ELEMENT = Game.createLevelIDElement(this.GAME_STATE.levelId, this.GAME_STATE.width)
        );
        // ENGINE.scene.push(SCORE_BAR = createScoreBarElement());
        this.GOAL_ELEMENTS = Game.createGoalElements(this, this.GAME_STATE);
        // tslint:disable-next-line:prefer-for-of
        for(let y: number = 0; y < this.GOAL_ELEMENTS.length; y++) {
            // tslint:disable-next-line:prefer-for-of
            for(let x: number = 0; x < this.GOAL_ELEMENTS[y].length; x++) {
                this.ENGINE_REF.scene.push(this.GOAL_ELEMENTS[y][x]);
            }
        }
        this.UP_BLOCKS.push(
            ...Game.createUpBlocks(
                this.GAME_STATE.upAllowance,
                this.ENGINE_REF.getAsset("./a/b_y.png"),
                this.GAME_STATE.width,
                this.GAME_STATE.height
            )
        );
        this.UP_BLOCKS.forEach((e: Sprite) => this.ENGINE_REF.scene.push(e));
        this.GRID = Game.createGridElements(
            this.GAME_STATE,
            this.ENGINE_REF.getAsset("./a/b.png"),
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

        if(autoStart) {
            this.start();
        } else {
            Engine.BlockInputReasons.PlayNotYetStarted = true;
        }
        this.updateGameViewToReflectGameState();
        this.updateGridColors();
    }

    public static createLevelIDElement(_levelId: string, _levelWidth: number): Text {
        return new Text({
            x: (MP.x * 2) + (-10 * ((Game.maxWidth - _levelWidth) + 1)) - 20,
            y: 12,
            anchor: {x: 1, y: 0},
            text: `レベル ${_levelId}`,
            color: "#FFFFFFAA",
            textAlign: "center",
            font: "10px MS Gothic"
        });
    }

    public start(skipTutorial?: boolean): void {
        Engine.BlockInputReasons.PlayNotYetStarted = false;

        this.chatBot.addToQueue(this.GAME_STATE.dialogue);
        if(!this.ENGINE_REF.isInScene(this.chatBot)) this.ENGINE_REF.scene.push(this.chatBot);

        if(skipTutorial || !this.GAME_STATE.dialogue || this.GAME_STATE.dialogue.length === 0) {
            return;
        } else {
            Engine.BlockInputReasons.TutorialPlaying = true;
        }

        setTimeout(() => {
            this.chatBot.play(false).then(() => {
                Engine.BlockInputReasons.TutorialPlaying = false;
            });
        }, 800);
    }

    public getEngine(): Engine {
        return this.ENGINE_REF;
    }

    public getScore(): number {
        return this.GAME_STATE.variables.SCORE;
    }

    public showOrHide(hide: boolean): void {
        // private GRID: IGrid;
        // private SCORE_ELEMENT: Text;
        // private TARGET_ELEMENT: Text;
        // private SCORE_BAR: Sprite;
        // private GOAL_ELEMENTS: Text[];
        // private UP_BLOCKS: Sprite[] = [];
        const hideOffset: number = 2000;
        for(let y: number = 0; y < Game.maxHeight; y++) {
            if(hide) {
                this.UP_BLOCKS[y].x -= hideOffset;
            } else {
                this.UP_BLOCKS[y].x += hideOffset;
            }
            for(let x: number = 0; x < Game.maxWidth; x++) {
                if(hide) {
                    this.GRID[y][x].button.x -= hideOffset;
                    this.GRID[y][x].text.x -= hideOffset;
                } else {
                    this.GRID[y][x].button.x += hideOffset;
                    this.GRID[y][x].text.x += hideOffset;
                }
            }
        }

        // tslint:disable-next-line:prefer-for-of
        for(let i: number = 0; i < this.GOAL_ELEMENTS.length; i++) {
            // tslint:disable-next-line:prefer-for-of
            for(let g: number = 0; g < this.GOAL_ELEMENTS[i].length; g++) {
                const curr: Text = this.GOAL_ELEMENTS[i][g];
                if (hide) {
                    curr.x -= hideOffset;
                } else {
                    curr.x += hideOffset;
                }
            }
        }

        if(hide) {
            this.SCORE_ELEMENT.x -= hideOffset;
            this.TARGET_ELEMENT.x -= hideOffset;
            this.LEVEL_ID_ELEMENT.x -= hideOffset;
            this.chatBot.x -= hideOffset;
        } else {
            this.SCORE_ELEMENT.x += hideOffset;
            this.TARGET_ELEMENT.x += hideOffset;
            this.LEVEL_ID_ELEMENT.x += hideOffset;
            this.chatBot.x += hideOffset;
        }
    }

    public static playMusic(): void {
        playMusic();
    }

    public loadNewLevel(_level: LevelFormat): void {
        this.initializeGameState(_level);

        for(let i: number = 0; i < Game.maxHeight; i++) {
            if(i < this.GAME_STATE.upAllowance) {
                this.UP_BLOCKS[i].x = this.UP_BLOCKS[i]._oldX = 55 + (20 * (this.GAME_STATE.width));
            } else {
                this.UP_BLOCKS[i].x = -50;
            }
            this.UP_BLOCKS[i].y = (MP.y * 2) - (20 * i) - (29);
        }

        for(let i: number = 0; i < Game.maxHeight; i++) {
            for (let g: number = 0; g < 2; g++) {
                if(i < this.GAME_STATE.goals.length && g < this.GAME_STATE.goals[i].length) {
                    this.GOAL_ELEMENTS[i][g].text = TYPES[this.GAME_STATE.goals[i][g] + 1];
                    if(this.GAME_STATE.goals[i][g] === GridTypes.EMPTY) {
                        this.GOAL_ELEMENTS[i][g].color = "#FFFFFF00";
                    }
                } else {
                    this.GOAL_ELEMENTS[i][g].text = " ";
                }
                this.GOAL_ELEMENTS[i][g].y = (23 + (20 * (Game.maxHeight - this.GAME_STATE.goals.length))) + (20 * (i));
            }
        }

        this.SCORE_ELEMENT.x =
            this.TARGET_ELEMENT.x =
                (MP.x * 2) + (-10 * ((Game.maxWidth - this.GAME_STATE.width) + 1));
        this.LEVEL_ID_ELEMENT.x = this.SCORE_ELEMENT.x + (-20);
        this.TARGET_ELEMENT.text = "目標: " + this.GAME_STATE.targetScore;
        this.LEVEL_ID_ELEMENT.text = "レベル " + this.GAME_STATE.levelId;

        this.updateGameViewToReflectGameState();
        this.updateGridColors();
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

    private static createGoalElements(_game: Game, _level: LevelFormat): Text[][] {
        const res: Text[][] = [];
        for(let i: number = 0; i < Game.maxHeight; i++) {
            res.push([]);
            for(let g: number = 0; g < 2; g++) {
                let type: string;
                if(i < _level.goals.length && g < _level.goals[i].length && _level.goals[i][g] !== GridTypes.EMPTY) {
                    type = TYPES[(_level.goals[i][g] + 1)];
                } else {
                    type = " ";
                }
                let txt: Text;
                if(LEVEL_EDIT_MODE) {
                    txt = Button({
                        x: 50 + (-25 * g),
                        y: (23) + (20 * i),
                        type: _level.goals[i][g],
                        text: {
                            text: TYPES[(_level.goals[i][g] + 1)],
                            color: "white",
                            font: "17px MS Gothic",
                            anchor: {
                                x: 1,
                                y: 0,
                            },
                        },
                        onUp(): void {
                            console.log("AAA");
                            _level.goals[i][g] += 1;
                            if(_level.goals[i][g] === GridTypes.UP) {
                                _level.goals[i][g] = GridTypes.EMPTY;
                            }
                            this.textNode.text = TYPES[(_level.goals[i][g] + 1)];
                            _game.updateGridColors();
                        },
                        anchor: {x: 1, y: 0}
                    }) as unknown as Text;
                } else {
                    txt = new Text({
                        x: 50 + (-25 * g),
                        y: (23 + (20 * (Game.maxHeight - _level.goals.length))) + (20 * (i)),
                        text: type,
                        color: "white",
                        font: "17px MS Gothic",
                        anchor: {x: 1, y: 0}
                    });
                }
                res[i].push(txt);
            }
        }
        return res;
    }

    private static createUpBlocks(
        upAllowance: number,
        upBlockImg: HTMLImageElement,
        levelWidth: number,
        levelHeight: number
    ): Sprite[] {
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
                y: (MP.y * 2) - (20 * i) - (29),
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
                let textObj: Text;
                const position: {x: number, y: number} = {
                    // x: (0 - ((20 * _level.width) / 2)) + (20 * x) - 90,
                    x: 55 + (20 * x),
                    y: 40 + ((Game.maxHeight - _level.height) * 20) + (20 * y) - 20
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
                let type: GridTypes = GridTypes.EMPTY;
                if(x < _level.width && y < _level.height) {
                    type =_level.contents.grid[y][x];
                }
                textObj = new Text({
                    x: position.x + 10,
                    y: position.y - 8,
                    anchor: mAnchor,
                    // image: obj[urls[0]],
                    width: 16,
                    height: 16,

                    // custom props
                    column: x,
                    row: y,
                    type: type,

                    text,
                    color,
                    font: "14px MS Gothic"
                });
                retVal[y].push({
                    button,
                    text: textObj,
                    type: type
                });
            }
        }
        return retVal;
    }

    private async onButtonPress(_x: number, _y: number): Promise<void> {
        if(DEBUG_MODE) {
            console.log(`Button @ ${_x}, ${_y}`);
        }

        const position: {x: number, y: number} = {
            x: _x,
            y: _y,
        };

        if(
            !Engine.isAllowedToInput()
        ) {
            if(DEBUG_MODE) {
                console.warn("do nothing because input is blocked");
                console.warn(Engine.BlockInputReasons);
            }
            return;
        }

        if(
            this.GAME_STATE.contents.grid[position.y][position.x] !== GridTypes.UP &&
            this.GAME_STATE.variables.CURR_UPS === 0
        ) {
            if(DEBUG_MODE) {
                console.warn("do nothing because out of ups");
            }
            return;
        }

        if(
            (this.GAME_STATE.contents.grid[position.y][position.x] === GridTypes.EMPTY ||
            this.GAME_STATE.contents.grid[position.y][position.x] === GridTypes.UNDEFINED) &&
            !LEVEL_EDIT_MODE
        ) {
            if(DEBUG_MODE) {
                console.warn("do nothing because empty");
            }
            return;
        }

        if(
            this.GAME_STATE.contents.grid[0][position.x] !== GridTypes.EMPTY
            && this.GAME_STATE.contents.grid[0][position.x] !== GridTypes.UNDEFINED
            && this.GAME_STATE.contents.grid[position.y][position.x] !== GridTypes.UP
            && !LEVEL_EDIT_MODE
        ) {
            if(DEBUG_MODE) {
                console.warn("Cannot move this higher");
            }
            return;
        }

        Engine.BlockInputReasons.UpdatingGameState = true;

        beep(100, 1);

        if(LEVEL_EDIT_MODE) {
            this.GAME_STATE.contents.grid[position.y][position.x] += 1;
            if(this.GAME_STATE.contents.grid[position.y][position.x] === GridTypes.UP) {
                this.GAME_STATE.contents.grid[position.y][position.x] = GridTypes.WILDCARD;
            }
            this.updateGameViewToReflectGameState();
            this.updateGridColors();
        } else {
            this.updateGameState(
                position.x, position.y,
                !(this.GAME_STATE.contents.grid[position.y][position.x] === GridTypes.UP)
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
        }

        Engine.BlockInputReasons.UpdatingGameState = false;
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
                if(this.GAME_STATE.contents.grid[y][x] === GridTypes.EMPTY) {
                    this.GRID[y][x].text.color = "#FFFFFF00";
                    this.GRID[y][x].button.image = this.ENGINE_REF.getAsset(URLS[0]);
                    continue;
                } else if(this.GAME_STATE.contents.grid[y][x] === GridTypes.UNDEFINED) {
                    this.GRID[y][x].button.image = null;
                    this.GRID[y][x].text.color = "#FFFFFF00";
                    continue;
                }
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
        this.GAME_STATE.variables.SCORE = score;
        for(let i: number = 0; i < this.UP_BLOCKS.length; i++) {
            if(i < this.GAME_STATE.variables.CURR_UPS) {
                this.UP_BLOCKS[i].x = this.UP_BLOCKS[i]._oldX;
            } else {
                this.UP_BLOCKS[i].x = -50;
            }
        }

        if(LEVEL_EDIT_MODE) return;
        if(score >= this.GAME_STATE.targetScore) {
            this.chatBot.showLevelEnd(this);
        } else {
            this.chatBot.hideLevelEnd();
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
        // if(x >= _state.width || y >= _state.height) return TYPES[(GridTypes.EMPTY+1)];
        return (_state.contents.grid[y][x] === GridTypes.EMPTY ?
            (TYPES[(GridTypes.EMPTY+1)])
            :
            (TYPES[(_state.contents.grid[y][x] + TYPE_OFFSET)])); // can never trigger || TYPES[GridTypes.UNDEFINED+1];
    }

    private static getColor(x: number, y: number, _state: LevelFormat): string {
        // if(x >= _state.width || y >= _state.height) return "#FFFFFF00";
        return _state.contents.grid[y][x] === GridTypes.EMPTY ?
            "#FFFFFF00"
            :
            "#FFFFFFFF";
    }
}
