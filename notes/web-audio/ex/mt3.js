/*
    "pure intonation" or "[just intonation](https://en.wikipedia.org/wiki/Just_intonation)" is a way of tuning such that the
    musical intervals (space between notes) are derrived from ratios of small
    whole numbers. This sequence of notes or pure intervals are important in
    music because they correspond to [harmonic series](https://en.wikipedia.org/wiki/Harmonic_series_(music)), the vibrational patterns
    found in physical objects which correlate to human perception. See [this video](https://www.youtube.com/watch?v=yNQ3dkl1rhk)
    for a solid explainer.
*/
const root = 261.63 // C4 or "Middle C"

const ctx = new (window.AudioContext || window.webkitAudioContext)()
const osc = new OscillatorNode( ctx, {frequency:root})
const lvl = new GainNode( ctx, {gain:0.75})
const fft = new AnalyserNode( ctx )
osc.connect(lvl)
lvl.connect(fft)
fft.connect(ctx.destination)


function step( rootFreq, steps ){
    let ratios = [
        1,      // unison ( 1/1 )       // C
        9/8,    // major second         // D
        5/4,    // major third          // E
        4/3,    // fourth               // F
        3/2,    // fifth                // G
        5/3,    // major sixth          // A
        15/8,   // major seventh        // B
        // 2       // octave ( 2/1 )       // C
    ]

    if(steps >= ratios.length){
        let octaveShift = Math.floor( steps / ratios.length )
        rootFreq = rootFreq * Math.pow(2,octaveShift)
    }

    let r = steps % ratios.length
    let freq = rootFreq * ratios[r]
    return freq
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
