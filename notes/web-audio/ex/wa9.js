/*
  now lets turn the ADSR envelope into a function to reuse it
*/
const ctx = new (window.AudioContext || window.webkitAudioContext)()

const tone = new OscillatorNode(ctx)
const lvl = new GainNode(ctx, { gain: 0.001 })
const fft = new AnalyserNode(ctx)

tone.connect(lvl)
lvl.connect(ctx.destination)
lvl.connect(fft)

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

// schedule when to play notes && how to apply the ADSR envelope to each

const p = 0.8 // peak value for all tones
const v = 0.7 // sustained value for all tones

tone.frequency.setValueAtTime(440.00, ctx.currentTime)
adsr(lvl.gain, p,v, ctx.currentTime, 0.2,0.1,0.4,0.2) // 0.9s

tone.frequency.setValueAtTime(523.25, ctx.currentTime + 1)
adsr(lvl.gain, p,v, ctx.currentTime + 1, 0.2,0.1,0.4,0.2) // 0.9s

tone.frequency.setValueAtTime(659.26, ctx.currentTime + 2)
adsr(lvl.gain, p,v, ctx.currentTime + 2, 0.2,0.1,0.4,0.2) // 0.9s

tone.frequency.setValueAtTime(523.25, ctx.currentTime + 3)
adsr(lvl.gain, p,v, ctx.currentTime + 3, 0.2,0.1,0.7,0.2) // 1.2s

tone.frequency.setValueAtTime(440.00, ctx.currentTime + 4.5)
adsr(lvl.gain, p,v, ctx.currentTime + 4.5, 0.2,0.1,2.0,0.2) // 2.5s

tone.start(ctx.currentTime)
tone.stop(ctx.currentTime + 7)


createWaveCanvas({ element: 'section', analyser: fft })
