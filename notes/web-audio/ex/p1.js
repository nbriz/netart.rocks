/*
    the [DelayNode](https://developer.mozilla.org/en-US/docs/Web/API/DelayNode) is another audio-processing module which does as the name implies.
    In order for it to sound like a delay, u need to hear both the original (dry)
    audio as well as the delayed (wet) audio. so we'll connect the AudioSource
    to a "dry" GainNode as well as to the DelayNode, which itself is connected
    to a "wet" GainNode
*/
const ctx = new (window.AudioContext || window.webkitAudioContext)()
const src = new AudioBufferSourceNode( ctx )
const fft = new AnalyserNode( ctx )
const dry = new GainNode(ctx, {gain:0.5})
const wet = new GainNode(ctx, {gain:0.5})
const del = new DelayNode(ctx, {maxDelayTime:5, delayTime:0.25})
// as always, there's also the factory method...
// const dl = ctx.createDelay(5)
//       dl.delayTime.value = 0.25

src.connect(dry)
dry.connect(fft)

src.connect(del)
del.connect(wet)
wet.connect(fft)

fft.connect(ctx.destination)

fetch('ex/media/katy.ogg')
.then(res => res.arrayBuffer() )
.then(data => {
    ctx.decodeAudioData(data, (buffer)=>{
        src.buffer = buffer
        src.start()
    })
}).catch(err => { console.error(err) })

createWaveCanvas({element:'section', analyser:fft })
