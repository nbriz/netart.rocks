/*
    let's make some noise... literally, like from scratch
*/
const ctx = new (window.AudioContext || window.webkitAudioContext)()
const fft = new AnalyserNode( ctx )

// make a noisy stereo channel 1 seond buffer at the default sample rate
const noisyBuffer = ctx.createBuffer(2, ctx.sampleRate*1, ctx.sampleRate)
// ...same code as last example, just a little tighter to save space
for (let ch=0; ch<noisyBuffer.numberOfChannels; ch++) {
  let samples = noisyBuffer.getChannelData(ch)
  for (let s=0; s<noisyBuffer.length; s++) samples[s] = Math.random()*2-1
}

/*
    like any [AudioNodes](https://developer.mozilla.org/en-US/docs/Web/API/AudioNode), there's the factory method:

        let noise = ctx.createBufferSource();
            noise.buffer = noisyBuffer;

    and then there's the constructor method, which i prefer:
*/
let noise = new AudioBufferSourceNode(ctx,{
    buffer:noisyBuffer
})

noise.connect(fft)
fft.connect(ctx.destination)
noise.start()
// notice we don't schedule a stop,
// it automatically stops when we reach the end of the buffer

createWaveCanvas({element:'section', analyser:fft })
