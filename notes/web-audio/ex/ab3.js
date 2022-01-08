/*
    let's make some noise... literally, like from scratch
*/
const ctx = new (window.AudioContext || window.webkitAudioContext)()
const fft = new AnalyserNode( ctx )

const noisyBuffer = ctx.createBuffer(2, ctx.sampleRate*1, ctx.sampleRate)
for (let ch=0; ch<noisyBuffer.numberOfChannels; ch++) {
  let samples = noisyBuffer.getChannelData(ch)
  for (let s=0; s<noisyBuffer.length; s++) samples[s] = Math.random()*2-1
}
/*
    the last example only plays for 1 second, b/c that's the buffer length, but
    you can also set it to loop and then schedule when to start/stop to have
    more control over the playback. the start/stop arguments are relative to the
    AudioContext's internal clock, u can always get the curren time by using
    ctx.currentTime
*/
let noise = new AudioBufferSourceNode(ctx,{
    buffer:noisyBuffer,
    loop:true
})

noise.connect(fft)
fft.connect(ctx.destination)

// this will play for 3 seconds
noise.start(ctx.currentTime)
noise.stop(ctx.currentTime + 3)

createWaveCanvas({element:'section', analyser:fft })
