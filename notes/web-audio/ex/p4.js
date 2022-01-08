/*
    in this [ConvolverNode](https://developer.mozilla.org/en-US/docs/Web/API/ConvolverNode) example we're going to create our own impulse buffer from
    scratch algorithmically. the algoReverb() example borrows code from Nick
    Thompson's [simple-reverb](https://github.com/web-audio-components/simple-reverb) repo.

    you can try different values for seconds, decay && reverse (boolean) in the
    console like so: rev.buffer = algoReverb( 1.5, 3, false )
*/
const ctx = new (window.AudioContext || window.webkitAudioContext)()
const src = new AudioBufferSourceNode( ctx )
const fft = new AnalyserNode( ctx )
const gn  = new GainNode(ctx, {gain:0.75})
const rev = new ConvolverNode(ctx)

src.connect(rev)
rev.connect(gn)
gn.connect(fft)
fft.connect(ctx.destination)

function algoReverb( seconds, decay, reverse ){
    let rate = ctx.sampleRate
    let length = rate * seconds
    let impulse = ctx.createBuffer(2, length, rate)
    let impulseL = impulse.getChannelData(0)
    let impulseR = impulse.getChannelData(1)
    let n, i
    for (i = 0; i < length; i++) {
        n = (reverse) ? length-i : i
        impulseL[i] = (Math.random()*2 - 1) * Math.pow( 1 - n/length, decay)
        impulseR[i] = (Math.random()*2 - 1) * Math.pow( 1 - n/length, decay)
    }
    return impulse
}

fetch('ex/media/katy.ogg')
.then(res => res.arrayBuffer() )
.then(data => {
    ctx.decodeAudioData(data, (buffer)=>{
        src.buffer = buffer
        rev.buffer = algoReverb(3,2,true)
        src.start()
    })
}).catch(err => { console.error(err) })


createWaveCanvas({element:'section', analyser:fft })
