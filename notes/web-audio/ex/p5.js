/*
    the [BiquadFilterNode](https://developer.mozilla.org/en-US/docs/Web/API/BiquadFilterNode) is an audio processing module used to create filters which
    can be used for things like tone control and graphic equalizers.

    In this example we're using the [FilterGUI](ex/helpers/FilterGUI.js) helper to more easily modify the
    BiquadFilterNode's parameters. Adjusting the "type" dropdown to "highpass" is
    the equivalent of doing:

        bqf.type = "highpass"

    and adjusting any of the other properties, for example setting the frequency
    to 800, is the euquivalent of doing something like:

        bqf.frequency.setValueAtTime( 800, ctx.currentTime)
*/
const ctx = new (window.AudioContext || window.webkitAudioContext)()
const src = new AudioBufferSourceNode( ctx )
const gn = new GainNode(ctx, {gain:0.5})
const fft = new AnalyserNode( ctx )
const bqf = new BiquadFilterNode( ctx )
// as always, there's also the factory method...
// const bqf = ctx.createBiquadFilter()

const gui = new FilterGUI(ctx, bqf)

src.connect(bqf)
bqf.connect(gn)
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
