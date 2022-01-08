/*
   let's make a sawtooth wave from scratch + visualize it
*/
const ctx = new (window.AudioContext || window.webkitAudioContext)()
const fft = new AnalyserNode(ctx, { fftSize: 2048 })

const sineBuffer = ctx.createBuffer(2, ctx.sampleRate*1, ctx.sampleRate)

for (let ch = 0; ch < sineBuffer.numberOfChannels; ch++) {
    let samples = sineBuffer.getChannelData(ch)

    for (let s = 0; s < sineBuffer.length; s++){
        let scalar = (440 * 2 * Math.PI) / sineBuffer.sampleRate
        let sin = Math.sin(s*scalar)
        // divide the sample rate by the frequency to get the amount of samples
        // that are in a single period of the sine wave...
        let period = sineBuffer.sampleRate / 440
        // ...use modulus for some clock logic, converting the index values of
        // each sample to their place in the period...
        let idx = s%period
        // ...then map that idx value to it's value in the -1 to 1 range
        samples[s] = (idx*2/period) -1
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
