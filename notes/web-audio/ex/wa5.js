/*
  the FireFox DevTools have a rad WebAudio [Editor/Inspector](https://developer.mozilla.org/en-US/docs/Tools/Web_Audio_Editor) which will show you a
  flow graph of your connected nodes, but for some reason it only works when
  creating nodes with the factory method. so here is the previous sketch re-
  written that way in order to view the graph in the DevTools
*/
const ctx = new (window.AudioContext || window.webkitAudioContext)()

const A4 = ctx.createOscillator()
A4.type = 'square'

const gain = ctx.createGain()
gain.gain.value = 0.5

const fft = ctx.createAnalyser()
fft.fftSize = 2048


A4.connect(gain)
gain.connect(ctx.destination)
gain.connect(fft)

A4.start(ctx.currentTime)
A4.stop(ctx.currentTime + 2)

// create canvas...
let bufferLength, dataArray
const canvas = document.createElement('canvas')
canvas.width = document.querySelector('section').offsetWidth
document.querySelector('section').appendChild(canvas)
const canvasCtx = canvas.getContext('2d')
canvasCtx.fillStyle = '#23241f'
canvasCtx.strokeStyle = '#f92672'
canvasCtx.fillRect(0,0,canvas.width,canvas.height)

setTimeout(() => {
  // get data...
  bufferLength = fft.frequencyBinCount
  dataArray = new Uint8Array(bufferLength)
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
}, 250)
