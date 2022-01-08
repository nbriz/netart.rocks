/*
    you can use the AudioBufferSourceNode's [playbackRate](https://developer.mozilla.org/en-US/docs/Web/API/AudioBufferSourceNode/playbackRate) parameter to adjust the
    playback rate. this is an AudioParam, so you can schedule changes like any
    other (see notes on AudioParams)
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
    ctx.decodeAudioData(data, (buffer)=>{
        src.buffer = buffer
        src.start()

        // schedule playbackRate param changes
        src.playbackRate.setValueAtTime( 2, ctx.currentTime + 2.4)
        src.playbackRate.linearRampToValueAtTime( 1, ctx.currentTime + 3 )
        src.playbackRate.setValueAtTime( 1, ctx.currentTime + 3.1)

        src.playbackRate.setValueAtTime( 2, ctx.currentTime + 6.6)
        src.playbackRate.setValueAtTime( 1, ctx.currentTime + 7.5)
        src.playbackRate.setValueAtTime( 0.5, ctx.currentTime + 8.1) // "it's"
        src.playbackRate.linearRampToValueAtTime( 1.5, ctx.currentTime + 9)

        src.playbackRate.setValueAtTime( 1.5, ctx.currentTime + 12.8)// "haaaaard"
        src.playbackRate.linearRampToValueAtTime( 0.5, ctx.currentTime + 13.1)

        src.playbackRate.setValueAtTime( 0.5, ctx.currentTime + 15)
        src.playbackRate.setValueAtTime( 10, ctx.currentTime + 15.2)
        src.playbackRate.setValueAtTime( 0.1, ctx.currentTime + 15.4)
        src.playbackRate.setValueAtTime( 10, ctx.currentTime + 15.8)
        src.playbackRate.linearRampToValueAtTime( 0.1, ctx.currentTime + 17)

        src.playbackRate.setValueAtTime( 0.1, ctx.currentTime + 23)
        src.playbackRate.linearRampToValueAtTime( 50, ctx.currentTime + 24)

    })
})
.catch(err => { console.error(err) })
