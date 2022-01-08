/*
  now lets apply the adsr envelope to the frequency change as well.
*/
const ctx = new (window.AudioContext || window.webkitAudioContext)()

function adsr (param, peak, val, time, a, d, s, r) {
  /*
                peak
                /\   val  val
               /| \__|____|
              / |    |    |\
             /  |    |    | \
       init /a  |d   |s   |r \ init

       <----------time------------>
  */
  const initVal = param.value
  param.setValueAtTime(initVal, time)
  param.linearRampToValueAtTime(peak, time+a)
  param.linearRampToValueAtTime(val, time+a+d)
  param.linearRampToValueAtTime(val, time+a+d+s)
  param.linearRampToValueAtTime(initVal, time+a+d+s+r)
}

const tone = new OscillatorNode(ctx, { frequency: 523.2511 }) // C
const lvl = new GainNode(ctx, { gain: 0.5 })
const fft = new AnalyserNode(ctx)

tone.connect(lvl)
lvl.connect(ctx.destination)
lvl.connect(fft)


const D = 587.3295
const E = 659.2551

const a = 1
const d = 1
const s = 3
const r = 1

adsr(tone.frequency, D, E, ctx.currentTime, a, d, s, r)


tone.start(ctx.currentTime)
tone.stop(ctx.currentTime + 6)


createWaveCanvas({ element: 'section', analyser: fft })
