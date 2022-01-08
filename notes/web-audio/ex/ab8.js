/*
   load buffer from file using [XMLHttpRequest](https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest)
*/
const ctx = new (window.AudioContext || window.webkitAudioContext)()
const fft = new AnalyserNode( ctx )
const src = new AudioBufferSourceNode( ctx )
const gn = new GainNode(ctx, {gain:0.5})

src.connect(gn)
gn.connect(fft)
fft.connect(ctx.destination)

createWaveCanvas({element:'section', analyser:fft })

let req = new XMLHttpRequest()
req.open('get', 'ex/media/heart_grenade.mp3', true)
req.responseType = 'arraybuffer'
req.onload = function() {
    // use the AudioContext's [decodeAudioData](https://developer.mozilla.org/en-US/docs/Web/API/BaseAudioContext/decodeAudioData) method to decode
    // the audio data contained in the buffer
    ctx.decodeAudioData(req.response, function(buffer) {
        // set the BufferSourceNode's buffer to the decoded buffer
        src.buffer = buffer
        // now you can play the audio
        src.start()
    })
}
req.onerror = function(err){ console.err(err) }
req.send()
