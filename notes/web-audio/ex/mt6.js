/*
    similar demo to the one before, except this time with natural, [melodic](http://www.simplifyingtheory.com/melodic-minor-scale/) and
    [harmonic](http://www.simplifyingtheory.com/harmonic-minor-scale/) modes.
*/

let mode = {type:'natural-minor'}
let note = new Note()
const modes = {
    'natural-major':  [2, 2, 1 ,2, 2, 2, 1], // aka ionian
    'natural-minor':  [2, 1, 2, 2, 1, 2, 2], // aka aeolian
    'harmonic-minor': [2, 1, 2, 2, 1, 3, 1],
    'melodic-minor':  [2, 1, 2, 2, 2, 2, 1]
}

function deg2step(degree,mode){
    let steps = 0 // how many steps from root is the given degree
    for (let i = 0; i < degree; i++) steps += mode[i]
    return steps
}

function mode2melody(mode,includeOctave){
    let melody = []
    for (let degree = 0; degree < mode.length; degree++) {
        let steps = 0
        for (let s = 0; s < degree; s++) steps += mode[s]
        melody.push(steps)
    }
    if(includeOctave) melody.push(12)
    return melody
}

const ctx = new (window.AudioContext || window.webkitAudioContext)()
const osc = new OscillatorNode( ctx, {frequency:note.freq})
const lvl = new GainNode( ctx, {gain:0.75})
osc.connect(lvl)
lvl.connect(ctx.destination)

let play
let d = 0 // degree, ie. current note (count/beat) in the scale
let canvas = createMelodyCanvas({
    element:'section',
    melody: mode2melody( modes[mode.type], true ),
    note:note
})

function playScale(){
    play = setTimeout(playScale, 250)

    canvas.update({
        degree:d // note to be highlighted
    })

    let s = deg2step(d,modes[mode.type])
    osc.frequency.value = note.step(s).freq

    d++; if(d>=8) d=0 // loop count 0-7
}



// gui -------------------------------------------------------------------------
const gui = new dat.GUI()
const notes = ["A", "A#", "B","C", "C#", "D", "D#", "E", "F", "F#", "G", "G#"]
gui.add( note, 'note', notes)
    .onChange((val)=>{
        let oc = (notes.indexOf(val)>2) ? 5 : 4
        note.note = val+oc
        canvas.update({note:note})
    })

gui.add( mode, 'type', Object.keys(modes))
    .onChange((val)=>{
        canvas.update({ melody:mode2melody(modes[val],true) })
    })

gui.add( note, 'tuning', ['just','equal'])
    .onChange(() => { canvas.update({tuning:note.tuning}) })

let btn = gui.add( osc, 'start').onChange(() => {
    playScale()
    btn.remove()
    btn = gui.add( osc, 'stop').onChange(() => {
        btn.remove()
        clearInterval(play)
        canvas.update({})
    })
})
