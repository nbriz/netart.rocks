/*
    let's make some other types of noises + visualize them
*/
const ctx = new (window.AudioContext || window.webkitAudioContext)()
const fft = new AnalyserNode(ctx, { fftSize: 2048 })

/*
    white noise
*/
const whiteBuffer = ctx.createBuffer(2, ctx.sampleRate*1, ctx.sampleRate)
for (let ch=0; ch<whiteBuffer.numberOfChannels; ch++) {
    let samples = whiteBuffer.getChannelData(ch)
    for (let s=0; s<whiteBuffer.length; s++) samples[s] = Math.random()*2-1
}

let white = new AudioBufferSourceNode(ctx, {buffer:whiteBuffer})
white.connect(ctx.destination)
white.connect(fft)
white.start(ctx.currentTime)

/*
    pink noise
*/
const pinkBuffer = ctx.createBuffer(2, ctx.sampleRate*1, ctx.sampleRate)
for (let ch=0; ch<pinkBuffer.numberOfChannels; ch++) {
    let b0 = b1 = b2 = b3 = b4 = b5 = b6 = 0.0
    let samples = pinkBuffer.getChannelData(ch)
    for (let s = 0; s<pinkBuffer.length; s++) {
        white = Math.random() * 2 - 1
        b0 = 0.99886 * b0 + white * 0.0555179
        b1 = 0.99332 * b1 + white * 0.0750759
        b2 = 0.96900 * b2 + white * 0.1538520
        b3 = 0.86650 * b3 + white * 0.3104856
        b4 = 0.55000 * b4 + white * 0.5329522
        b5 = -0.7616 * b5 - white * 0.0168980
        samples[s] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362
        samples[s] *= 0.11 // (roughly) compensate for gain
        b6 = white * 0.115926
    }
}

let pink = new AudioBufferSourceNode(ctx, {buffer:pinkBuffer})
pink.connect(ctx.destination)
pink.connect(fft)
pink.start(ctx.currentTime + 2)

/*
    brown noise
*/
const brownBuffer = ctx.createBuffer(2, ctx.sampleRate*1, ctx.sampleRate)
for (let ch=0; ch<brownBuffer.numberOfChannels; ch++) {
    let samples = brownBuffer.getChannelData(ch)
    let lastOut = 0.0
    for (s = 0; s<brownBuffer.length; s++) {
        white = Math.random() * 2 - 1
        samples[s] = (lastOut + (0.02 * white)) / 1.02
        lastOut = samples[s]
        samples[s] *= 3.5 // (roughly) compensate for gain
    }
}

let brown = new AudioBufferSourceNode(ctx, {buffer:brownBuffer})
brown.connect(ctx.destination)
brown.connect(fft)
brown.start(ctx.currentTime + 4)

createWaveCanvas({element:'section', analyser:fft })
