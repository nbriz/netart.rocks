/*

*/



function pickRandom(arr){ return arr[ Math.floor(Math.random()*arr.length) ] }

function algoReverb( seconds, decay, reverse ){
    let rate = ctx.sampleRate
    let length = rate * seconds
    let impulse = ctx.createBuffer(2, length, rate)
    let impulseL = impulse.getChannelData(0)
    let impulseR = impulse.getChannelData(1)
    let n, i
    for (i = 0; i < length; i++) {
        n = (reverse) ? length-i : i
        impulseL[i] = (Math.random()*2 - 1) * Math.pow( 1 - n/length, decay)
        impulseR[i] = (Math.random()*2 - 1) * Math.pow( 1 - n/length, decay)
    }
    return impulse
}

function makeDistortionCurve(amount,rate) {
    let k = typeof amount === 'number' ? amount : 50
    let n_samples = rate || 44100
    let curve = new Float32Array(n_samples)
    let deg = Math.PI / 180
    let i = 0
    let x
    for ( ; i < n_samples; ++i ) {
        x = i * 2 / n_samples - 1
        curve[i] = ( 3 + k ) * x * 20 * deg / ( Math.PI + k * Math.abs(x) )
    }
    return curve
}

// this function creates a table of Harmonic Fileds, try it in the console
function createHarmonicField(root,mode,includeOctave){
    // create scale
    let scale = new Melody(root,mode).getNoteMode(null,includeOctave)
    // chord pattern for harmonic field
    let chs = ['maj7','min7','min7','maj7','7','min7','min7']
    if(includeOctave) chs.push('maj7')
    // depending on mode, scale might be shorter/longer than 7,8
    let arr = (chs.length>scale.length) ? scale : chs
    // create harmonic field (table of chords per degree in scale)
    let table = []
    for (let n = 0; n < arr.length; n++) {
        table.push( new Chord(scale[n],chs[n]) )
    }
    return table
}

let root = pickRandom( new Note().notes )
// let oct = pickRandom( [3,4] )
let mode = pickRandom( Object.keys(new Melody().modes) )
// create harmonic field from randomly chosen root/mode
let hf = createHarmonicField(root+3,mode,true)
// chord progression made of randomly chosen chords from the harmonic field
let prog = []
for (let i = 0; i < 8; i++) prog.push( pickRandom(hf) )
console.log(`composition in ${root}3 ${mode}`)

const ctx = new (window.AudioContext || window.webkitAudioContext)()
const fft = new AnalyserNode( ctx )
const tetrad = new PolyOsc( ctx, 4 ) // 4 for tetrad
const osc = new OscillatorNode( ctx )
const lvl = new GainNode( ctx, {gain:0})
// fx
const rev = new ConvolverNode(ctx)
rev.buffer = algoReverb(0.25,8,true)
const dis = new WaveShaperNode( ctx )
dis.curve = makeDistortionCurve(500,ctx.sampleRate)
dis.oversample = '4x'
const bqf = new BiquadFilterNode( ctx, {
    type:'lowpass', frequency:279, gain:17, Q:1.9
})
const del = new DelayNode(ctx, { delayTime:0.25 })

// this demo has a bit more going on than the simple ones
// lets introduce a compressor to keep things from clipping
const comp = new DynamicsCompressorNode(ctx, {
    threshold:-50, knee:40, ratio:12,
    attack:0, release:0.25
})

tetrad.connect(dis)
dis.connect(bqf)
bqf.connect(comp)

osc.connect(lvl)
lvl.connect(rev)
lvl.connect(del)
del.connect(rev)
rev.connect(comp)
osc.start()

comp.connect(fft)
fft.connect(ctx.destination)



let halfCount = 0
const seq = new Sequencer( ctx, {
    tempo: 100,
    bars:4,
    sixteenth:function(time){
        let t = (60/this.tempo)/4 // how many seconds between 16th notes
        // get root note of current chord
        let n = new Note( prog[halfCount].getNoteChord()[0] )
        // transpose it
        n = n.note + (n.octave+1)
        // get that note's scale (given current mode)
        let arp = new Melody(n,mode).getNoteMode(null,true)
        // pick note for arpeggio
        let note = arp[this.current16thNote%arp.length]
        let freq = new Note().note2freq[note]
        // console.log(note)
        osc.frequency.setValueAtTime(freq,time)
        // play it!
        adsr({
            param: lvl.gain, value: [ 0.7, 0.6 ], startTime: time,
            a:t*0.2, d:t*0.1, s:t*0.4, r:t*0.2
        })
    },
    half:function(time){
        let t = (60/this.tempo)*2 // how many seconds between half notes

        // console.log( prog[halfCount].getNoteChord() ) // chord as note array
        let fArr =   prog[halfCount].getFreqChord() // chord as freq array
        tetrad.set(fArr) // use freq array to update PolyOsc

        // play it!
        adsr({ // ...by applying adsr to the PolyOsc's output node
            param:tetrad.output.gain,
            startTime:time, value:[1,0.75],
            a:t*0.2, d:t*0.1, s:t*0.4, r:t*0.2
        })
        halfCount++
        if(this.current16thNote==8 && this.currentBar==3) halfCount=0
    }
})

function loop(){
    requestAnimationFrame(loop)
    if(seq.isPlaying) seq.update()
} loop()

createWaveCanvas({element:'section', analyser:fft })

// ------------------------------------------------------------------------- gui
const gui = new dat.GUI()
gui.add( seq, 'tempo', 50, 200)
gui.add( seq, 'toggle').name('play/stop')
gui.add( location, 'reload').name('new comp')
