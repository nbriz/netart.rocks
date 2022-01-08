/*
   here's a frequency bar example useing the freq-canvas.js helper
*/

const ctx = new (window.AudioContext || window.webkitAudioContext)()
const src = new AudioBufferSourceNode( ctx )
const fft = new AnalyserNode( ctx )
const gn = new GainNode(ctx, {gain:0.75})

src.connect(gn)
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

createFrequencyCanvas({
    element:'section',
    analyser:fft,
    scale:5,
    color:'cyan'
})
