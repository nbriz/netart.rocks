/*
    in this [ConvolverNode](https://developer.mozilla.org/en-US/docs/Web/API/ConvolverNode) example we're going to use the [BufferLoader](ex/helpers/BufferLoader.js) helper
    to load a few different files. Similar to the DelayNode example we'll pass
    the AudioSource to a "dry" gain, as well as to the ConvolverNode && then to
    a "wet" gain, so we can adjust how much reverb we want, see the reverbAmount()
    function below.
*/
const ctx = new (window.AudioContext || window.webkitAudioContext)()
const src = new AudioBufferSourceNode( ctx )
const fft = new AnalyserNode( ctx )
const dry = new GainNode(ctx, {gain:0.5})
const wet = new GainNode(ctx, {gain:0.5})
const rev = new ConvolverNode(ctx)

src.connect(dry)
dry.connect(fft)

src.connect(rev)
rev.connect(wet)
wet.connect(fft)

fft.connect(ctx.destination)

// going to be using the BufferLoader helper as we've got lots of files to load
const bl = new BufferLoader(ctx, [
    'ex/media/katy.ogg',
    impulseResponse, // this is a base64 string included in "base64_impulse.js"
    'ex/impulse/reverb1.wav',
    'ex/impulse/reverb2.wav',
    'ex/impulse/reverb3.wav',
    'ex/impulse/reverb4.wav',
    'ex/impulse/reverb5.wav',
    'ex/impulse/reverb6.wav',
],(b)=>{
    src.buffer = b[0]
    rev.buffer = b[1]
    // we'll start by assigning the impulseResponse base64 string as our reverb
    // buffer, but all the other buffers have been loaded into bl.buffers, so
    // try changing the reverb "type" in the console by assigning a different
    // buffer like so: rev.buffer = bl.buffers[2]
    src.start()
})

// try this out in the console,
// it adjusts the wet/dry gain to reflect the amount of reverb we want
function reverbAmount(v){
    if( v > 1 ) v = 1
    wet.gain.setValueAtTime(v,ctx.currentTime)
    dry.gain.setValueAtTime(1.0-v,ctx.currentTime)
}

createWaveCanvas({element:'section', analyser:fft })
