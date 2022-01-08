/*
    In this example, rather than algorithmically creating a harmonic field
    from a root note and mode, we're using the chord formula to acheive the
    same result: I7M   IIm7   IIIm7   IV7M   V7   VIm7   VIIm(b5)
    (where the roman numerals correspond to the note/degree in the mode/scale)

    In order to do this we'll be using the Chord.js class, which given a
    note string and a chord string can create arrays of values corresponding
    to the desired chord. We've also abstracted away the PolyOsc class into
    it's own helper file.
*/


// this function creates a table of Harmonic Fileds, try it in the console
function createHarmonicField(root,mode,includeOctave){
    // create scale
    let scale = new Melody(root,mode).getNoteMode(mode,includeOctave)
    // chord pattern for harmonic field
    let chs = ['maj7','min7','min7','maj7','7','min7','min7']
    if(includeOctave) chs.push('maj7')
    // create harmonic field (table of chords per degree in scale)
    let table = []
    for (let n = 0; n < scale.length; n++) {
        table.push( new Chord(scale[n],chs[n]) )
    }
    return table
}

// ----------------------------------------------------------------------- setup

let set = { // settings object for dat.gui
    n:new Note().notes, m:Object.keys(new Melody().modes),
    root:'C', mode:'major', chordType:'triad'
}
// create harmonic field (now returns table of Chord.js instances)
let hf = createHarmonicField(set.root,set.mode,set.chordType)

const ctx = new (window.AudioContext || window.webkitAudioContext)()
const fft = new AnalyserNode( ctx )
const triad = new PolyOsc( ctx, 3 ) // 3 for triad
const tetrad = new PolyOsc( ctx, 4 ) // 4 for tetrad
triad.connect(fft)
tetrad.connect(fft)
fft.connect(ctx.destination)

const seq = new Sequencer( ctx, {
    tempo: 100,
    bars:2,
    quarter:function(time){
        let t = (60/this.tempo) // how many seconds between quarter notes
        let index = (this.current16thNote/4) + (this.currentBar*4)
        if(!hf[index]) index = hf.length-1

        console.log( hf[index].getNoteChord() ) // chord as note array
        let fArr =   hf[index].getFreqChord() // chord as freq array

        let poly = (set.chordType=='triad') ? triad : tetrad
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
gui.add( set, 'root', set.n )
   .onChange(v=>hf=createHarmonicField(v,set.mode,set.chordType))
gui.add( set, 'mode', set.m )
   .onChange(v=>hf=createHarmonicField(set.root,v,set.chordType))
gui.add( set, 'chordType', ['triad','tetrad'] )
   .onChange(v=>hf=createHarmonicField(set.root,set.mode,v))
