export default class Easing {
    public static easeOutBounce(
        elapsed: number, initialValue: number, amountOfChange: number, duration: number
    ): number {
        // tslint:disable-next-line:no-conditional-assignment
        if ((elapsed /= duration) < 1 / 2.75) {
            return amountOfChange * (7.5625 * elapsed * elapsed) + initialValue;
        } else if (elapsed < 2 / 2.75) {
            return amountOfChange * (7.5625 * (elapsed -= 1.5 / 2.75) * elapsed + 0.75) + initialValue;
        } else if (elapsed < 2.5 / 2.75) {
            return amountOfChange * (7.5625 * (elapsed -= 2.25 / 2.75) * elapsed + 0.9375) + initialValue;
        } else {
            return amountOfChange * (7.5625 * (elapsed -= 2.625 / 2.75) * elapsed + 0.984375) + initialValue;
        }
    }

    public static easeInBounce(
        elapsed: number, initialValue: number, amountOfChange: number, duration: number
    ): number {
        return amountOfChange - Easing.easeOutBounce(duration - elapsed, 0, amountOfChange, duration) + initialValue;
    }

    // tslint:disable-next-line
    public static easeOutElastic(elapsed: number, initialValue: any, amountOfChange: number, duration: number): number {
        let s: number = 1.70158;
        let p: number = 0;
        let a: number = amountOfChange;
        if (elapsed === 0) {
            return initialValue;
        }
        // tslint:disable-next-line:no-conditional-assignment
        if ((elapsed /= duration) === 1) {
            return initialValue + amountOfChange;
        }
        if (!p) {
            p = duration * 0.3;
        }
        if (a < Math.abs(amountOfChange)) {
            a = amountOfChange;
            s = p / 4;
        } else {
            s = p / (2 * Math.PI) * Math.asin(amountOfChange / a);
        }
        return a * Math.pow(2, -10 * elapsed) * Math.sin((elapsed * duration - s)
            * (2 * Math.PI) / p) + amountOfChange + initialValue;
    }

    public static easeInElastic(
        elapsed: number, initialValue: number, amountOfChange: number, duration: number
    ): number {
        let s: number = 1.70158;
        let p: number = 0;
        let a: number = amountOfChange;
        if (elapsed === 0) {
            return initialValue;
        }
        // tslint:disable-next-line:no-conditional-assignment
        if ((elapsed /= duration) === 1) {
            return initialValue + amountOfChange;
        }
        if (!p) {
            p = duration * 0.3;
        }
        if (a < Math.abs(amountOfChange)) {
            a = amountOfChange;
            s = p / 4;
        } else {
            s = p / (2 * Math.PI) * Math.asin(amountOfChange / a);
        }
        return -(a * Math.pow(2, 10 * (elapsed -= 1)) * Math.sin((elapsed * duration - s)
            * (2 * Math.PI) / p)) + initialValue;
    }

    public static easeOutQuad(
        elapsed: number, initialValue: number, amountOfChange: number, duration: number
    ): number {
        return -amountOfChange * (elapsed /= duration) * (elapsed - 2) + initialValue;
    }
}
