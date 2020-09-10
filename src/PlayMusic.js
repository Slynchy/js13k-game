// tslint:disable
export function playMusic() {
    eval(`var thatArr = [24,,21,,24,,21,,24,,16,17,18,19,24,,21,,24,,21,,24,,16,17,18,19,16,17,18,19,20,21,22,23,24,,21,,24,,21,,24,,21,20,19,18,17,16,,19,,16,,19,,16,,19,,11,12,13,14,19,,16,,19,,16,,19,,11,12,13,14,12,13,14,15,13,14,15,16,,19,,16,,19,,16,,19,20,21,22];
    thatArr.push(...thatArr);
    thatArr.push(...thatArr);
    with(new AudioContext)
        with(G=createGain())
            for(i in D=thatArr)
                with(createOscillator())
                    if(D[i])
                        connect(G),
                            G.connect(destination),
                            start(i*.2),
                            frequency.setValueAtTime(440*1.06**(13-D[i]),i*.2),type="sawtooth",
                            gain.setValueAtTime(1,i*.2),
                            gain.setTargetAtTime(.0001,i*.2+.18,.005),
                            stop(i*.2+.19);`);
}
// tslint:enable
