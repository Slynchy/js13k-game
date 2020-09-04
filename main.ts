import Engine from "./src/Engine";
import Sprite from "./src/Sprite";
import Text from "./src/Text";
import {
    SpriteSheet,
    keyPressed,
} from "kontra/kontra";

const engine: Engine = new Engine();
const mp: {x: number, y: number} = {x: 480 / 2, y: 272 / 2}; // midpoint
const ts: number = 1000; // threshold

const anims: object = {
    idle: {
        frames: "0..7",  // frames 0 through 9
        frameRate: 12
    },
    idle_slow: {
        frames: "0..7",
        frameRate: 3
    },
    die: {
        frames: "8..14",
        frameRate: 10,
        loop: false
    },
    atk: {
        frames: "16..18",
        frameRate: 10,
        loop: false
    }
};

/**
 * key map for input to graphic
 */
const keys: {[key: string]: string} = {
    up:"↑",
    down:"↓",
    right:"→",
    left: "←",
    a: "A",
    s: "S",
    d: "D",
    f: "F",
};

/**
 * slowmo speedscale
 */
const sss: number = 0.2;

/**
 * default speedscale
 */
const dss: number = 1.5;

/**
 * Current speedscale
 */
let css: number = dss;

let sTime: number = 0;
let cTime: number = 0;

let enemy: Sprite;
let player: Sprite;
let vStop: boolean = false;

const timeline: Array<{t: number, e: string}> = [
    {
        t: 2000, // 2 seconds in
        e: "atk"
    }
];

const urls: string[] = [
    "assets/parallax-demon-woods-far-trees.png",
    "assets/parallax-demon-woods-mid-trees.png",
    "assets/parallax-demon-woods-close-trees.png",
    "assets/goodguy/Run.png",
    // "assets/badguy/Run.png"
];
engine.loader.add(urls);
engine.loader.load().then((obj: {[key: string]: HTMLImageElement}) => {
    sTime = Date.now();

    for(let i: number = 0; i < 3; i++) {
        const sprites: Sprite[] = [];
        for(let l: number = 0; l < 3; l++) {
            const s: Sprite = new Sprite({
                x: (296 * 2) * l,
                y: 25,
                anchor: {x: 0, y: 0},
                scaleX: 2,
                scaleY: 2,
                image: obj[urls[i]]
            });
            engine.scene.push(s);
            sprites.push(s);
        }
        sprites[0].onUpdate.add(function(e: number): void { t(sprites, (1 - (1 / (i+1))) * 66, e);});
    }
    function t(x: Sprite[], s: number, e: number): void {
        for(let i: number = 0; i < x.length; i++) {
            const c: Sprite = x[i];
            c.x -= s * e * css;
            if(c.x <= -(c.width * c.scaleX)) {
                c.x = (c.width * c.scaleX) * i;
            }
        }
    }

    const spriteSheet: SpriteSheet = SpriteSheet({
        image: obj[urls[3]],
        frameWidth: 100,
        frameHeight: 100,

        // this will also call createAnimations()
        animations: anims
    });
    player = new Sprite({
        anchor: {x: 0.5, y: 0.5},
        x: 160,
        y: 244,
        scaleX: 2,
        scaleY: 2,
        animations: spriteSheet.animations
    });
    player.dead = false;
    player.onUpdate.add(function(): void {
        cTime = Date.now() - sTime;

        const e: {t: number, e: string} = timeline[0];
        if(e && cTime > e.t) {
            timeline.shift();
            switch(e.e) {
                case "atk":
                    enemy.active = true;
                    setTimeout(() => {
                        createButtons();
                    }, 2500);
                    break;
                default:
                    console.warn("unhandled event " + e.e);
            }
        }

        if (keyPressed("a")) {
            slowmo(true, [enemy, player]);
        } else if (keyPressed("d")) {
            slowmo(false, [enemy, player]);
        }
    });
    engine.scene.push(player);

    const spriteSheetBadguy: SpriteSheet = SpriteSheet({
        image: obj[urls[3]],
        frameWidth: 100,
        frameHeight: 100,
        animations: anims
    });

    const sv: number = 480+50;
    enemy = new Sprite({
        x: sv,
        y: 244,
        scaleX: -2,
        scaleY: 2,
        active: false,
        anchor: {x: 0.5, y: 0.5},
        animations: spriteSheetBadguy.animations
    });
    engine.scene.push(enemy);
    enemy.onUpdate.add(function(e: number): void {
        if(!this.active) return;
        this.x -= 45 * e * (!player.dead ? css : 1);
        if(!player.dead && this.x <= player.x + 60) {
            this.active = false;
            stop();
        }
        // if(this.x < -50) {
        //     this.x = sv;
        //     this.active = false;
        // }
    });

    engine.start();
});

async function createButtons(): Promise<void> {
    // setup
    await fade(true, null, 2)
        .then((sprite: Sprite) => {
            slowmo(true, [player, enemy]);
            engine.blackAndWhite(true);
            return fade(false, sprite, 1);
        });
    const enemyPos: number = enemy.x;

    // consts
    const duration: number = 1200;
    const xOffset: number = 100;
    const yOffset: number = 15;

    // first slow everything
    // then show the pattern
    // then reset to old position and normal speed
    // player then has to enter the combo or die
    slowmo(true, [player, enemy]);

    // generate order
    const objKeys: string[] = Object.keys(keys);
    const order: string[] = [];
    const rand: number = 0;
    for(let i: number = 0; i < Math.ceil(rand + 5); i++) {
        order.push(objKeys[Math.floor(Math.random() * objKeys.length)]);
    }

    let counter: number = 0;
    for(let i: number = 0; i < order.length; i++) {
        const delay: number = (500 + duration) * i;
        let text: Text = new Text({
            text: keys[order[i]],
            font: "18px MS Gothic",
            color: "#FFFFFF00",
            alpha: 0,
            x: xOffset + (Math.random() * (480 - (xOffset * 2))),
            y: yOffset + (Math.random() * 75),
            anchor: {x: 0.5, y: 0.5},
            textAlign: "center"
        });
        engine.scene.push(text);
        let updateFunctionId: string;
        const updateFunction: Function = function(e: Text): void {
            if(!this._timer) {
                this._timer = Date.now();
                return;
            }
            if (!this.direction) {
                this.alpha = Math.min((Date.now() - this._timer), duration) / duration;
                this.scaleX = this.scaleY = this.alpha + 1;
            } else {
                this.alpha = 1 - (((Date.now() - duration) - this._timer) / duration);
                this.scaleX = this.scaleY = this.alpha*2;
            }
            if(this.alpha === 1 && !this.direction) {
                this.direction = true;
            } else if(this.alpha === 0 && this.direction) {
                // destroy
                engine.removeObj(text);
                text.onUpdate.remove(updateFunctionId);
                text = null;
                counter++;
                if(counter === order.length) {
                    finish();
                }
            }
        };
        setTimeout((): void => {
            updateFunctionId = text.onUpdate.add(updateFunction);
        }, delay);

        async function finish(): Promise<void> {
            await fade(true, null, 2.5)
                .then((sprite: Sprite) => {
                    engine.blackAndWhite(false);
                    enemy.x = enemyPos;
                    slowmo(false, [enemy, player]);
                    return fade(false, sprite, 1.25);
                });
        }
    }

}

function createButtonsOld(): void {

    let target: Text = new Text({
        text: "O",
        font: "12px Arial",
        color: "#FFFFFFAA",
        x: mp.x + 2,
        y: mp.y,
        anchor: {x: 0.5, y: 0.5},
        textAlign: "center"
    });
    target.setScale(2.5,2.5);
    engine.scene.push(target);

    let i: number = -1;
    const order: string[] = [];
    const objKeys: string[] = Object.keys(keys);
    for(let o: number = 0; o < Math.ceil(Math.random() * 20); o++) {
        order.push(objKeys[Math.floor(Math.random() * objKeys.length)]);
    }

    for(const k of order) {
        i++;
        const p: number = (-60 - (order.length - (i+1))) + (24 * i);
        let text: Text = new Text({
            text: keys[k],
            font: "12px MS Gothic",
            color: "#FFFFFF00",
            x: 240,
            y: p,
            anchor: {x: 0.5, y: 0.5},
            textAlign: "center"
        });
        let id: string;
        id = text.onUpdate.add(function(e: number): void {
            const d: number = 45 * e; // distance to travel
            this.y += d;
            const dbp: number = mp.y - p; // distanceBetweenPoints
            const fur: number = dbp / d; // framesUntilReach
            const cfur: number = (mp.y - text.y) / d; // currFramesUntilReach
            const msur: number = Math.round((cfur / (e))); // millisecondsUntilReach

            if(msur > (-ts * 4) && msur < (ts * 4)) {
                let col: string = (
                    255 - Math.round((Math.abs(msur) / (ts * 4)) * 255)
                ).toString(16);
                if(col.length === 1) col = "0" + col;
                text.color = "#FFFFFF" + col;
            }

            if(keyPressed(k)) {
                if(msur > -ts && msur < ts) {
                    return del();
                }
            } else if(this.y >= ((mp.y * 2) + 18)) {
                del();
            }

            function del(): void {
                text.onUpdate.remove(id);
                engine.removeObj(text);
                text = null;
                if(--i === -1) {
                    engine.removeObj(target);
                    target = null;
                    if(!vStop) slowmo(false, [player, enemy]);
                }
            }
        });
        engine.scene.push(text);
    }
}

function slowmo(enabled: boolean, objs: Sprite[]): void {
    objs.forEach((a: Sprite) => {
        a.playAnimation(enabled ? "idle_slow" : "idle");
    });
    if(enabled) css = sss;
    else css = dss;
}

function stop(): void {
    css = 0;
    player.playAnimation("idle");
    setTimeout(() => player.playAnimation("die"), 350);
    enemy.playAnimation("atk");
    setTimeout(() => {
        enemy.playAnimation("idle");
        enemy.active=player.dead=true;
    }, 350);
    vStop = true;
}

function fade(out: boolean, target?: Sprite, speed?: number): Promise<Sprite> {
    return new Promise<Sprite>((resolve: Function): void => {
        const sprite: Sprite = target || new Sprite({
            anchor: {x: 0, y: 0},
            width: 480,
            height: 272,
            color: "#FFFFFF00"
        });
        if(!target) {
            sprite.alpha = 0;
            engine.scene.push(sprite);
        }
        let str: string;
        str = sprite.onUpdate.add(function(dt: number): void {
            if(out) {
                if(sprite.alpha < 1) (sprite.alpha += (speed || 0.2) * dt);
                else fin();
            } else {
                if(sprite.alpha > 0) (sprite.alpha -= (speed || 0.2) * dt);
                else fin();
            }
            function fin(): void {
                sprite.onUpdate.remove(str);
                resolve(sprite);
            }
        });
    });
}
