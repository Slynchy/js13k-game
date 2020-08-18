export function onUpdate(): {add: Function, remove: Function} {
    if(!this._onUpdate) this._onUpdate = {};
    return {
        add: (e: Function): string => {
            const key: string = Math.random().toString().substr(2);
            this._onUpdate[key] = e;
            return key;
        },
        remove: (e: string): void => {
            if(this._onUpdate[e]) delete this._onUpdate[e];
        }
    };
}

export function update(dt: number): void {
    for(const prop in this._onUpdate) {
        if(this._onUpdate.hasOwnProperty(prop)) {
            this._onUpdate[prop].call(this, dt);
        }
    }
}
