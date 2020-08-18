export default class Loader {
    private queue: string[] = [];

    constructor() {}

    public add(url: string | string[]): void {
        Array.isArray(url) ? this.queue.push(...url) : this.queue.push(url);
    }

    public load(): Promise<{ [key: string]: HTMLImageElement }> {
        const retVal: { [key: string]: HTMLImageElement } = {};
        return new Promise<{ [key: string]: HTMLImageElement }>(async (res, rej) => {
            const promises: Promise<void>[] = [];
            this.queue.forEach((e: string) => {
                retVal[e] = new Image();
                retVal[e].src = e;
                promises.push(createImagePromise(retVal[e]));
            });
            await Promise.all(promises);
            res(retVal);
        });

        function createImagePromise(img: HTMLImageElement): Promise<void> {
            return new Promise((resolve) => (img.onload = () => resolve()));
        }
    }
}
