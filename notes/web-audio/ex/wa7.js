/*
    AudioNode's, be they source-nodes or processing-nodes, have parameters (ex:
    an OscillatorNode's frequency or a gain's GainNode's gain), these are all
    instances of [AudioParam](https://developer.mozilla.org/en-US/docs/Web/API/AudioParam), you can schedule a change to these values using the
    .setValueAtTime() method. These changes can also happen over time using the
    .linearRampToValueAtTime() and.exponentialRampToValueAtTime()
*/
const ctx = new (window.AudioContext || window.webkitAudioContext)()
// using defaults for all params
const A4 = new OscillatorNode(ctx)
const lvl = new GainNode(ctx)
const fft = new AnalyserNode(ctx)

A4.connect(lvl)
lvl.connect(ctx.destination)
lvl.connect(fft)

// fade up the gain linearly from 0.1 to 1.0 over the next 5 seconds
lvl.gain.setValueAtTime(0.1, ctx.currentTime)
lvl.gain.linearRampToValueAtTime(1.0, ctx.currentTime + 5)

// schedule specific changes to the frequency at specific times
A4.frequency.setValueAtTime(523.25, ctx.currentTime + 1) // C
A4.frequency.setValueAtTime(659.26, ctx.currentTime + 2) // E
A4.frequency.setValueAtTime(523.25, ctx.currentTime + 3) // C
A4.frequency.setValueAtTime(440.00, ctx.currentTime + 4) // A

A4.start(ctx.currentTime)
A4.stop(ctx.currentTime + 5)

createWaveCanvas({ element: 'section', analyser: fft })
