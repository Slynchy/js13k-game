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
let sss: number = 0.6; // slowmo speedscale
const dss: number = 1.5; // default speedscale
let css: number = dss; // current speedscale

let sTime: number = 0;
let cTime: number = 0;

let enemy: Sprite;
let player: Sprite;
let vStop: boolean = false;

const timeline: {t: number, e: string}[] = [
    {
        t: 2000, // 2 seconds in
        e: "atk"
    }
];

const urls = [
    "assets/parallax-demon-woods-far-trees.png",
    "assets/parallax-demon-woods-mid-trees.png",
    "assets/parallax-demon-woods-close-trees.png",
    "assets/goodguy/Run.png",
    "assets/badguy/Run.png"
];
engine.loader.add(urls);
engine.loader.load().then((obj) => {
    sTime = Date.now();

    for(let i=0;i<3;i++){
        let s = new Sprite({
            image: obj[urls[i]]
        });
        engine.scene.push(s);
        let s_1 = new Sprite({
            x: s.width,
            anchor: {x: 0, y: 0},
            image: obj[urls[i]]
        });
        s.onUpdate.add(function(e: number) { t(this, s_1, (1 - (1 / (i+1))) * 66, e)});
        engine.scene.push(s_1);
    }
    function t(x,y,s,e) {
        x.x -= s * e * css;
        y.x -= s * e * css;
        if(x.x <= -(x.width)) {
            x.x = 0;
            y.x = x.width;
        }
    }

    let spriteSheet: SpriteSheet = SpriteSheet({
        image: obj[urls[3]],
        frameWidth: 200,
        frameHeight: 200,

        // this will also call createAnimations()
        animations: {
            // create 1 animation: idle
            idle: {
                frames: '0..7',  // frames 0 through 9
                frameRate: 12
            },
            idle_slow: {
                frames: '0..7',
                frameRate: 3
            },
            die: {
                frames: '8..14',
                frameRate: 10,
                loop: false
            }
        }
    });
    player = new Sprite({
        anchor: {x: 0.5, y: 0.5},
        x: 160,
        y: 244,
        animations: spriteSheet.animations
    });
    player.dead = false;
    player.onUpdate.add(function() {
        cTime = Date.now() - sTime;

        const e: {t: number, e: string} = timeline[0];
        if(e && cTime > e.t) {
            timeline.shift();
            switch(e.e) {
                case "atk":
                    enemy.active = true;
                    setTimeout(() => {
                        slowmo(true, [player, enemy]);
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
    })
    engine.scene.push(player);

    let spriteSheetBadguy: SpriteSheet = SpriteSheet({
        image: obj[urls[4]],
        frameWidth: 200,
        frameHeight: 200,
        animations: {
            idle: {
                frames: '0..7',
                frameRate: 12
            },
            idle_slow: {
                frames: '0..7',
                frameRate: 3
            },
            atk: {
                frames: '8..12',
                frameRate: 10,
                loop: false
            }
        }
    });

    let sv=480+50;
    enemy = new Sprite({
        x: sv,
        y: 250,
        active: false,
        anchor: {x: 0.5, y: 0.5},
        animations: spriteSheetBadguy.animations
    });
    enemy.scaleX = -1;
    engine.scene.push(enemy);
    enemy.onUpdate.add(function(e: number) {
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

function createButtons(): void {
    const keys: {[key: string]: string} = {
        "up":"↑",
        "down":"↓",
        "right":"→",
        "left": "←"
    };

    let target = new Text({
        text: "O",
        font: '12px Arial',
        color: "#FFFFFFAA",
        x: mp.x + 2,
        y: mp.y,
        anchor: {x: 0.5, y: 0.5},
        textAlign: 'center'
    });
    target.setScale(2.5,2.5);
    engine.scene.push(target);

    let i = -1;
    let order = [];
    let objKeys = Object.keys(keys);
    for(let i = 0; i < Math.ceil(Math.random() * 20); i++) {
        order.push(objKeys[Math.floor(Math.random() * objKeys.length)]);
    }

    for(let k of order) {
        i++;
        const p = (-60 - (order.length - (i+1))) + (24 * i);
        let text = new Text({
            text: keys[k],
            font: '12px MS Gothic',
            color: "#FFFFFF00",
            x: 240,
            y: p,
            anchor: {x: 0.5, y: 0.5},
            textAlign: 'center'
        });
        let id: string;
        id = text.onUpdate.add(function(e: number) {
            let d: number = 45 * e; // distance to travel
            this.y += d;
            const dbp = mp.y - p; // distanceBetweenPoints
            const fur = dbp / d; // framesUntilReach
            const cfur = (mp.y - text.y) / d; // currFramesUntilReach
            const msur = Math.round((cfur / (e))); // millisecondsUntilReach

            if(msur > (-ts * 4) && msur < (ts * 4)) {
                let col = (
                    255 - Math.round((Math.abs(msur) / (ts * 4)) * 255)
                ).toString(16);
                if(col.length == 1) col = "0" + col;
                text.color = "#FFFFFF" + col;
            }

            if(keyPressed(k)) {
                if(msur > -ts && msur < ts) {
                    return del();
                }
            } else if(this.y >= ((mp.y * 2) + 18)) {
                del();
            }

            function del() {
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
    objs.forEach((a) => {
        a.playAnimation(enabled ? "idle_slow" : "idle");
    });
    if(enabled) css = sss
    else css = dss;
}

function stop(): void {
    css = 0;
    player.playAnimation("idle");
    setTimeout(() => player.playAnimation("die"), 500);
    enemy.playAnimation("atk");
    setTimeout(() => {
        enemy.playAnimation("idle");
        enemy.active=player.dead=true;
    }, 600);
    vStop = true;
}





