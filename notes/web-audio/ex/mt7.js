/*
    the [Melody.js](ex/helpers/Melody.js) helper class (which extends the [Note.js](ex/helpers/Note.js) helper class) has a
    bunch of pre-defined modes (including the ones in the previous examples). it
    also has utility functions for adding new modes and creating random modes
    (see below), as well as .getMode() which returns an array of of degrees
    (ie. steps from root note, rather individual steps) .getFreqMode() which
    returns an array of frequencies of that mode and .getNoteMode() which
    returns an array of note strings for that mode.
*/
let mel = new Melody()
// you can add custom modes to the Melody instance like so:
mel.addMode('nickfunk1',[3, 2, 2, 3, 2, 3, 2])
mel.addMode('nickfunk2',[3, 2, 1, 1, 3, 2, 3, 2, 1])
// you can create a random mode like this
let ran = mel.createMode()
mel.addMode('random',ran)

const ctx = new (window.AudioContext || window.webkitAudioContext)()
const osc = new OscillatorNode( ctx, {frequency:mel.freq})
const lvl = new GainNode( ctx, {gain:0.75})
osc.connect(lvl)
lvl.connect(ctx.destination)

let play
let max = 8, d = 0 // degree, ie. current note (count/beat) in the scale
let canvas = createMelodyCanvas({
    element:'section',
    melody: mel.getMode(null,true),
    note:mel
})

function playScale(){
    play = setTimeout(playScale, 250)
    max = mel.getMode(null,true).length

    canvas.update({
        degree:d // note to be highlighted
    })

    osc.frequency.value = mel.getFreqMode(null,true)[d]

    d++; if(d>=max) d=0 // loop count 0-7
}

// gui -------------------------------------------------------------------------
const gui = new dat.GUI()
const notes = ["A", "A#", "B","C", "C#", "D", "D#", "E", "F", "F#", "G", "G#"]
gui.add( mel, 'note', notes)
    .onChange((val)=>{
        let oc = (notes.indexOf(val)>2) ? 5 : 4
        mel.note = val+oc
        canvas.update({note:mel})
    })

gui.add( mel, 'mode', Object.keys(mel.modes))
    .onChange((val)=>{
        canvas.update({melody:mel.getMode(null,true)})
    })

gui.add( mel, 'tuning', ['just','equal'])
    .onChange(() => {
        canvas.update({tuning:mel.tuning})
    })

let btn = gui.add( osc, 'start').onChange(() => {
    playScale()
    btn.remove()
    btn = gui.add( osc, 'stop').onChange(() => {
        btn.remove()
        clearInterval(play)
        canvas.update({})
    })
})
