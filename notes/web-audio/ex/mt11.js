/*
TODO: http://www.simplifyingtheory.com/perfect-imperfect-plagal-deceptive-half-cadence/
*/


// this function creates a table of Harmonic Fileds, try it in the console
function createHarmonicField(root,mode,includeOctave){
    // create scale
    let scale = new Melody(root,mode).getNoteMode(null,includeOctave)
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

// create an array of indexes (degrees) to be pulled from a harmonic field
// TODO create random variation by passing 'random' to index,invIndex
function createCadence(cadence, index, invIndex){
    let hf = { // harmonic functions, in array of degrees
        'tonic': [1,3,6], // feeling of rest, stability, conclusion
        'dominant':[5,7], // instability, tension, prepares for the tonic
        'subdominant':[2,4] // inbetween the two, feel less intense
    }
    let cadences = {
        'perfect':[
            [ hf.dominant[0], hf.tonic[0] ],
            [ hf.subdominant[0], hf.dominant[0], hf.tonic[0] ], //aka authentic
            [ hf.subdominant[1], hf.dominant[0], hf.tonic[0] ], //aka authentic
        ],
        'imperfect':[
            [ hf.dominant[0], hf.tonic[0] ],
            [ hf.dominant[1], hf.tonic[0] ]
        ],
        'plagal':[
            [ hf.subdominant[0], hf.tonic[0] ],
            [ hf.subdominant[1], hf.tonic[0] ],
        ],
        'deceptive':[
            [ hf.dominant[0], hf.subdominant[0] ],
            [ hf.dominant[0], hf.subdominant[1] ]
        ]
    }
    let inversions = {
        'perfect':[],
        'imperfect':[ [1,0],[0,1],[1,1] ],
        'plagal':[ [1,0],[0,1],[1,1] ],
        'deceptive':[]
    }

    let dArr = [], iArr = []
    let prog = cadences[ cadence||'perfect' ][ index||0 ]
    let invr = inversions[ cadence||'perfect' ][ invIndex||0 ]
    for (let i = 0; i < prog.length; i++) {
        dArr.push( prog[i]-1 ) // -1, convert degrees to indexes
        if(typeof invr!=="undefined") iArr.push( invr[i] )
        else iArr.push( false )
    }

    return {
        degrees:dArr,
        inversions:iArr
    }
}

// ----------------------------------------------------------------------- setup

let set = {
    n:new Note().notes, m:Object.keys(new Melody().modes),
    root:'C', mode:'major', chordType:'triad',
    cadence:'perfect', version:0
}
// create harmonic field (returns table of Chord.js instances)
let hf = createHarmonicField(set.root,set.mode,set.chordType)
// create the cadence (chord progression), returns array of indexes
let ca = createCadence()

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
        let index = this.current16thNote/4

        let degree = ca.degrees[index]
        let invert = ca.inversions[index]

        console.log(degree,invert)

        if(typeof degree=="number"){

            console.log( hf[degree].getNoteChord(null,null,invert) )
            let fArr =   hf[degree].getFreqChord(null,null,invert)

            let poly = (set.chordType=='triad') ? triad : tetrad
                poly.set(fArr) // use freq array to update PolyOsc

            fArr.forEach(freq=>{ // play it!
                adsr({ // ...by applying adsr to the PolyOsc's output node
                    param:poly.output.gain,
                    startTime:time, value:[1,0.75],
                    a:t*0.2, d:t*0.1, s:t*0.4, r:t*0.2
                })
            })
        }
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
// -------- cadence gui stuff ---------
let cads = ['perfect','imperfect']
function version2indexes(cadence,num){
    // if(cadenc)
}
gui.add( set, 'cadence', cads )
  .onChange(v=>{

      let indexes
      gui.remove(cIdx)
      switch (v) {
          case 'perfect': indexes=[0,1,2]; break;
          case 'imperfect': indexes=[0,1]; break;
      }
      cIdx = gui.add( set, 'version', indexes )
             .onChange(v=>ca=createCadence(set.cadence,v))


  })
let cIdx = gui.add( set, 'version', [0,1,2] )
           .onChange(v=>ca=createCadence(set.cadence,v))
let iIdx = gui.add( set, 'inversionIndex', [0,1,2] )
           .onChange(v=>ca=createCadence(set.cadence,v))
