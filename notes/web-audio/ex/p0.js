/*
    some AudioNodes like the [GainNode](https://developer.mozilla.org/en-US/docs/Web/API/GainNode) are "audio-processing" nodes rather than a
    "source-node", which means it goes inbetween a source-node and a destination.
    In this example the AudioBufferSourceNode is connected to the same GainNode,
    which is scaling the voluem down by 0.75
*/
const ctx = new (window.AudioContext || window.webkitAudioContext)()
const src = new AudioBufferSourceNode( ctx )
const fft = new AnalyserNode( ctx )
const gn = new GainNode(ctx, {gain:0.75})

src.connect(gn)
gn.connect(fft)
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
