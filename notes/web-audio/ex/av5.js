/*
   here's another example of pitch analysis using an audio buffer
*/

const ctx = new (window.AudioContext || window.webkitAudioContext)()
const src = new AudioBufferSourceNode( ctx )
const fft = new AnalyserNode( ctx )
const gn = new GainNode(ctx, {gain:0.75})

src.connect(gn)
gn.connect(fft)
fft.connect(ctx.destination)

fetch('ex/media/katy.ogg')
.then(res => res.arrayBuffer() )
.then(data => {
    ctx.decodeAudioData(data, (buffer)=>{
        src.buffer = buffer
        src.start()
    })
}).catch(err => { console.error(err) })

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
