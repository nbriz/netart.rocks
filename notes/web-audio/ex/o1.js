/*
    You can create custom waveforms with the [PeriodicWave](https://developer.mozilla.org/en-US/docs/Web/API/PeriodicWave),
    for a better understanding on how this works check out Jack Schaelder's page
    on [dft](https://jackschaedler.github.io/circles-sines-signals/dft_introduction.html), consider the slider values in the "Frequency Domain" section to be
    the Float32Array, also check out his section on [complex numbers](https://jackschaedler.github.io/circles-sines-signals/complex.html)
*/
const ctx = new (window.AudioContext || window.webkitAudioContext)()
const osc = new OscillatorNode( ctx )
const lvl = new GainNode( ctx, {gain:0.7}) // silent by default
const fft = new AnalyserNode( ctx )

// first you create two arrays of "real" and "imaginary" values
// together these represent [complex numbers](https://jackschaedler.github.io/circles-sines-signals/complex.html)
let real = new Float32Array([ 0, 1, 0, 0.5 ])
let imag = new Float32Array([ 0, 0, 0, 0   ])
// then pass those to the .createPeriodicWave() method
let wave = ctx.createPeriodicWave(real, imag)
// then apply that new wave to our OscillatorNode using .setPeriodicWave
osc.setPeriodicWave(wave)

osc.connect(lvl)
lvl.connect(ctx.destination)
lvl.connect(fft)
osc.start(ctx.currentTime) // start now
osc.stop(ctx.currentTime + 2) // stop 2 seconds later

createWaveCanvas({element:'section', analyser:fft })
