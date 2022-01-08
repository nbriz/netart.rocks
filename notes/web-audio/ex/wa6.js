/*
  let's modify the canvas code a little bit so that it animates over time
*/
const ctx = new (window.AudioContext || window.webkitAudioContext)()

const A4 = new OscillatorNode(ctx) // using default sine wave now
const gain = new GainNode(ctx, { gain: 0.5 })
const fft = new AnalyserNode(ctx, { fftSize: 2048 })

A4.connect(gain)
gain.connect(ctx.destination)
gain.connect(fft)

A4.start(ctx.currentTime)
A4.stop(ctx.currentTime + 3)

// create canvas...
const canvas = document.createElement('canvas')
canvas.width = document.querySelector('section').offsetWidth
document.querySelector('section').appendChild(canvas)
const canvasCtx = canvas.getContext('2d')
canvasCtx.fillStyle = '#23241f'
canvasCtx.strokeStyle = '#f92672'

let bufferLength = fft.frequencyBinCount
let dataArray = new Uint8Array(bufferLength)

function animate(){
  setTimeout(animate, 1000 / 12) // 12fps
  canvasCtx.fillRect(0, 0, canvas.width, canvas.height)
  // get data...
  fft.getByteTimeDomainData(dataArray)
  // draw data...
  canvasCtx.beginPath()
  let column = canvas.width / bufferLength
  let x = 0
  for (let i = 0; i < bufferLength; i++) {
    let y = (dataArray[i] / 128) * (canvas.height / 2)
    if (i === 0) canvasCtx.moveTo(x, y)
    else canvasCtx.lineTo(x, y)
    x += column
  }
  canvasCtx.lineTo(canvas.width, canvas.height / 2)
  canvasCtx.stroke()
}

animate()
