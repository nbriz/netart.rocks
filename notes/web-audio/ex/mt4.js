/*
    [equal temperment](https://en.wikipedia.org/wiki/Equal_temperament) exists in contrast to just intonation, it's what's been
    used most commonly in Western music since the 18th century. specifically,
    12-tone equal temperment, ie. where u divide an octive into 12 equal parts.

    while just intonation has more "pure" sounding notes (and harmonies), it
    involves tuning your analog instrument to a single key, which isn't the
    most practical thing to do, for that [reason equal temperment exists](http://pages.mtu.edu/~suits/scales.html) (ie. you
    can perform a song that switches keys mid track without re-tuning your
    instrument). Of course, computers don't have to be "tuned" and thus don't
    have this limitation (ie. best to use just intonation), but if u're
    performing with analog musicians, it might make the most sense to conform to
    them (ie. use equal temperment A 440Hz)

    below is a variation of the step funciton in the prior example, this one
    will devide the octave into the common 12 keys you find on a piano, ie. the
    [chromatic scale](https://en.wikipedia.org/wiki/Chromatic_scale): C, C#, D, D#, E, F, F#, G, G#, A, A#, B
*/
const root = 440 // A4, the most common reference

const ctx = new (window.AudioContext || window.webkitAudioContext)()
const osc = new OscillatorNode( ctx, {frequency:root})
const lvl = new GainNode( ctx, {gain:0.75})
const fft = new AnalyserNode( ctx )
osc.connect(lvl)
lvl.connect(fft)
fft.connect(ctx.destination)


function step( rootFreq, steps ){
    // formula: http://pages.mtu.edu/~suits/NoteFreqCalcs.html
    var tr2 = Math.pow(2, 1/12) // the twelth root of 2
    // we could replace the 12 with how ever many tones we want
    // ie. this could easily get really microtonal :) 
    rnd = root * Math.pow(tr2,steps)
    return Math.round(rnd*100)/100
}

let s = 0
function playDiatonicScale(){
    setTimeout(playDiatonicScale, 1000)
    osc.frequency.value = step(root,s)
    s++
}



createWaveCanvas({element:'section', analyser:fft })
// gui ----------------------
const gui = new dat.GUI()
let btn = gui.add( osc, 'start').onChange(() => {
    playDiatonicScale()
    btn.remove()
    btn = gui.add( osc, 'stop').onChange(() => {
        btn.remove()
    })
})
