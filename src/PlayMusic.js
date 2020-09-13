// tslint:disable
export function playMusic() {
    // if(true) {
    //     function test() {
    //         var thatArr = [24,,21,,24,,21,,24,,16,17,18,19,24,,21,,24,,21,,24,,16,17,18,19,16,17,18,19,20,21,22,23,24,,21,,24,,21,,24,,21,20,19,18,17,16,,19,,16,,19,,16,,19,,11,12,13,14,19,,16,,19,,16,,19,,11,12,13,14,12,13,14,15,13,14,15,16,,19,,16,,19,,16,,19,20,21,22];
    //         with(new AudioContext())
    //             with(G=createGain())
    //                 for(i in thatArr)
    //                     with(createOscillator())
    //                         if(thatArr[i])
    //                             connect(G),
    //                                 G.connect(destination),
    //                                 start(i*.2),
    //                                 frequency.setValueAtTime(440*1.06**(13-thatArr[i]),i*.2),type="sawtooth",
    //                                 gain.setValueAtTime(0.025,i*.2),
    //                                 gain.setTargetAtTime(.0001,i*.2+.18,.005),
    //                                 stop(i*.2+.19);
    //     };
    //     test();
    // }
}

export var beep = (function () {
    var ctxClass = window.audioContext ||window.AudioContext || window.AudioContext || window.webkitAudioContext
    var ctx = new ctxClass();
    return function (duration, type, finishedCallback) {

        duration = +duration;

        // Only 0-4 are valid types.
        type = (type % 5) || 0;

        if (typeof finishedCallback != "function") {
            finishedCallback = function () {};
        }

        var osc = ctx.createOscillator();

        osc.type = type;
        //osc.type = "sine";

        var gainNode = ctx.createGain()
        gainNode.gain.value = 0.25 // 10 %
        gainNode.connect(ctx.destination);

        osc.connect(gainNode);
        if (osc.noteOn) osc.noteOn(0); // old browsers
        if (osc.start) osc.start(); // new browsers

        setTimeout(function () {
            if (osc.noteOff) osc.noteOff(0); // old browsers
            if (osc.stop) osc.stop(); // new browsers
            finishedCallback();
        }, duration);

    };
})();

// tslint:enable
