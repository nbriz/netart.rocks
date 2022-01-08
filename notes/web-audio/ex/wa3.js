/*
  some AudioNodes are like the [GainNode](https://developer.mozilla.org/en-US/docs/Web/API/GainNode) are "audio-processing" nodes rather than a
  "source-node", which means it goes inbetween a source-node and a destination.
  Other processing-nodes include the [DelayNode](https://developer.mozilla.org/en-US/docs/Web/API/DelayNode), the [ConvolverNode](https://developer.mozilla.org/en-US/docs/Web/API/ConvolverNode) (ie. reverb),
  [BiquadFilterNode](https://developer.mozilla.org/en-US/docs/Web/API/BiquadFilterNode), [DynamicsCompressorNode](https://developer.mozilla.org/en-US/docs/Web/API/DynamicsCompressorNode) and [WaveShaperNode](https://developer.mozilla.org/en-US/docs/Web/API/WaveShaperNode) (ie. distortion)
*/
const ctx = new (window.AudioContext || window.webkitAudioContext)()

const A4 = new OscillatorNode(ctx, {
  frequency: 440,
  type: 'square'
})

const gain = new GainNode(ctx,{
  gain: 0.5 // scale volume down by half
})

// we'll connect the OscillatorNode to the GainNode...
A4.connect(gain)
// ...and then the GainNode to our speakers
gain.connect(ctx.destination)

A4.start(ctx.currentTime)
A4.stop(ctx.currentTime + 0.5)


/*
  this would be the "factory method" version:

  const lvl = ctx.createGain()
  lvl.gain.value = 0.5
*/
