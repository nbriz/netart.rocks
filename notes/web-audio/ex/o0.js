/*
    Here's a simple demo w/all the basic Oscillator types
*/
const ctx = new (window.AudioContext || window.webkitAudioContext)()
const osc = new OscillatorNode( ctx )
const lvl = new GainNode( ctx, {gain:0.001}) // silent by default
const fft = new AnalyserNode( ctx )

osc.connect(lvl)
lvl.connect(ctx.destination)
lvl.connect(fft)
osc.start(ctx.currentTime) // start now
osc.stop(ctx.currentTime + 8) // stop 8 seconds later

let options = { // adsr options
    param:lvl.gain,
    value:0.7,
    a:0.2,d:0.1,s:0.5,r:0.2 // adsr total length = 1s
}

osc.type = "sine" // first play a sine wave
adsr(Object.assign({startTime:ctx.currentTime},options))

// then in 2 seconds change type to "square"
setTimeout(() => { osc.type = "square" },2000)
adsr(Object.assign({startTime:ctx.currentTime + 2},options))

// ...in 4 seconds to "sawtooth"
setTimeout(() => { osc.type = "sawtooth" },4000)
adsr(Object.assign({startTime:ctx.currentTime + 4},options))

// ...in 6 seconds to "triangle"
setTimeout(() => { osc.type = "triangle" },6000) // then to "triangle"
adsr(Object.assign({startTime:ctx.currentTime + 6},options))

createWaveCanvas({element:'section', analyser:fft })
