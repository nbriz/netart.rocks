/*
    the [WaveShaperNode](https://developer.mozilla.org/en-US/docs/Web/API/WaveShaperNode) is an audio processing module used to create distortion.
    It uses a curve to apply a wave shaping distortion to a signal. For more
    curve algorithms check out [Tuna](https://github.com/Theodeus/tuna/blob/master/tuna.js#L1288)'s waveshaper algorithms
*/
const ctx = new (window.AudioContext || window.webkitAudioContext)()
const src = new AudioBufferSourceNode( ctx )
const gn = new GainNode(ctx, {gain:0.5})
const fft = new AnalyserNode( ctx )
const dis = new WaveShaperNode( ctx )
// as always, there's also the factory method...
// const dis = ctx.createWaveShaper()

function makeDistortionCurve(amount,rate) {
    let k = typeof amount === 'number' ? amount : 50
    let n_samples = rate || 44100
    let curve = new Float32Array(n_samples)
    let deg = Math.PI / 180
    let i = 0
    let x
    for ( ; i < n_samples; ++i ) {
        x = i * 2 / n_samples - 1
        curve[i] = ( 3 + k ) * x * 20 * deg / ( Math.PI + k * Math.abs(x) )
    }
    return curve
}

dis.curve = makeDistortionCurve(300,ctx.sampleRate)
dis.oversample = '4x'
/*
    'none' Do not perform any oversampling (default)
    '2x'   Double the amount of samples before applying the shaping curve
    '4x'   Multiply by 4 the amount of samples before applying the shaping curve
*/

src.connect(dis)
dis.connect(gn)
gn.connect(fft)
fft.connect(ctx.destination)

fetch('ex/media/heart_grenade.mp3')
.then(res => res.arrayBuffer() )
.then(data => {
    ctx.decodeAudioData(data, (buffer)=>{
        src.buffer = buffer
        src.start()
    })
}).catch(err => { console.error(err) })

createWaveCanvas({element:'section', analyser:fft })
