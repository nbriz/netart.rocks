/*
    Below we have an PolyOsc class, which creates contains a series of
    oscillatorshas all connected to a single "output" node. it also has a .set()
    method which takes a chord (ie. array of frequencies) to set the internal
    array of oscillators.

    There is also a createHarmonicField fucntion which given a root note and
    mode (scale) it will return a table of chords corresponding to the root
    note's [harmonic field](http://www.simplifyingtheory.com/tonality-harmonic-fields/)
*/
class PolyOsc {
    constructor(audioContext,amount){
        this.actx = audioContext
        this.notes = []
        // create oscillators
        amount = amount || 3
        for (let i = 0; i < amount; i++) this.notes.push({
            osc:new OscillatorNode( this.actx ),
            lvl:new GainNode( this.actx, {gain:1/amount})
        })
        // connect oscillators
        this.output = new GainNode(this.actx, {gain:0})
        for (let n = 0; n < this.notes.length; n++) {
            this.notes[n].osc.connect( this.notes[n].lvl )
            this.notes[n].lvl.connect( this.output )
            this.notes[n].osc.start()
        }
    }
    connect(){ this.output.connect(...arguments) }
    disconnect(){ this.output.disconnect(...arguments) }
    set(freqArray){
        for (let n = 0; n < this.notes.length; n++) {
            let freq = freqArray[n] || freqArray[0]
            this.notes[n].osc.frequency.value = freq
        }
    }
}

// this function creates a table of Harmonic Fileds, try it in the console
function createHarmonicField(root,mode){
    let oct1 = new Melody(root+'4',mode).getNoteMode()
    let oct2 = new Melody(root+'5',mode).getNoteMode()
    let scale = [...oct1,...oct2]
    let table = []
    for (let n = 0; n < 8; n++) {
        let root  = scale[n+0]
        let third = scale[(n+2)%scale.length]
        let fifth = scale[(n+4)%scale.length]
        table.push( [root,third,fifth] )
    }
    return table
}

// ----------------------------------------------------------------------- setup

let set = {
    n:new Note().notes, m:Object.keys(new Melody().modes),
    root:'C', mode:'major'
}
// create harmonic field
let hf = createHarmonicField(set.root,set.mode)

const ctx = new (window.AudioContext || window.webkitAudioContext)()
const fft = new AnalyserNode( ctx )
const poly = new PolyOsc( ctx, 3 ) // 3 for triad
poly.connect(fft)
fft.connect(ctx.destination)

const seq = new Sequencer( ctx, {
    tempo: 100,
    bars:2,
    quarter:function(time){
        let t = (60/this.tempo) // how many seconds between quarter notes
        let index = (this.current16thNote/4) + (this.currentBar*4)
        if(!hf[index]) index = hf.length-1
        console.log(hf[index]) // current chord (as noteString array)...
        // convert array of note strings to array of frequencies
        let fArr = hf[index].map(n=>new Note().note2freq[n])
        poly.set(fArr) // use freq array to update PolyOsc
        // play it!
        adsr({ // ...by applying adsr to the PolyOsc's output node
            param:poly.output.gain,
            startTime:time, value:[1,0.75],
            a:t*0.2, d:t*0.1, s:t*0.4, r:t*0.2
        })
    }
})

function loop(){
    requestAnimationFrame(loop)
    if(seq.isPlaying) seq.update()
} loop()

createFrequencyCanvas({element:'section', analyser:fft, scale: 2000/60 })

// ------------------------------------------------------------------------- gui
const gui = new dat.GUI()
gui.add( seq, 'tempo', 50, 200)
gui.add( seq, 'toggle').name('play/stop')
gui.add( set, 'root', set.n ).onChange(v=>hf=createHarmonicField(v,set.mode))
gui.add( set, 'mode', set.m ).onChange(v=>hf=createHarmonicField(set.root,v))
