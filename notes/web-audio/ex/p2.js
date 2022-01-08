/*
    the [ConvolverNode](https://developer.mozilla.org/en-US/docs/Web/API/ConvolverNode) is another audio-processing module used to create linear
    convolution (ie. reverb). There are lots of ways to create reverb obviously,
    but this approach uses "impulse responses" which are essentially echo samples
    recorded in different contexts (for ex: the decay of a clap in a big room).
    The buffer from the impulse is applied to the AudioSource as a convolution.
*/
const ctx = new (window.AudioContext || window.webkitAudioContext)()
const src = new AudioBufferSourceNode( ctx )
const fft = new AnalyserNode( ctx )
const gn  = new GainNode(ctx, {gain:0.75})
const rev = new ConvolverNode(ctx)
// as always, there's also the factory method...
// const dl = ctx.createConvolver()

src.connect(rev)
rev.connect(gn)
gn.connect(fft)
fft.connect(ctx.destination)

fetch('ex/impulse/reverb1.wav')
.then(res => res.arrayBuffer() )
.then(data => {
    // load impulse file as buffer to ConvolverNode
    ctx.decodeAudioData(data, (buffer)=>{
        rev.buffer = buffer
    })
}).catch(err => { console.error(err) })

fetch('ex/media/katy.ogg')
.then(res => res.arrayBuffer() )
.then(data => {
    // load music file as buffer to AudioBufferSourceNode
    ctx.decodeAudioData(data, (buffer)=>{
        src.buffer = buffer
        src.start()
    })
}).catch(err => { console.error(err) })

createWaveCanvas({element:'section', analyser:fft })
