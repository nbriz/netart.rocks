 /*
    let's make a sine wave from scratch + visualize it
*/
const ctx = new (window.AudioContext || window.webkitAudioContext)()
const fft = new AnalyserNode(ctx, { fftSize: 2048 })

const sineBuffer = ctx.createBuffer(2, ctx.sampleRate*1, ctx.sampleRate)
/*
    the formula for creating a sine wave is sin(freq*2*PI*t), where freq is the
    particular frequency in Hz and t is the point in time, essentially the index
    of a sample, a deeper explination can be found in [this pdf](http://www-math.bgsu.edu/%7Ezirbel/sound/Trigonometric%20functions%20and%20sound.pdf)
*/
for (let ch = 0; ch < sineBuffer.numberOfChannels; ch++) {
    let samples = sineBuffer.getChannelData(ch)

    for (let s = 0; s < sineBuffer.length; s++){
        // 440 is the frequency in Hz of a standard A4 note,
        // for more info on the how/why check out this post
        // on [Signals and Sine Waves](http://teropa.info/blog/2016/08/04/sine-waves.html) in the WebAudio API
        let scalar = (440 * 2 * Math.PI) / sineBuffer.sampleRate
        samples[s] = Math.sin(s*scalar)
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
