/*
  there's a third type of AudioNode besides source-nodes and processing-nodes,
  it's the only one of it's type, the [AnalyserNode](https://developer.mozilla.org/en-US/docs/Web/API/AnalyserNode) is essentially your [FFT](https://en.wikipedia.org/wiki/Fast_Fourier_transform),
  for a good explainer on FFT (and signal processing in general) check out the FFT
  section in [Seeing Cirlces, Sines and Signals](https://jackschaedler.github.io/circles-sines-signals/dft_introduction.html)

  the AnalyserNode can be used to get 'time-domain' and 'frequency-domain' data
  from the audio connected to it, this can be used for all kinds of analysis
  ( pitch detection for example ) or visualization. Like frequency bar graphs,
  or ( in the case below ) wave forms
*/
const ctx = new (window.AudioContext || window.webkitAudioContext)()

const A4 = new OscillatorNode(ctx, {
  frequency: 440,
  type: 'square'
})

const gain = new GainNode(ctx, { gain: 0.5 })

const fft = new AnalyserNode(ctx, { fftSize: 2048 })
/*
  the "factory method" version looks like:
  const fft = ctx.createAnalyser()
  fft.fftSize = 2048
*/


A4.connect(gain)
gain.connect(ctx.destination)
// this time we'll additionally connect our gain to our AnalyserNode
gain.connect(fft)

A4.start(ctx.currentTime)
A4.stop(ctx.currentTime + 0.5)

// let's create a canvas to visualize our data to
// as well as a couple of global variables used for the visualization
let bufferLength, dataArray
const canvas = document.createElement('canvas')
canvas.width = document.querySelector('section').offsetWidth
document.querySelector('section').appendChild(canvas)
const canvasCtx = canvas.getContext('2d')
canvasCtx.fillStyle = '#23241f'
canvasCtx.strokeStyle = '#f92672'
canvasCtx.fillRect(0, 0, canvas.width, canvas.height)


// then we'll wait half a second before analyzing anything, which means we'll
// be analyzing the data in our fft at that point in time (.25 seconds in)
setTimeout(() => {
/*
  TimeDomainData and FrequencyData can be gotten as bytes for 32bit floats,
  (more processing, but higher precision). you get this data by creating an
  array of the appropriate type (Unit8Array or Float32Array) the length of the
  fft's .frequencyBinCount, and the using the fft's .getByte... or .getFloat...
  method for either the ...TimeDomainData() or ...FrequencyData(), passing the
  array as an argument.
*/
  bufferLength = fft.frequencyBinCount
  dataArray = new Uint8Array(bufferLength)
  fft.getByteTimeDomainData(dataArray)

  // now let's draw that getByteTimeDomainData copied into the dataArray
  canvasCtx.beginPath()

  let column = canvas.width / bufferLength
  let x = 0
  for (let i = 0; i < bufferLength; i++) {
    //       normalize data       scale to canvas
    let y = (dataArray[i] / 128) * (canvas.height / 2)

    if (i === 0) canvasCtx.moveTo(x, y)
    else canvasCtx.lineTo(x, y)

    x += column
  }

  canvasCtx.lineTo(canvas.width, canvas.height / 2)
  canvasCtx.stroke()

}, 250)
