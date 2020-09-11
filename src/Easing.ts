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

    public static easeOutQuad(
        elapsed: number, initialValue: number, amountOfChange: number, duration: number
    ): number {
        return -amountOfChange * (elapsed /= duration) * (elapsed - 2) + initialValue;
    }
}
