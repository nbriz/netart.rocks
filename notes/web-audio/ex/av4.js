/*
    a couple examples ago i change the frequncy of an oscillator by creating
    an animation loop and adjusting the osc.frequncy.value value directly,
    rather than using AudioParam methods like linearRampToValueAtTime(),
    this is because osc.frequncy.value won't reflect the current frequncy
    during a linearRamp (or other) transition. that said, we can use fft to
    analyze the current pitch...
*/

const ctx = new (window.AudioContext || window.webkitAudioContext)()
const osc = new OscillatorNode( ctx )
const fft = new AnalyserNode( ctx )
const gn = new GainNode(ctx, {gain:0.75})

osc.connect(gn)
gn.connect(fft)
fft.connect(ctx.destination)

osc.start()
osc.frequency.setValueAtTime(440, ctx.currentTime)
osc.frequency.linearRampToValueAtTime(880, ctx.currentTime + 6)
osc.stop(ctx.currentTime + 7)


// create canvas...
const canvas = document.createElement('canvas')
canvas.width = document.querySelector('section').offsetWidth
document.querySelector('section').appendChild(canvas)
const canvasCtx = canvas.getContext("2d")

// array of note strings
let noteStrings = [
    "C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"
]

function animate() {
    setTimeout(animate,1000/12) // 12fps
    canvasCtx.fillStyle = "#23241f"
    canvasCtx.fillRect(0,0,canvas.width,canvas.height)

    // pass fft and sample-rate to getPitch in Hz
    pitch = getPitch(fft, ctx.sampleRate)
    // convert pitch to note int 0-11
    note =  noteFromPitch( pitch )
    // calculate how detuned it is in cents
    detune = centsOffFromPitch( pitch, note )

    canvasCtx.fillStyle = "#f92672"
    if(pitch == -1) note = "--"
    canvasCtx.font = '32px Arial'
    canvasCtx.textBaseline = 'top'
    canvasCtx.textAlign = 'center'
    if(pitch > -1)
    canvasCtx.fillText( noteStrings[note%12], canvas.width/2, 30)

    canvasCtx.fillStyle = "#f92672"
    canvasCtx.fillRect(canvas.width/2, 80, detune*2, 10)
    canvasCtx.fillStyle = "#fff"
    canvasCtx.fillRect(canvas.width/2, 79, 2, 12)
    canvasCtx.font = "24px Arial"
    canvasCtx.fillText('♭',canvas.width/2-110,70)
    canvasCtx.fillText('♯',canvas.width/2+110,70)
    canvasCtx.textAlign = 'center'
    canvasCtx.fillStyle = "#f92672"
    canvasCtx.fillText( Math.round(pitch)+"Hz", canvas.width/2, 110)
}
animate()
