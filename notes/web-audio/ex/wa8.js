/*
  now let's get a little craftier with our AudioParam scheduling to create a
  classic [ADSR](https://www.wikiaudio.org/adsr-envelope/) (Attack, Decay, Sustain, Release) envelope

  here's an ASCII rendering of an ADSR envelope
  |   /|\___|____|    |
  |  / |    |    |\   |
  | /  |    |    | \  |
  | a  |d   |s   |r \ |
*/
const ctx = new (window.AudioContext || window.webkitAudioContext)()
// using defaults for all params
const A4 = new OscillatorNode(ctx)
const lvl = new GainNode(ctx)
const fft = new AnalyserNode(ctx)

A4.connect(lvl)
lvl.connect(ctx.destination)
lvl.connect(fft)

// tone will play for 2.1 seconds with the followin ADSR envelope
let t = ctx.currentTime // start time
let a = 0.5 // attack duration
let d = 0.1 // decay duration
let s = 1.0 // sustain duration
let r = 0.5 // release duration

// start silent
lvl.gain.setValueAtTime(0.001, t)
// attack (ramp up to peak volume)
lvl.gain.linearRampToValueAtTime(0.755, t+a)
// decay (fall down to sustained value)
lvl.gain.linearRampToValueAtTime(0.555, t+a+d)
// sustain (hold sound for a bit)
lvl.gain.linearRampToValueAtTime(0.555, t+a+d+s)
// release (fade out to silence)
lvl.gain.linearRampToValueAtTime(0.001, t+a+d+s+r)

A4.start(ctx.currentTime)
A4.stop(ctx.currentTime + 5)

createWaveCanvas({ element: 'section', analyser: fft })
