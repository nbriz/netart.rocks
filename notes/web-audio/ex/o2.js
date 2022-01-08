/*
    i've got 51 wave-table files in the ex/wave-tables folder 
*/
const ctx = new (window.AudioContext || window.webkitAudioContext)()
const osc = new OscillatorNode( ctx )
const lvl = new GainNode( ctx, {gain:0.001}) // silent by default
const fft = new AnalyserNode( ctx )

osc.connect(lvl)
lvl.connect(ctx.destination)
lvl.connect(fft)
osc.start(ctx.currentTime) // start now
osc.stop(ctx.currentTime + 4) // stop 4 seconds later

let options = { // adsr options
    param:lvl.gain,
    value:0.7,
    a:0.2,d:0.1,s:0.5,r:0.2 // adsr total length = 1s
}

// first play a Piano wave
let piano = ctx.createPeriodicWave(
    new Float32Array(wave_Piano.real),
    new Float32Array(wave_Piano.imag))
osc.setPeriodicWave(piano)
adsr(Object.assign({startTime:ctx.currentTime},options))

// then in 1 second change it to a Trombone
setTimeout(() => {
    let trombone = ctx.createPeriodicWave(
        new Float32Array(wave_Trombone.real),
        new Float32Array(wave_Trombone.imag))
    osc.setPeriodicWave(trombone)
},1000)
adsr(Object.assign({startTime:ctx.currentTime + 1},options))

// then in 2 seconds change it to a Phoneme "ah"
setTimeout(() => {
    let ah = ctx.createPeriodicWave(
        new Float32Array(wave_Phoneme_ah.real),
        new Float32Array(wave_Phoneme_ah.imag))
    osc.setPeriodicWave(ah)
},2000)
adsr(Object.assign({startTime:ctx.currentTime + 2},options))

// then in 3 seconds change it to a Phoneme "ee"
setTimeout(() => {
    let ee = ctx.createPeriodicWave(
        new Float32Array(wave_Phoneme_ee.real),
        new Float32Array(wave_Phoneme_ee.imag))
    osc.setPeriodicWave(ee)
},3000)
adsr(Object.assign({startTime:ctx.currentTime + 3},options))


createWaveCanvas({element:'section', analyser:fft })
