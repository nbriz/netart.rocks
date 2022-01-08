/*
   here's a basic example of how to draw the entire waveform of an audio file
*/

const ctx = new (window.AudioContext || window.webkitAudioContext)()
const src = new AudioBufferSourceNode( ctx )
const gn = new GainNode(ctx, {gain:0.75})

src.connect(gn)
gn.connect(ctx.destination)

fetch('ex/media/heart_grenade.mp3')
.then(res => res.arrayBuffer() )
.then(data => {

    ctx.decodeAudioData(data, (buffer)=>{
        src.buffer = buffer
        src.start()

        // see source code for buffer-canvas.js for how this works
        createBufferCanvas({
            element:'section',
            buffer:buffer,
            scale:0.5
        })
    })

}).catch(err => { console.error(err) })
