/*
   load buffer from file using [Fetch](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API)
*/
const ctx = new (window.AudioContext || window.webkitAudioContext)()
const fft = new AnalyserNode( ctx )
const src = new AudioBufferSourceNode( ctx )
const gn = new GainNode(ctx, {gain:0.5})

src.connect(gn)
gn.connect(fft)
fft.connect(ctx.destination)

createWaveCanvas({element:'section', analyser:fft })

fetch('ex/media/heart_grenade.mp3')
.then(res => res.arrayBuffer() )
.then(data => {
    // use the AudioContext's [decodeAudioData](https://developer.mozilla.org/en-US/docs/Web/API/BaseAudioContext/decodeAudioData) method to decode
    // the audio data contained in the buffer
    ctx.decodeAudioData(data, (buffer)=>{
        // set the BufferSourceNode's buffer to the decoded buffer
        src.buffer = buffer
        // now you can play the audio
        src.start()
    })
})
.catch(err => { console.error(err) })
