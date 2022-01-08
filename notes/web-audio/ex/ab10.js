/*
    you can use the AudioBufferSourceNode's loopStart and loopEnd options if the
    loop option is set to true. these are second offsets. Try editing the values
    in the JavaScript Console, ex: src.loopEnd += 0.1
    ...and if it's getting annoying: src.stop()
*/

const ctx = new (window.AudioContext || window.webkitAudioContext)()
const fft = new AnalyserNode( ctx )

const src = new AudioBufferSourceNode( ctx, {
    loop:true,
    loopStart: 6, // in-point offset
    loopEnd: 6.5 // out-point offset
})

const gn = new GainNode(ctx, {gain:0.5})

src.connect(gn)
gn.connect(fft)
fft.connect(ctx.destination)

createWaveCanvas({element:'section', analyser:fft })

fetch('ex/media/heart_grenade.mp3')
.then(res => res.arrayBuffer() )
.then(data => {
    ctx.decodeAudioData(data, (buffer)=>{
        src.buffer = buffer
        // second argument passed to start is an offset value
        // this should match the loopStart option in src's constructor
        src.start( ctx.currentTime, 6 )
    })
})
.catch(err => { console.error(err) })
