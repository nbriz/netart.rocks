 /*
    let's make a sqaure wave from scratch + visualize it
*/
const ctx = new (window.AudioContext || window.webkitAudioContext)()
const fft = new AnalyserNode(ctx, { fftSize: 2048 })

const sineBuffer = ctx.createBuffer(2, ctx.sampleRate*1, ctx.sampleRate)

for (let ch = 0; ch < sineBuffer.numberOfChannels; ch++) {
    let samples = sineBuffer.getChannelData(ch)

    for (let s = 0; s < sineBuffer.length; s++){
        let scalar = (440 * 2 * Math.PI) / sineBuffer.sampleRate
        let sin = Math.sin(s*scalar)
        // w/a little more code we can convert this sine wave into a square wave
        if(sin>0) samples[s] = 1
        else samples[s] =  -1
    }
}

const A4 = new AudioBufferSourceNode(ctx,{
    buffer:sineBuffer,
    loop:true
})

const gn = new GainNode(ctx, {gain:0.5})

A4.connect(gn)
gn.connect(fft)
gn.connect(ctx.destination)
A4.start(ctx.currentTime)
A4.stop(ctx.currentTime + 3)

createWaveCanvas({element:'section', analyser:fft })
